import type { ListingType, Property, PropertyCategory } from "@/content/properties";
import { formatNumber } from "@/lib/format";

import {
  createId,
  fromBoolean,
  getDb,
  nowIso,
  optionalText,
  parseJsonSafe,
  resolvePage,
  toBoolean,
} from "./client";
import {
  LISTING_STATUSES,
  type Listing,
  type ListingFilter,
  type ListingInput,
  type ListingPatch,
  type ListingRow,
  type ListingStatus,
  type PublishedListingFilter,
} from "./types";

/**
 * İlan (listings) veri erişimi.
 *
 * D1 satırı ile uygulamanın `Property` sözleşmesi arasındaki dönüşüm yalnızca
 * `mapRow` içinde yapılır. Böylece mevcut sayfalar tek satır değişmeden
 * veritabanından beslenebilir.
 *
 * Tüm sorgular hazırlanmış ifade ve parametre bağlama kullanır; dinamik
 * filtrelerde bile değerler asla SQL metnine gömülmez.
 */

/** Kimlik öneki, mevcut içerikteki "zpl-..." biçimini sürdürür. */
const ID_PREFIX = "zpl";

/** Slug uzunluk sınırı, URL'lerin okunabilir kalması için. */
const SLUG_MAX_LENGTH = 96;

/** Benzersiz slug ararken denenecek azami sonek sayısı. */
const SLUG_SUFFIX_LIMIT = 100;

/** Fiyat etiketindeki para birimi simgesi. */
const CURRENCY_SYMBOL = "₺";

/* CHECK kısıtlarıyla ve içerik katmanındaki birliklerle aynı değerler. */
const LISTING_TYPES = ["satilik", "kiralik"] as const satisfies readonly ListingType[];

const PROPERTY_CATEGORIES = [
  "villa",
  "rezidans",
  "daire",
  "yali",
  "arsa",
  "ofis",
] as const satisfies readonly PropertyCategory[];

/** Seçilen sütunlar sabittir, `SELECT *` kullanılmaz. */
const COLUMNS = [
  "id",
  "slug",
  "title",
  "description",
  "location",
  "city",
  "district",
  "listing_type",
  "category",
  "price",
  "price_period",
  "beds",
  "baths",
  "area",
  "plot_area",
  "build_year",
  "features",
  "images",
  "featured",
  "status",
  "source_url",
  "created_at",
  "updated_at",
  "published_at",
].join(", ");

/* -------------------------------------------------------------------------- */
/* Okuma                                                                       */
/* -------------------------------------------------------------------------- */

/** Yayındaki ilanlar, en yeni yayın tarihi başta. */
export async function listPublished(
  filter: PublishedListingFilter = {},
): Promise<Listing[]> {
  return queryListings(
    { ...filter, status: "published" },
    "ORDER BY published_at DESC, id DESC",
  );
}

/** Yönetim listesi. Filtre verilmezse tüm durumları kapsar. */
export async function listAll(filter: ListingFilter = {}): Promise<Listing[]> {
  return queryListings(filter, "ORDER BY updated_at DESC, id DESC");
}

/**
 * Slug ile tek ilan. Varsayılan olarak yalnızca yayındaki ilanı döner,
 * böylece genele açık sayfalar taslak sızdırmaz. Önizleme için
 * `includeUnpublished` açıkça verilmelidir.
 */
export async function getBySlug(
  slug: string,
  options: { readonly includeUnpublished?: boolean } = {},
): Promise<Listing | null> {
  const includeUnpublished = options.includeUnpublished ?? false;

  const sql = includeUnpublished
    ? `SELECT ${COLUMNS} FROM listings WHERE slug = ? LIMIT 1`
    : `SELECT ${COLUMNS} FROM listings WHERE slug = ? AND status = ? LIMIT 1`;

  const params: unknown[] = includeUnpublished ? [slug] : [slug, "published"];
  const row = await getDb().prepare(sql).bind(...params).first<ListingRow>();

  return row === null ? null : mapRow(row);
}

