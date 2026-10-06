/**
 * İlan sayfası ayrıştırıcısı.
 *
 * Tasarım kararları ve gerekçeleri:
 *
 * 1. Hedef çalışma zamanı Cloudflare Workers'tır. Bu yüzden DOM kütüphanesi
 *    (jsdom, cheerio) ve Node'a özgü modül kullanılmaz; ayrıştırma saf metin
 *    işleme ve düzenli ifadelerle yapılır. Bu yaklaşım bir tarayıcı kadar
 *    doğru değildir, ama sonuç yöneticiye taslak olarak gösterildiği için
 *    "yaklaşık doğru" yeterlidir.
 * 2. Katmanlar sırayla denenir ve BİRLEŞTİRİLİR: json-ld > open-graph >
 *    microdata > metin. Bir alanı ilk dolduran katman kazanır, sonrakiler
 *    üzerine yazmaz. Hangi katmanın doldurduğu `provenance` içinde tutulur.
 * 3. Modül saftır: ağ, saat, rastgelelik veya modül düzeyinde değişen durum
 *    yoktur. Aynı HTML her zaman aynı sonucu verir.
 * 4. Çıkarılan metin düz metin olarak saklanacak olsa da savunma burada
 *    başlar: script/style blokları ve tüm etiketler (dolayısıyla `onclick`
 *    gibi olay öznitelikleri) atılır, varlıklar çözüldükten sonra kalan
 *    etiket kalıntıları ikinci kez temizlenir.
 */

import type {
  ListingCategory,
  ListingType,
  ParseResult,
  ParsedListing,
  ProvenanceSource,
} from "@/lib/import/types";

/* -------------------------------------------------------------------------
 * 1. Sınırlar. Sihirli sabit dağıtmamak için tek yerde toplanır.
 * ---------------------------------------------------------------------- */

const LIMITS = {
  titleMax: 200,
  descriptionMax: 4000,
  featureMax: 120,
  featureCount: 40,
  imageCount: 24,
  imageUrlMax: 1000,
  /** Gerçekçi olmayan fiyatları elemek için kaba aralık. */
  priceMin: 1_000,
  priceMax: 100_000_000_000,
  areaMin: 5,
  areaMax: 1_000_000,
  buildYearMin: 1900,
  buildYearMax: 2100,
  bedsMax: 40,
  bathsMax: 20,
  /** Metin sezgisi uygulanırken taranan azami karakter sayısı. */
  textScanMax: 400_000,
} as const;

const DEFAULT_CURRENCY = "TRY";

/* -------------------------------------------------------------------------
 * 2. Metin temizleme
 * ---------------------------------------------------------------------- */

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "-",
  mdash: "-",
  hellip: "...",
  laquo: "«",
  raquo: "»",
  bull: "-",
  middot: "·",
  euro: "€",
  pound: "£",
  deg: "°",
  sup2: "²",
  times: "x",
};

const ENTITY_PATTERN = /&(#[0-9]+|#x[0-9a-f]+|[a-z][a-z0-9]*);/gi;

/** HTML varlıklarını çözer. Tanınmayan varlık olduğu gibi bırakılır. */
function decodeEntities(value: string): string {
  return value.replace(ENTITY_PATTERN, (match, group: string) => {
    const token = group.toLowerCase();
    if (token.startsWith("#")) {
      const codePoint = token.startsWith("#x")
        ? Number.parseInt(token.slice(2), 16)
        : Number.parseInt(token.slice(1), 10);
      if (!Number.isFinite(codePoint) || codePoint <= 0 || codePoint > 0x10ffff) {
        return match;
      }
      // Kontrol karakterleri metne taşınmaz.
      if (codePoint < 0x20 && codePoint !== 0x09 && codePoint !== 0x0a) return " ";
      try {
        return String.fromCodePoint(codePoint);
      } catch {
        return match;
      }
    }
    return NAMED_ENTITIES[token] ?? match;
  });
}

const TAG_PATTERN = /<[^>]*>/g;
/** Satır sonu ve sekme dışındaki kontrol karakterleri. */
const CONTROL_PATTERN = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/g;

/**
 * Serbest metni güvenli düz metne indirger.
 * Etiketler önce atılır, varlıklar çözülür, sonra bir kez daha atılır:
 * `&lt;script&gt;` gibi kaçırılmış işaretlemenin geri dirilmesini engeller.
 */
function sanitizeText(value: string): string {
  return decodeEntities(value.replace(TAG_PATTERN, " "))
    .replace(TAG_PATTERN, " ")
    .replace(CONTROL_PATTERN, " ")
    .replace(/[^\S\n]+/g, " ")
    .replace(/[^\S\n]*\n[^\S\n]*/g, "\n")
    .trim();
}

/** Boş sonucu `undefined`'a çevirir, isteğe bağlı uzunluk sınırı uygular. */
function cleanText(value: string | undefined, maxLength?: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const cleaned = sanitizeText(value).replace(/\n+/g, " ").trim();
  if (cleaned.length === 0) return undefined;
  return maxLength !== undefined && cleaned.length > maxLength
    ? `${cleaned.slice(0, maxLength).trimEnd()}...`
    : cleaned;
}

const DANGEROUS_BLOCK_PATTERN =
  /<(script|style|noscript|template|svg|iframe|object|embed)\b[^>]*>[\s\S]*?<\/\1\s*>/gi;
const ORPHAN_DANGEROUS_TAG_PATTERN =
  /<\/?(?:script|style|noscript|template|svg|iframe|object|embed)\b[^>]*>/gi;
const COMMENT_PATTERN = /<!--[\s\S]*?-->/g;

/** Çalıştırılabilir ve görünmeyen blokları HTML'den söker. */
function removeDangerousBlocks(html: string): string {
  return html
    .replace(COMMENT_PATTERN, " ")
    .replace(DANGEROUS_BLOCK_PATTERN, " ")
    .replace(ORPHAN_DANGEROUS_TAG_PATTERN, " ");
}

const BLOCK_TAG_PATTERN =
  /<\/?(?:p|div|section|article|header|footer|main|aside|nav|ul|ol|li|table|thead|tbody|tr|td|th|dl|dt|dd|h[1-6]|br|hr|form|label|option|figure|figcaption|span)\b[^>]*>/gi;

/**
 * HTML'i satır yapısı korunmuş düz metne çevirir.
 * Blok etiketleri satır sonuna, kalan etiketler boşluğa dönüşür; böylece
 * "Oda Sayısı</td><td>4+1" gibi tablo hücreleri birbirine yapışmaz.
 */
function htmlToText(html: string): string {
  const withBreaks = html.replace(BLOCK_TAG_PATTERN, "\n");
  return sanitizeText(withBreaks)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");
}

/* -------------------------------------------------------------------------
 * 3. Türkçe duyarlı küçük harfe indirgeme
 *
 * `"KIRALIK".toLowerCase()` "kiralik" verir ve `/kiralık/i` bu metni
 * yakalamaz; ayrıca `"İ".toLowerCase()` iki karakter üretip dizin hizasını
 * bozar. Bu yüzden karakter başına birebir eşleyen kendi katlamamızı
 * kullanırız: `folded` ve `raw` aynı uzunluktadır, dolayısıyla `folded`
 * üzerinde bulunan bir eşleşme `raw` içinden özgün yazımıyla dilimlenebilir.
 * ---------------------------------------------------------------------- */

type FoldedText = {
  raw: string;
  folded: string;
};

function foldChar(character: string): string {
  if (character === "İ") return "i";
  if (character === "I") return "ı";
  const lower = character.toLowerCase();
  return lower.length === character.length ? lower : character;
}

function foldTurkish(value: string): string {
  let result = "";
  for (const character of value) result += foldChar(character);
  return result;
}

function createFoldedText(raw: string): FoldedText {
  const folded = foldTurkish(raw);
  // Katlama uzunluğu korur; yine de beklenmedik bir durumda hizayı bozmayalım.
  return folded.length === raw.length ? { raw, folded } : { raw, folded: raw };
}

/**
 * İki gruplu kalıplarda (1: önek, 2: değer) eşleşmeyi `raw` üzerinden diler.
 * Böylece "İl: İstanbul" içinden "İstanbul" özgün yazımıyla alınır.
 */
function matchRawValue(text: FoldedText, pattern: RegExp): string | undefined {
  const match = pattern.exec(text.folded);
  if (!match || match[1] === undefined || match[2] === undefined) return undefined;
  const start = match.index + match[1].length;
  return text.raw.slice(start, start + match[2].length);
}

const TURKISH_LETTER_PATTERN = /[a-zçğıöşüâîû]/;

function isLetterAt(folded: string, index: number): boolean {
  const character = folded.charAt(index);
  return character.length > 0 && TURKISH_LETTER_PATTERN.test(character);
}

/** Kelime sınırına saygılı arama. `\b` Türkçe harfleri tanımadığı için gerekir. */
function findWordIndex(folded: string, word: string): number {
  let index = folded.indexOf(word);
  while (index !== -1) {
    const before = index === 0 || !isLetterAt(folded, index - 1);
    const after = !isLetterAt(folded, index + word.length);
    if (before && after) return index;
    index = folded.indexOf(word, index + 1);
  }
  return -1;
}

/** Türkçe kurallarına göre baş harfi büyütür. */
function toTitleCaseTr(value: string): string {
  const folded = foldTurkish(value.trim());
  if (folded.length === 0) return "";
  const first = folded.charAt(0);
  const upper = first === "i" ? "İ" : first.toUpperCase();
  return upper + folded.slice(1);
}

/* -------------------------------------------------------------------------
 * 4. Sayı ayrıştırma
 * ---------------------------------------------------------------------- */

/**
 * "12.500.000", "12.500.000,50", "1250000.00" ve "310" biçimlerini okur.
 * Binlik ayracı nokta olan Türkçe yazımla, ondalık ayracı nokta olan makine
 * yazımını üç haneli grup kuralıyla ayırır.
 */
function parseNumericValue(raw: string): number | undefined {
  const cleaned = raw.replace(/[^\d.,]/g, "").trim();
  if (cleaned.length === 0) return undefined;

  const hasDot = cleaned.includes(".");
  const hasComma = cleaned.includes(",");
  let normalized = cleaned;

  if (hasDot && hasComma) {
    normalized =
      cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")
        ? cleaned.replace(/\./g, "").replace(/,/g, ".")
        : cleaned.replace(/,/g, "");
  } else if (hasComma) {
    normalized = /^\d{1,3}(,\d{3})+$/.test(cleaned)
      ? cleaned.replace(/,/g, "")
      : cleaned.replace(/,/g, ".");
  } else if (hasDot && /^\d{1,3}(\.\d{3})+$/.test(cleaned)) {
    normalized = cleaned.replace(/\./g, "");
  }

  const value = Number(normalized);
  return Number.isFinite(value) ? value : undefined;
}

function toBoundedInteger(
  value: number | undefined,
  min: number,
  max: number,
): number | undefined {
  if (value === undefined) return undefined;
  const rounded = Math.round(value);
  return rounded >= min && rounded <= max ? rounded : undefined;
}

function toBoundedNumber(
  value: number | undefined,
  min: number,
  max: number,
): number | undefined {
  if (value === undefined) return undefined;
  return value >= min && value <= max ? value : undefined;
}

/* -------------------------------------------------------------------------
 * 5. Taslak biriktirici
 * ---------------------------------------------------------------------- */

type Draft = {
  listing: ParsedListing;
  provenance: Record<string, ProvenanceSource>;
  warnings: string[];
};

type ImageCandidate = {
  url: string;
  source: ProvenanceSource;
};

/** Alanı yalnızca boşsa doldurur, ilk dolduran katman kazanır. */
function put<K extends keyof ParsedListing>(
  draft: Draft,
  key: K,
  value: ParsedListing[K] | undefined,
  source: ProvenanceSource,
): void {
  if (value === undefined) return;
  if (draft.listing[key] !== undefined) return;
  draft.listing[key] = value;
  draft.provenance[key] = source;
}

function addWarning(draft: Draft, message: string): void {
  if (!draft.warnings.includes(message)) draft.warnings.push(message);
}

/* -------------------------------------------------------------------------
 * 6. Adres doğrulama
 * ---------------------------------------------------------------------- */

/**
 * Yalnızca https görsellere izin verilir. `data:` şeması ve http adresleri
 * kabul edilmez; protokolsüz `//host/...` biçimi https'e yükseltilir.
 */
function normalizeImageUrl(raw: string, baseUrl?: string): string | undefined {
  const candidate = cleanText(raw, LIMITS.imageUrlMax);
  if (!candidate) return undefined;
  if (/^data:/i.test(candidate)) return undefined;

  const absolute = candidate.startsWith("//") ? `https:${candidate}` : candidate;
  let url: URL;
  try {
    url = baseUrl ? new URL(absolute, baseUrl) : new URL(absolute);
  } catch {
    return undefined;
  }
  if (url.protocol !== "https:") return undefined;
  return url.toString();
}

function sanitizeSourceUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
    url.username = "";
    url.password = "";
    return url.toString();
  } catch {
    return undefined;
  }
}