/** Kimlik ile tek ilan, durum farkı gözetmez (yönetim tarafı için). */
export async function getById(id: string): Promise<Listing | null> {
  const row = await getDb()
    .prepare(`SELECT ${COLUMNS} FROM listings WHERE id = ? LIMIT 1`)
    .bind(id)
    .first<ListingRow>();

  return row === null ? null : mapRow(row);
}

/* -------------------------------------------------------------------------- */
/* Yazma                                                                       */
/* -------------------------------------------------------------------------- */

/** Yeni ilanı taslak olarak oluşturur, benzersiz slug'ı kendisi üretir. */
export async function createDraft(input: ListingInput): Promise<Listing> {
  const db = getDb();
  const now = nowIso();
  const slug = await ensureUniqueSlug(input.title);

  const row = await db
    .prepare(
      `INSERT INTO listings (
         id, slug, title, description, location, city, district,
         listing_type, category, price, price_period,
         beds, baths, area, plot_area, build_year,
         features, images, featured, status, source_url,
         created_at, updated_at, published_at
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
       RETURNING ${COLUMNS}`,
    )
    .bind(
      createId(ID_PREFIX),
      slug,
      input.title.trim(),
      input.description?.trim() ?? "",
      input.location?.trim() ?? "",
      input.city?.trim() ?? "",
      input.district?.trim() ?? "",
      input.listingType,
      input.category,
      Math.max(0, Math.trunc(input.price)),
      pricePeriodFor(input.listingType),
      integerOrZero(input.beds),
      integerOrZero(input.baths),
      integerOrZero(input.area),
      integerOrNull(input.plotArea),
      integerOrNull(input.buildYear),
      JSON.stringify(input.features ?? []),
      JSON.stringify(input.images ?? []),
      fromBoolean(input.featured ?? false),
      "draft" satisfies ListingStatus,
      optionalText(input.sourceUrl),
      now,
      now,
    )
    .first<ListingRow>();

  if (row === null) {
    throw new Error("İlan oluşturulamadı, veritabanı satır döndürmedi.");
  }

  return mapRow(row);
}

/**
 * Kısmi güncelleme. Slug bilerek değiştirilmez: yayınlanmış bir ilanın
 * adresi sabit kalmalıdır. Durum geçişleri `publish` ve `archive` ile yapılır.
 */
export async function update(
  id: string,
  patch: ListingPatch,
): Promise<Listing | null> {
  const assignments: string[] = [];
  const params: unknown[] = [];

  const set = (column: string, value: unknown): void => {
    assignments.push(`${column} = ?`);
    params.push(value);
  };

  if (patch.title !== undefined) set("title", patch.title.trim());
  if (patch.description !== undefined) set("description", patch.description.trim());
  if (patch.location !== undefined) set("location", patch.location.trim());
  if (patch.city !== undefined) set("city", patch.city.trim());
  if (patch.district !== undefined) set("district", patch.district.trim());
  if (patch.category !== undefined) set("category", patch.category);
  if (patch.price !== undefined) set("price", Math.max(0, Math.trunc(patch.price)));
  if (patch.beds !== undefined) set("beds", integerOrZero(patch.beds));
  if (patch.baths !== undefined) set("baths", integerOrZero(patch.baths));
  if (patch.area !== undefined) set("area", integerOrZero(patch.area));
  if (patch.plotArea !== undefined) set("plot_area", integerOrNull(patch.plotArea));
  if (patch.buildYear !== undefined) set("build_year", integerOrNull(patch.buildYear));
  if (patch.features !== undefined) set("features", JSON.stringify(patch.features));
  if (patch.images !== undefined) set("images", JSON.stringify(patch.images));
  if (patch.featured !== undefined) set("featured", fromBoolean(patch.featured));
  if (patch.sourceUrl !== undefined) set("source_url", optionalText(patch.sourceUrl));

  // İlan tipi değişirse fiyat periyodu da birlikte güncellenir, aksi halde
  // tabloyu koruyan CHECK kısıtı ihlal olur.
  if (patch.listingType !== undefined) {
    set("listing_type", patch.listingType);
    set("price_period", pricePeriodFor(patch.listingType));
  }

  if (assignments.length === 0) {
    return getById(id);
  }

  set("updated_at", nowIso());
  params.push(id);

  const row = await getDb()
    .prepare(
      `UPDATE listings SET ${assignments.join(", ")} WHERE id = ? RETURNING ${COLUMNS}`,
    )
    .bind(...params)
    .first<ListingRow>();

  return row === null ? null : mapRow(row);
}