/* -------------------------------------------------------------------------
 * 7. JSON-LD katmanı
 * ---------------------------------------------------------------------- */

const JSON_LD_PATTERN =
  /<script\b[^>]*type\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script\s*>/gi;

const RELEVANT_JSON_LD_TYPES = new Set([
  "realestatelisting",
  "product",
  "offer",
  "residence",
  "apartment",
  "house",
  "singlefamilyresidence",
  "place",
  "accommodation",
  "apartmentcomplex",
  "suite",
  "land",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** İç içe düğümleri ve `@graph` dizilerini tek düzeye indirir. */
function flattenJsonLd(
  value: unknown,
  sink: Array<Record<string, unknown>>,
  depth = 0,
): void {
  if (depth > 6 || sink.length > 200) return;
  if (Array.isArray(value)) {
    for (const item of value) flattenJsonLd(item, sink, depth + 1);
    return;
  }
  if (!isRecord(value)) return;
  sink.push(value);
  for (const key of ["@graph", "mainEntity", "itemListElement", "item", "about"]) {
    if (key in value) flattenJsonLd(value[key], sink, depth + 1);
  }
}

function jsonLdTypes(node: Record<string, unknown>): string[] {
  const raw = node["@type"];
  const values = Array.isArray(raw) ? raw : [raw];
  return values
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.toLowerCase().replace(/^.*[/#]/, ""));
}

function coerceNumber(value: unknown, depth = 0): number | undefined {
  if (depth > 3) return undefined;
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "string") return parseNumericValue(value);
  if (Array.isArray(value)) {
    for (const item of value) {
      const parsed = coerceNumber(item, depth + 1);
      if (parsed !== undefined) return parsed;
    }
    return undefined;
  }
  if (isRecord(value)) {
    return coerceNumber(value["value"] ?? value["@value"] ?? value["minValue"], depth + 1);
  }
  return undefined;
}

function coerceString(value: unknown, depth = 0): string | undefined {
  if (depth > 3) return undefined;
  if (typeof value === "string") return cleanText(value);
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    for (const item of value) {
      const parsed = coerceString(item, depth + 1);
      if (parsed !== undefined) return parsed;
    }
    return undefined;
  }
  if (isRecord(value)) {
    return coerceString(value["name"] ?? value["@value"] ?? value["value"], depth + 1);
  }
  return undefined;
}

/** "4+1" gibi ifadelerde salonu saymadan yatak odası sayısını alır. */
function coerceRooms(value: unknown): { beds?: number; hasLivingRoom: boolean } {
  if (typeof value === "string") {
    const match = /(\d{1,2})\s*\+\s*(\d{1,2})/.exec(value);
    if (match) {
      return {
        beds: toBoundedInteger(Number(match[1]), 1, LIMITS.bedsMax),
        hasLivingRoom: true,
      };
    }
  }
  return {
    beds: toBoundedInteger(coerceNumber(value), 1, LIMITS.bedsMax),
    hasLivingRoom: false,
  };
}

function collectJsonLdImages(value: unknown, sink: string[], depth = 0): void {
  if (depth > 3 || sink.length >= LIMITS.imageCount) return;
  if (typeof value === "string") {
    sink.push(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectJsonLdImages(item, sink, depth + 1);
    return;
  }
  if (isRecord(value)) {
    collectJsonLdImages(value["url"] ?? value["contentUrl"] ?? value["@id"], sink, depth + 1);
  }
}

function readOffer(node: Record<string, unknown>): {
  price?: number;
  currency?: string;
  businessFunction?: string;
} {
  const raw = node["offers"];
  const candidates = Array.isArray(raw) ? raw : [raw];
  for (const candidate of candidates) {
    if (!isRecord(candidate)) continue;
    const specification = candidate["priceSpecification"];
    const price =
      coerceNumber(candidate["price"]) ??
      (isRecord(specification) ? coerceNumber(specification["price"]) : undefined);
    const currency =
      coerceString(candidate["priceCurrency"]) ??
      (isRecord(specification) ? coerceString(specification["priceCurrency"]) : undefined);
    const businessFunction = coerceString(candidate["businessFunction"]);
    if (price !== undefined || currency !== undefined || businessFunction !== undefined) {
      return { price, currency, businessFunction };
    }
  }
  return {};
}

function readFeatures(node: Record<string, unknown>): string[] {
  const raw = node["amenityFeature"];
  const candidates = Array.isArray(raw) ? raw : [raw];
  const features: string[] = [];
  for (const candidate of candidates) {
    const name = cleanText(coerceString(candidate), LIMITS.featureMax);
    if (name && !features.includes(name)) features.push(name);
    if (features.length >= LIMITS.featureCount) break;
  }
  return features;
}

const JSON_LD_BUSINESS_FUNCTIONS: Record<string, ListingType> = {
  "http://purl.org/goodrelations/v1#leaseout": "kiralik",
  "https://purl.org/goodrelations/v1#leaseout": "kiralik",
  "http://purl.org/goodrelations/v1#sell": "satilik",
  "https://purl.org/goodrelations/v1#sell": "satilik",
  leaseout: "kiralik",
  sell: "satilik",
};

function applyJsonLd(html: string, draft: Draft, images: ImageCandidate[]): void {
  const nodes: Array<Record<string, unknown>> = [];
  let brokenBlocks = 0;

  JSON_LD_PATTERN.lastIndex = 0;
  let block: RegExpExecArray | null = JSON_LD_PATTERN.exec(html);
  while (block !== null) {
    const payload = (block[1] ?? "")
      .replace(/<!--/g, " ")
      .replace(/-->/g, " ")
      .replace(/<!\[CDATA\[/g, " ")
      .replace(/\]\]>/g, " ")
      .trim();
    if (payload.length > 0) {
      try {
        flattenJsonLd(JSON.parse(payload), nodes);
      } catch {
        // Bozuk JSON içe aktarmayı çökertmez, yalnızca uyarı üretir.
        brokenBlocks += 1;
      }
    }
    block = JSON_LD_PATTERN.exec(html);
  }

  if (brokenBlocks > 0) {
    addWarning(
      draft,
      `${brokenBlocks} adet JSON-LD bloğu geçersiz JSON olduğu için okunamadı ve atlandı.`,
    );
  }

  for (const node of nodes) {
    const types = jsonLdTypes(node);
    if (types.length > 0 && !types.some((type) => RELEVANT_JSON_LD_TYPES.has(type))) {
      continue;
    }

    put(
      draft,
      "title",
      cleanText(coerceString(node["name"] ?? node["headline"]), LIMITS.titleMax),
      "json-ld",
    );
    put(
      draft,
      "description",
      cleanText(coerceString(node["description"]), LIMITS.descriptionMax),
      "json-ld",
    );

    const offer = readOffer(node);
    put(
      draft,
      "price",
      toBoundedNumber(
        offer.price ?? coerceNumber(node["price"]),
        LIMITS.priceMin,
        LIMITS.priceMax,
      ),
      "json-ld",
    );
    put(draft, "currency", offer.currency ?? coerceString(node["priceCurrency"]), "json-ld");

    const rooms = coerceRooms(node["numberOfRooms"] ?? node["numberOfBedrooms"]);
    put(draft, "beds", rooms.beds, "json-ld");
    if (rooms.hasLivingRoom) {
      addWarning(
        draft,
        'Oda sayısı "x+y" biçiminde yazılmış; yatak odası sayısı alındı, salon eklenmedi.',
      );
    }
    put(
      draft,
      "baths",
      toBoundedInteger(
        coerceNumber(node["numberOfBathroomsTotal"] ?? node["numberOfFullBathrooms"]),
        1,
        LIMITS.bathsMax,
      ),
      "json-ld",
    );
    put(
      draft,
      "area",
      toBoundedNumber(coerceNumber(node["floorSize"]), LIMITS.areaMin, LIMITS.areaMax),
      "json-ld",
    );
    put(
      draft,
      "plotArea",
      toBoundedNumber(
        coerceNumber(node["lotSize"] ?? node["landSize"]),
        LIMITS.areaMin,
        LIMITS.areaMax,
      ),
      "json-ld",
    );
    put(
      draft,
      "buildYear",
      toBoundedInteger(
        coerceNumber(node["yearBuilt"]),
        LIMITS.buildYearMin,
        LIMITS.buildYearMax,
      ),
      "json-ld",
    );

    const address = node["address"];
    if (isRecord(address)) {
      const region = cleanText(coerceString(address["addressRegion"]), LIMITS.titleMax);
      const locality = cleanText(coerceString(address["addressLocality"]), LIMITS.titleMax);
      // Türkiye adreslerinde addressRegion il, addressLocality ilçe olarak
      // doldurulur. Yalnızca biri varsa onu il kabul ederiz.
      put(draft, "city", region ?? locality, "json-ld");
      if (region && locality) put(draft, "district", locality, "json-ld");
      put(
        draft,
        "location",
        cleanText(coerceString(address["streetAddress"]), LIMITS.titleMax),
        "json-ld",
      );
    }

    const businessFunction = offer.businessFunction ?? coerceString(node["businessFunction"]);
    if (businessFunction) {
      put(
        draft,
        "listingType",
        JSON_LD_BUSINESS_FUNCTIONS[businessFunction.toLowerCase()],
        "json-ld",
      );
    }

    const features = readFeatures(node);
    if (features.length > 0) put(draft, "features", features, "json-ld");

    const rawImages: string[] = [];
    collectJsonLdImages(node["image"] ?? node["photo"], rawImages);
    for (const url of rawImages) images.push({ url, source: "json-ld" });
  }
}

/* -------------------------------------------------------------------------
 * 8. Open Graph, Twitter ve diğer meta etiketleri
 * ---------------------------------------------------------------------- */

const META_TAG_PATTERN = /<meta\b([^>]*)>/gi;
const ATTRIBUTE_PATTERN = /([a-zA-Z_:][-\w:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;

function parseAttributes(source: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  ATTRIBUTE_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null = ATTRIBUTE_PATTERN.exec(source);
  while (match !== null) {
    const name = (match[1] ?? "").toLowerCase();
    const value = match[2] ?? match[3] ?? match[4] ?? "";
    if (name.length > 0 && attributes[name] === undefined) attributes[name] = value;
    match = ATTRIBUTE_PATTERN.exec(source);
  }
  return attributes;
}

function collectMetaTags(html: string): Map<string, string[]> {
  const meta = new Map<string, string[]>();
  META_TAG_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null = META_TAG_PATTERN.exec(html);
  while (match !== null) {
    const attributes = parseAttributes(match[1] ?? "");
    const key = (attributes["property"] ?? attributes["name"] ?? attributes["itemprop"] ?? "")
      .trim()
      .toLowerCase();
    const content = attributes["content"];
    if (key.length > 0 && content !== undefined && content.length > 0) {
      const existing = meta.get(key);
      if (existing) existing.push(content);
      else meta.set(key, [content]);
    }
    match = META_TAG_PATTERN.exec(html);
  }
  return meta;
}

function firstMeta(meta: Map<string, string[]>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const values = meta.get(key);
    if (values && values.length > 0) return values[0];
  }
  return undefined;
}

function applyMetaTags(
  meta: Map<string, string[]>,
  draft: Draft,
  images: ImageCandidate[],
): void {
  put(
    draft,
    "title",
    cleanText(firstMeta(meta, "og:title", "twitter:title"), LIMITS.titleMax),
    "open-graph",
  );
  put(
    draft,
    "description",
    cleanText(firstMeta(meta, "og:description", "twitter:description"), LIMITS.descriptionMax),
    "open-graph",
  );
  put(
    draft,
    "price",
    toBoundedNumber(
      parseNumericValue(firstMeta(meta, "product:price:amount", "og:price:amount") ?? ""),
      LIMITS.priceMin,
      LIMITS.priceMax,
    ),
    "open-graph",
  );
  put(
    draft,
    "currency",
    cleanText(firstMeta(meta, "product:price:currency", "og:price:currency")),
    "open-graph",
  );
  put(draft, "sourceUrl", sanitizeSourceUrl(firstMeta(meta, "og:url")), "open-graph");

  for (const key of ["og:image", "og:image:secure_url", "og:image:url", "twitter:image"]) {
    for (const value of meta.get(key) ?? []) images.push({ url: value, source: "open-graph" });
  }
}

/* -------------------------------------------------------------------------
 * 9. Microdata katmanı
 * ---------------------------------------------------------------------- */

const VOID_TAGS = new Set([
  "meta",
  "link",
  "img",
  "br",
  "hr",
  "input",
  "source",
  "area",
  "base",
  "col",
  "embed",
  "param",
  "track",
  "wbr",
]);

const ITEMPROP_TAG_PATTERN = /<([a-zA-Z][\w-]*)\b([^>]*\bitemprop\s*=[^>]*)>/gi;

function readElementText(
  html: string,
  tagName: string,
  startIndex: number,
): string | undefined {
  const scanner = new RegExp(`<(/?)${tagName}\\b[^>]*>`, "gi");
  scanner.lastIndex = startIndex;
  let depth = 0;
  let step: RegExpExecArray | null = scanner.exec(html);
  while (step !== null) {
    if (step[1] === "/") {
      if (depth === 0) return html.slice(startIndex, step.index);
      depth -= 1;
    } else {
      depth += 1;
    }
    step = scanner.exec(html);
  }
  return undefined;
}

/**
 * `itemprop` taşıyan öğeleri toplar.
 * Değer önce `content`/`src`/`href` özniteliğinden, yoksa öğenin kapanışına
 * kadar olan metinden alınır. Aynı adlı iç içe etiketler için basit bir
 * derinlik sayacı kullanılır; tam bir HTML ayrıştırıcısı değildir ama ilan
 * sayfalarındaki düz yapılar için yeterlidir.
 */
function collectMicrodata(html: string): Map<string, string[]> {
  const result = new Map<string, string[]>();
  ITEMPROP_TAG_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null = ITEMPROP_TAG_PATTERN.exec(html);

  while (match !== null) {
    const tagName = (match[1] ?? "").toLowerCase();
    const attributes = parseAttributes(match[2] ?? "");
    const property = (attributes["itemprop"] ?? "").trim().toLowerCase();

    if (property.length > 0) {
      let value: string | undefined =
        attributes["content"] ?? attributes["src"] ?? attributes["href"];
      if (value === undefined && !VOID_TAGS.has(tagName)) {
        value = readElementText(html, tagName, match.index + match[0].length);
      }
      const cleaned = cleanText(value, LIMITS.descriptionMax);
      if (cleaned) {
        const existing = result.get(property);
        if (existing) existing.push(cleaned);
        else result.set(property, [cleaned]);
      }
    }
    match = ITEMPROP_TAG_PATTERN.exec(html);
  }
  return result;
}

function firstMicrodata(data: Map<string, string[]>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const values = data.get(key);
    if (values && values.length > 0) return values[0];
  }
  return undefined;
}

function applyMicrodata(
  data: Map<string, string[]>,
  draft: Draft,
  images: ImageCandidate[],
): void {
  put(
    draft,
    "title",
    cleanText(firstMicrodata(data, "name", "headline"), LIMITS.titleMax),
    "microdata",
  );
  put(
    draft,
    "description",
    cleanText(firstMicrodata(data, "description"), LIMITS.descriptionMax),
    "microdata",
  );
  put(
    draft,
    "price",
    toBoundedNumber(
      parseNumericValue(firstMicrodata(data, "price") ?? ""),
      LIMITS.priceMin,
      LIMITS.priceMax,
    ),
    "microdata",
  );
  put(draft, "currency", firstMicrodata(data, "pricecurrency"), "microdata");

  const rooms = coerceRooms(firstMicrodata(data, "numberofrooms", "numberofbedrooms"));
  put(draft, "beds", rooms.beds, "microdata");
  put(
    draft,
    "baths",
    toBoundedInteger(
      parseNumericValue(firstMicrodata(data, "numberofbathroomstotal") ?? ""),
      1,
      LIMITS.bathsMax,
    ),
    "microdata",
  );
  put(
    draft,
    "area",
    toBoundedNumber(
      parseNumericValue(firstMicrodata(data, "floorsize") ?? ""),
      LIMITS.areaMin,
      LIMITS.areaMax,
    ),
    "microdata",
  );
  put(
    draft,
    "buildYear",
    toBoundedInteger(
      parseNumericValue(firstMicrodata(data, "yearbuilt") ?? ""),
      LIMITS.buildYearMin,
      LIMITS.buildYearMax,
    ),
    "microdata",
  );

  const region = firstMicrodata(data, "addressregion");
  const locality = firstMicrodata(data, "addresslocality");
  put(draft, "city", region ?? locality, "microdata");
  if (region && locality) put(draft, "district", locality, "microdata");
  put(draft, "location", firstMicrodata(data, "streetaddress"), "microdata");

  for (const value of data.get("image") ?? []) images.push({ url: value, source: "microdata" });
}

/* -------------------------------------------------------------------------
 * 10. Türkçe metin sezgisi
 * ---------------------------------------------------------------------- */

const PROVINCES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya",
  "Artvin", "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu",
  "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır",
  "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep",
  "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Isparta", "Mersin", "İstanbul",
  "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir", "Kocaeli",
  "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla",
  "Muş", "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt",
  "Sinop", "Sivas", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa",
  "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman",
  "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova",
  "Karabük", "Kilis", "Osmaniye", "Düzce",
] as const;

const FOLDED_PROVINCES: ReadonlyArray<{ folded: string; display: string }> = PROVINCES.map(
  (name) => ({ folded: foldTurkish(name), display: name }),
);

/** İlçe adı sanılabilecek kalıp kelimeler. */
const DISTRICT_STOP_WORDS = new Set([
  "satılık",
  "satilik",
  "kiralık",
  "kiralik",
  "emlak",
  "ilan",
  "daire",
  "villa",
  "arsa",
  "ofis",
  "konut",
  "türkiye",
  "turkiye",
  "gayrimenkul",
  "avrupa",
  "anadolu",
  "merkez",
]);

const CURRENCY_MARKERS: ReadonlyArray<{ pattern: RegExp; code: string }> = [
  { pattern: /₺|tl|try/, code: "TRY" },
  { pattern: /\$|usd/, code: "USD" },
  { pattern: /€|eur/, code: "EUR" },
  { pattern: /£|gbp/, code: "GBP" },
];

function detectCurrency(chunk: string): string | undefined {
  for (const marker of CURRENCY_MARKERS) {
    if (marker.pattern.test(chunk)) return marker.code;
  }
  return undefined;
}

const LABELLED_PRICE_PATTERN =
  /f[ıi]yat[ıi]?[^\d₺$€£]{0,24}((?:₺|\$|€|£)?\s*\d[\d.,]*\s*(?:tl|try|usd|eur|gbp|₺|\$|€|£)?)/;
const MONEY_PATTERN =
  /(?:(₺|\$|€|£)\s*)?(\d{1,3}(?:\.\d{3})+(?:,\d+)?|\d{4,}(?:,\d+)?)\s*(tl|try|usd|eur|gbp|₺|\$|€|£)?/g;

function findPrice(folded: string): { amount: number; currency: string } | undefined {
  const labelled = LABELLED_PRICE_PATTERN.exec(folded);
  const labelledChunk = labelled?.[1];
  if (labelledChunk) {
    const amount = toBoundedNumber(
      parseNumericValue(labelledChunk),
      LIMITS.priceMin,
      LIMITS.priceMax,
    );
    if (amount !== undefined) {
      return { amount, currency: detectCurrency(labelledChunk) ?? DEFAULT_CURRENCY };
    }
  }

  // Etiketsiz metinde yalnızca para birimi işareti taşıyan sayılar dikkate
  // alınır; aksi halde telefon veya ilan numarası fiyat sanılır.
  MONEY_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null = MONEY_PATTERN.exec(folded);
  while (match !== null) {
    const prefix = match[1] ?? "";
    const suffix = match[3] ?? "";
    if (prefix.length > 0 || suffix.length > 0) {
      const amount = toBoundedNumber(
        parseNumericValue(match[2] ?? ""),
        LIMITS.priceMin,
        LIMITS.priceMax,
      );
      if (amount !== undefined) {
        return { amount, currency: detectCurrency(prefix + suffix) ?? DEFAULT_CURRENCY };
      }
    }
    match = MONEY_PATTERN.exec(folded);
  }
  return undefined;
}

function firstNumberMatch(folded: string, patterns: readonly RegExp[]): number | undefined {
  for (const pattern of patterns) {
    const match = pattern.exec(folded);
    const value = parseNumericValue(match?.[1] ?? "");
    if (value !== undefined) return value;
  }
  return undefined;
}

const GROSS_AREA_PATTERNS = [
  /(?:m²|m2)\s*\(?\s*br[üu]t\s*\)?\s*[:\s]\s*(\d[\d.,]*)/,
  /br[üu]t\s*(?:metrekare|alan|m²|m2)?\s*[:\s]+(\d[\d.,]*)/,
  /(\d[\d.,]*)\s*(?:m²|m2)\s*br[üu]t/,
] as const;

const NET_AREA_PATTERNS = [
  /(?:m²|m2)\s*\(?\s*net\s*\)?\s*[:\s]\s*(\d[\d.,]*)/,
  /net\s*(?:metrekare|alan|m²|m2)?\s*[:\s]+(\d[\d.,]*)/,
] as const;

const GENERIC_AREA_PATTERNS = [/(\d[\d.,]*)\s*(?:m²|m2)(?![\w])/] as const;

const PLOT_AREA_PATTERNS = [
  /arsa\s*(?:alan[ıi]|metrekaresi|m²|m2)?\s*[:\s]+(\d[\d.,]*)/,
  /parsel\s*alan[ıi]\s*[:\s]+(\d[\d.,]*)/,
] as const;

const BUILD_YEAR_PATTERNS = [
  /(?:yap[ıi]m|[ıi]n[şs]a|[ıi]n[şs]aat)\s*y[ıi]l[ıi]\s*[:\s]+(\d{4})/,
  /bina\s*yap[ıi]m\s*y[ıi]l[ıi]\s*[:\s]+(\d{4})/,
] as const;

const BATH_PATTERNS = [/banyo\s*(?:say[ıi]s[ıi])?\s*[:\s]+(\d{1,2})/] as const;

const ROOM_LABEL_PATTERN = /oda\s*say[ıi]s[ıi]\s*[:\s]+(\d{1,2})\s*\+\s*(\d{1,2})/;
const ROOM_LOOSE_PATTERN = /(?:^|[\s:>])(\d{1,2})\s*\+\s*(\d{1,2})(?!\d)/;
const STUDIO_PATTERN = /st[üu]dyo/;
const BUILDING_AGE_PATTERN = /bina\s*ya[şs][ıi]\s*[:\s]+(\d{1,3})/;

const CATEGORY_KEYWORDS: ReadonlyArray<{ folded: string; category: ListingCategory }> = [
  { folded: "yalı", category: "yali" },
  { folded: "villa", category: "villa" },
  { folded: "rezidans", category: "rezidans" },
  { folded: "ofis", category: "ofis" },
  { folded: "iş yeri", category: "ofis" },
  { folded: "işyeri", category: "ofis" },
  { folded: "dükkan", category: "ofis" },
  { folded: "arsa", category: "arsa" },
  { folded: "daire", category: "daire" },
];

const FEATURE_KEYWORDS: ReadonlyArray<{ folded: string; label: string }> = [
  { folded: "havuz", label: "Havuz" },
  { folded: "deniz manzara", label: "Deniz manzarası" },
  { folded: "boğaz manzara", label: "Boğaz manzarası" },
  { folded: "otopark", label: "Otopark" },
  { folded: "kapalı garaj", label: "Kapalı garaj" },
  { folded: "asansör", label: "Asansör" },
  { folded: "güvenlik", label: "Güvenlik" },
  { folded: "bahçe", label: "Bahçe" },
  { folded: "teras", label: "Teras" },
  { folded: "şömine", label: "Şömine" },
  { folded: "sauna", label: "Sauna" },
  { folded: "spor salonu", label: "Spor salonu" },
  { folded: "akıllı ev", label: "Akıllı ev sistemi" },
  { folded: "jeneratör", label: "Jeneratör" },
  { folded: "eşyalı", label: "Eşyalı" },
  { folded: "site içerisinde", label: "Site içerisinde" },
  { folded: "yerden ısıtma", label: "Yerden ısıtma" },
];

const CITY_LABEL_PATTERN = /(\bil\s*[:\s]\s*)([a-zçğıöşüâîû]{3,})/;
const DISTRICT_LABEL_PATTERN = /(il[çc]e(?:si)?\s*[:\s]\s*)([a-zçğıöşüâîû]{3,})/;
const NEIGHBOURHOOD_LABEL_PATTERN =
  /((?:mahalle(?:si)?|semt(?:i)?)\s*[:\s]\s*)([a-zçğıöşüâîû]{3,})/;
const DISTRICT_AFTER_PROVINCE_PATTERN = /^\s*[/\-|,]\s*([a-zçğıöşüâîû]{3,})/;

function findLocation(text: FoldedText): {
  city?: string;
  district?: string;
  location?: string;
} {
  const labelledCity = matchRawValue(text, CITY_LABEL_PATTERN);
  const labelledDistrict = matchRawValue(text, DISTRICT_LABEL_PATTERN);
  const neighbourhood = matchRawValue(text, NEIGHBOURHOOD_LABEL_PATTERN);

  let city = labelledCity ? toTitleCaseTr(labelledCity) : undefined;
  let district = labelledDistrict ? toTitleCaseTr(labelledDistrict) : undefined;

  if (!city || !district) {
    // "İstanbul / Beşiktaş" ve "Muğla - Bodrum" kalıpları.
    for (const province of FOLDED_PROVINCES) {
      const index = findWordIndex(text.folded, province.folded);
      if (index === -1) continue;
      city = city ?? province.display;
      if (!district) {
        const tailStart = index + province.folded.length;
        const tail = text.folded.slice(tailStart);
        const candidate = DISTRICT_AFTER_PROVINCE_PATTERN.exec(tail)?.[1];
        if (candidate && !DISTRICT_STOP_WORDS.has(candidate)) {
          const offset = tailStart + tail.indexOf(candidate);
          district = toTitleCaseTr(text.raw.slice(offset, offset + candidate.length));
        }
      }
      break;
    }
  }

  return {
    city,
    district,
    location: neighbourhood ? toTitleCaseTr(neighbourhood) : undefined,
  };
}

/** Kategori kelimesinin ekli hallerine izin verilen azami harf sayısı. */
const MAX_SUFFIX_LENGTH = 3;

/**
 * Kelimenin kendisini veya kısa ekli halini arar ("villası", "arsalar").
 * Baştan sınır zorunludur, sondaki ek üç harfle sınırlıdır; böylece "yalı"
 * kelimesi "Yalıkavak" içinde eşleşmez.
 */
function containsKeyword(folded: string, word: string): boolean {
  let index = folded.indexOf(word);
  while (index !== -1) {
    if (index === 0 || !isLetterAt(folded, index - 1)) {
      let suffix = 0;
      while (
        suffix <= MAX_SUFFIX_LENGTH &&
        isLetterAt(folded, index + word.length + suffix)
      ) {
        suffix += 1;
      }
      if (suffix <= MAX_SUFFIX_LENGTH) return true;
    }
    index = folded.indexOf(word, index + 1);
  }
  return false;
}

function findCategory(folded: string): ListingCategory | undefined {
  for (const keyword of CATEGORY_KEYWORDS) {
    if (containsKeyword(folded, keyword.folded)) return keyword.category;
  }
  return undefined;
}

function findListingType(folded: string): ListingType | undefined {
  const rentIndex = folded.search(/kiral[ıi]k/);
  const saleIndex = folded.search(/sat[ıi]l[ıi]k/);
  if (rentIndex === -1 && saleIndex === -1) return undefined;
  if (rentIndex === -1) return "satilik";
  if (saleIndex === -1) return "kiralik";
  return rentIndex < saleIndex ? "kiralik" : "satilik";
}

function findFeatures(folded: string): string[] {
  const features: string[] = [];
  for (const keyword of FEATURE_KEYWORDS) {
    if (features.length >= LIMITS.featureCount) break;
    if (folded.includes(keyword.folded)) features.push(keyword.label);
  }
  return features;
}

function applyTurkishText(text: FoldedText, draft: Draft): void {
  const folded = text.folded;
  if (folded.trim().length === 0) return;

  const price = findPrice(folded);
  if (price) {
    put(draft, "price", price.amount, "metin");
    put(draft, "currency", price.currency, "metin");
  }

  const rooms = ROOM_LABEL_PATTERN.exec(folded) ?? ROOM_LOOSE_PATTERN.exec(folded);
  if (rooms) {
    // "4+1" yatak odası + salon demektir; salon oda sayısına eklenmez.
    put(draft, "beds", toBoundedInteger(Number(rooms[1]), 1, LIMITS.bedsMax), "metin");
    addWarning(
      draft,
      `Oda sayısı "${rooms[1]}+${rooms[2]}" olarak okundu; salon yatak odası sayısına eklenmedi.`,
    );
  } else if (STUDIO_PATTERN.test(folded)) {
    put(draft, "beds", 1, "metin");
    addWarning(draft, "İlan stüdyo olarak geçiyor, oda sayısı 1 kabul edildi.");
  }

  put(
    draft,
    "baths",
    toBoundedInteger(firstNumberMatch(folded, BATH_PATTERNS), 1, LIMITS.bathsMax),
    "metin",
  );

  const grossArea = toBoundedNumber(
    firstNumberMatch(folded, GROSS_AREA_PATTERNS),
    LIMITS.areaMin,
    LIMITS.areaMax,
  );
  const netArea = toBoundedNumber(
    firstNumberMatch(folded, NET_AREA_PATTERNS),
    LIMITS.areaMin,
    LIMITS.areaMax,
  );
  const genericArea = toBoundedNumber(
    firstNumberMatch(folded, GENERIC_AREA_PATTERNS),
    LIMITS.areaMin,
    LIMITS.areaMax,
  );

  if (grossArea !== undefined) {
    put(draft, "area", grossArea, "metin");
  } else if (netArea !== undefined) {
    put(draft, "area", netArea, "metin");
    addWarning(draft, "Brüt metrekare bulunamadı, net metrekare kullanıldı.");
  } else if (genericArea !== undefined) {
    put(draft, "area", genericArea, "metin");
    addWarning(draft, "Metrekare brüt/net ayrımı olmadan okundu, kontrol edin.");
  }

  put(
    draft,
    "plotArea",
    toBoundedNumber(firstNumberMatch(folded, PLOT_AREA_PATTERNS), LIMITS.areaMin, LIMITS.areaMax),
    "metin",
  );

  const buildYear = toBoundedInteger(
    firstNumberMatch(folded, BUILD_YEAR_PATTERNS),
    LIMITS.buildYearMin,
    LIMITS.buildYearMax,
  );
  put(draft, "buildYear", buildYear, "metin");
  if (buildYear === undefined && BUILDING_AGE_PATTERN.test(folded)) {
    addWarning(
      draft,
      "Sayfada yapım yılı yerine bina yaşı yazıyor; yapım yılı hesaplanmadı, elle girin.",
    );
  }

  put(draft, "listingType", findListingType(folded), "metin");
  put(draft, "category", findCategory(folded), "metin");

  const location = findLocation(text);
  put(draft, "city", location.city, "metin");
  put(draft, "district", location.district, "metin");
  put(draft, "location", location.location, "metin");

  const features = findFeatures(folded);
  if (features.length > 0) put(draft, "features", features, "metin");
}

/* -------------------------------------------------------------------------
 * 11. Son çare: sayfa başlığı ve klasik meta açıklaması
 * ---------------------------------------------------------------------- */

const TITLE_TAG_PATTERN = /<title\b[^>]*>([\s\S]*?)<\/title\s*>/i;

function applyDocumentFallbacks(
  html: string,
  meta: Map<string, string[]>,
  draft: Draft,
): void {
  put(draft, "title", cleanText(TITLE_TAG_PATTERN.exec(html)?.[1], LIMITS.titleMax), "metin");
  put(
    draft,
    "description",
    cleanText(firstMeta(meta, "description"), LIMITS.descriptionMax),
    "metin",
  );
}

/* -------------------------------------------------------------------------
 * 12. Görselleri sonlandırma
 * ---------------------------------------------------------------------- */

function finalizeImages(
  draft: Draft,
  candidates: readonly ImageCandidate[],
  baseUrl: string | undefined,
): void {
  const accepted: string[] = [];
  let firstSource: ProvenanceSource | undefined;
  let rejected = 0;

  for (const candidate of candidates) {
    if (accepted.length >= LIMITS.imageCount) break;
    const normalized = normalizeImageUrl(candidate.url, baseUrl);
    if (!normalized) {
      rejected += 1;
      continue;
    }
    if (accepted.includes(normalized)) continue;
    accepted.push(normalized);
    firstSource = firstSource ?? candidate.source;
  }

  if (rejected > 0) {
    addWarning(
      draft,
      `${rejected} görsel adresi güvenlik kuralına takıldı (yalnızca https adresler alınır) ve atlandı.`,
    );
  }
  if (accepted.length > 0 && firstSource) {
    put(draft, "images", accepted, firstSource);
  }
}

/* -------------------------------------------------------------------------
 * 13. Genel giriş noktası
 * ---------------------------------------------------------------------- */

/**
 * Bir ilan sayfasının HTML'ini (veya yapıştırılmış düz metnini) taslak ilana
 * çevirir. Saf fonksiyondur: aynı girdi her zaman aynı çıktıyı verir.
 */
export function parseListingHtml(html: string, sourceUrl?: string): ParseResult {
  if (typeof html !== "string" || html.trim().length === 0) {
    return {
      listing: {},
      provenance: {},
      warnings: ["İçerik boş, ayrıştırılacak bir şey bulunamadı."],
    };
  }

  const draft: Draft = { listing: {}, provenance: {}, warnings: [] };
  const source = sanitizeSourceUrl(sourceUrl);
  const images: ImageCandidate[] = [];

  // Sıra önemlidir: JSON-LD bir script bloğunun içinde durduğu için script
  // blokları silinmeden önce okunmalıdır.
  applyJsonLd(html, draft, images);
  const meta = collectMetaTags(html);
  applyMetaTags(meta, draft, images);

  const safeHtml = removeDangerousBlocks(html);
  applyMicrodata(collectMicrodata(safeHtml), draft, images);

  const text = createFoldedText(htmlToText(safeHtml).slice(0, LIMITS.textScanMax));
  applyTurkishText(text, draft);
  applyDocumentFallbacks(safeHtml, meta, draft);

  finalizeImages(draft, images, source ?? draft.listing.sourceUrl);

  // Çağıranın verdiği adres sayfadan okunana göre daha güvenilirdir.
  if (source) draft.listing.sourceUrl = source;

  if (draft.listing.price !== undefined && draft.listing.currency === undefined) {
    draft.listing.currency = DEFAULT_CURRENCY;
  }
  if (draft.listing.currency !== undefined) {
    draft.listing.currency = draft.listing.currency.toUpperCase().slice(0, 3);
  }

  if (Object.keys(draft.provenance).length === 0) {
    addWarning(
      draft,
      "Sayfadan hiçbir alan çıkarılamadı. İlan sayfasının içeriğini kopyalayıp yapıştırmayı deneyin.",
    );
  }

  return { listing: draft.listing, provenance: draft.provenance, warnings: draft.warnings };
}