/** İlanı yayına alır. İlk yayın tarihi korunur, tekrar yayınlamada ezilmez. */
export async function publish(id: string): Promise<Listing | null> {
  const now = nowIso();

  const row = await getDb()
    .prepare(
      `UPDATE listings
          SET status = ?, published_at = COALESCE(published_at, ?), updated_at = ?
        WHERE id = ?
        RETURNING ${COLUMNS}`,
    )
    .bind("published" satisfies ListingStatus, now, now, id)
    .first<ListingRow>();

  return row === null ? null : mapRow(row);
}

/** İlanı arşivler. Veri silinmez, yalnızca listelerden düşer. */
export async function archive(id: string): Promise<Listing | null> {
  const row = await getDb()
    .prepare(
      `UPDATE listings SET status = ?, updated_at = ? WHERE id = ? RETURNING ${COLUMNS}`,
    )
    .bind("archived" satisfies ListingStatus, nowIso(), id)
    .first<ListingRow>();

  return row === null ? null : mapRow(row);
}

/* -------------------------------------------------------------------------- */
/* Slug                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Başlığı URL parçasına çevirir. Türkçe harfler ASCII karşılığına eşlenir
 * (ç->c, ğ->g, ı->i, İ->i, ö->o, ş->s, ü->u), kalan aksanlar ayıklanır.
 */
export function slugify(title: string): string {
  const TURKISH_MAP: Readonly<Record<string, string>> = {
    ç: "c",
    Ç: "c",
    ğ: "g",
    Ğ: "g",
    ı: "i",
    I: "i",
    İ: "i",
    ö: "o",
    Ö: "o",
    ş: "s",
    Ş: "s",
    ü: "u",
    Ü: "u",
  };

  // Eşleme küçük harfe çevirmeden önce yapılır: "İ".toLowerCase() birleşik
  // nokta üretir ve düz bir "i" vermez.
  const mapped = Array.from(title)
    .map((char) => TURKISH_MAP[char] ?? char)
    .join("");

  return mapped
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/-+$/g, "");
}

/**
 * Başlıktan benzersiz slug üretir. Çakışma varsa sonuna sayı ekler
 * ("bebek-yali", "bebek-yali-2", ...). `excludeId` verilirse o ilanın kendi
 * slug'ı çakışma sayılmaz.
 */
export async function ensureUniqueSlug(
  title: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(title) || ID_PREFIX;

  // Slug yalnızca [a-z0-9-] içerir, bu yüzden LIKE kalıbı güvenlidir.
  const rows = await getDb()
    .prepare(
      "SELECT slug FROM listings WHERE (slug = ? OR slug LIKE ?) AND id <> ?",
    )
    .bind(base, `${base}-%`, excludeId ?? "")
    .all<{ readonly slug: string }>();

  const taken = new Set(rows.results.map((row) => row.slug));

  if (!taken.has(base)) {
    return base;
  }

  for (let suffix = 2; suffix < SLUG_SUFFIX_LIMIT; suffix += 1) {
    const candidate = `${base}-${suffix}`;
    if (!taken.has(candidate)) {
      return candidate;
    }
  }

  // Son çare: çakışmayacak rastgele sonek.
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

/* -------------------------------------------------------------------------- */
/* Biçimlendirme ve dönüşüm                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Ekranda gösterilen fiyat etiketi. Veritabanında saklanmaz, `price` ve
 * ilan tipinden türetilir. Örnek: "₺ 285.000.000", "₺ 1.450.000 / ay".
 */
export function formatPriceLabel(price: number, pricePeriod?: "ay"): string {
  const amount = `${CURRENCY_SYMBOL} ${formatNumber(price)}`;
  return pricePeriod === undefined ? amount : `${amount} / ${pricePeriod}`;
}

/** D1 satırını uygulamanın alan tipine çevirir. Tek dönüşüm noktası. */
function mapRow(row: ListingRow): Listing {
  const listingType = parseUnion(row.listing_type, LISTING_TYPES, "satilik");
  const pricePeriod = row.price_period === "ay" ? ("ay" as const) : undefined;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    location: row.location,
    city: row.city,
    district: row.district,
    listingType,
    category: parseUnion(row.category, PROPERTY_CATEGORIES, "daire"),
    price: row.price,
    priceLabel: formatPriceLabel(row.price, pricePeriod),
    pricePeriod,
    beds: row.beds,
    baths: row.baths,
    area: row.area,
    plotArea: row.plot_area ?? undefined,
    buildYear: row.build_year ?? undefined,
    features: parseStringArray(row.features),
    images: parseStringArray(row.images),
    featured: toBoolean(row.featured),
    status: parseUnion(row.status, LISTING_STATUSES, "draft"),
    sourceUrl: row.source_url ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at ?? undefined,
  };
}

/**
 * `Listing`, `Property` sözleşmesini zaten karşılar. Bu yardımcı, yalnızca
 * niyeti okunur kılmak için vardır (sunum katmanına veri geçerken).
 */
export function toProperty(listing: Listing): Property {
  return listing;
}

/* -------------------------------------------------------------------------- */
/* İç yardımcılar                                                              */
/* -------------------------------------------------------------------------- */

async function queryListings(
  filter: ListingFilter,
  orderBy: string,
): Promise<Listing[]> {
  const { limit, offset } = resolvePage(filter);
  const { where, params } = buildWhere(filter);

  const result = await getDb()
    .prepare(
      `SELECT ${COLUMNS} FROM listings ${where} ${orderBy} LIMIT ? OFFSET ?`,
    )
    .bind(...params, limit, offset)
    .all<ListingRow>();

  return result.results.map(mapRow);
}

/** Filtreyi bağlı parametrelerle WHERE parçasına çevirir. */
function buildWhere(filter: ListingFilter): {
  readonly where: string;
  readonly params: readonly unknown[];
} {
  const clauses: string[] = [];
  const params: unknown[] = [];

  const eq = (column: string, value: unknown): void => {
    clauses.push(`${column} = ?`);
    params.push(value);
  };

  if (filter.status !== undefined) eq("status", filter.status);
  if (filter.listingType !== undefined) eq("listing_type", filter.listingType);
  if (filter.category !== undefined) eq("category", filter.category);
  if (filter.city !== undefined) eq("city", filter.city);
  if (filter.district !== undefined) eq("district", filter.district);
  if (filter.featured !== undefined) eq("featured", fromBoolean(filter.featured));

  const search = filter.search?.trim();
  if (search !== undefined && search.length > 0) {
    // LIKE joker karakterleri kaçırılır, kullanıcı girdisi yine bağlanır.
    const pattern = `%${escapeLike(search)}%`;
    const searchColumns = ["title", "district", "location", "city"];
    clauses.push(
      `(${searchColumns
        .map((column) => `${column} LIKE ? ESCAPE '\\'`)
        .join(" OR ")})`,
    );
    params.push(...searchColumns.map(() => pattern));
  }

  return {
    where: clauses.length === 0 ? "" : `WHERE ${clauses.join(" AND ")}`,
    params,
  };
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

function parseStringArray(raw: string): string[] {
  const parsed = parseJsonSafe(raw);

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.filter((item): item is string => typeof item === "string");
}

function parseUnion<T extends string>(
  value: string,
  allowed: readonly T[],
  fallback: T,
): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function pricePeriodFor(listingType: ListingType): "ay" | null {
  return listingType === "kiralik" ? "ay" : null;
}

function integerOrZero(value: number | undefined): number {
  return value === undefined ? 0 : Math.max(0, Math.trunc(value));
}

function integerOrNull(value: number | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  return Math.max(0, Math.trunc(value));
}
