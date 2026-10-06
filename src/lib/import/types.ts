/**
 * Emlak ilanı içe aktarma modülünün sözleşmesi.
 *
 * Bu dosya bilinçli olarak bağımsızdır: veri katmanından (`src/lib/db`) hiçbir
 * tip almaz. Böylece ayrıştırıcı, veritabanı şeması değiştiğinde kırılmaz ve
 * yönetici panelinde gösterilen "taslak ilan" ara biçimi tek yerde durur.
 *
 * Tüm alanlar isteğe bağlıdır, çünkü kaynak sayfa ne veriyorsa o okunur.
 * Eksik alanları yönetici panelde elle tamamlar.
 */

export type ListingType = "satilik" | "kiralik";

export type ListingCategory =
  | "villa"
  | "rezidans"
  | "daire"
  | "yali"
  | "arsa"
  | "ofis";

/** Bir alanın hangi yöntemle bulunduğu. Panelde güven göstergesi olarak kullanılır. */
export type ProvenanceSource = "json-ld" | "open-graph" | "microdata" | "metin";

export type ParsedListing = {
  title?: string;
  description?: string;
  /** Ham sayı, para birimi ayrı alanda taşınır. */
  price?: number;
  /** ISO 4217 kodu, varsayılan "TRY". */
  currency?: string;
  listingType?: ListingType;
  category?: ListingCategory;
  city?: string;
  district?: string;
  /** Mahalle veya semt. */
  location?: string;
  beds?: number;
  baths?: number;
  /** Brüt metrekare. Yalnızca net bulunabildiyse uyarı eklenir. */
  area?: number;
  plotArea?: number;
  buildYear?: number;
  features?: string[];
  images?: string[];
  sourceUrl?: string;
};

/** `provenance` anahtarları bu kümeden gelir. */
export type ParsedListingField = keyof ParsedListing;

export type ParseResult = {
  listing: ParsedListing;
  /** Hangi alan hangi yöntemle bulundu, panelde güven göstergesi olarak kullanılır. */
  provenance: Record<string, ProvenanceSource>;
  warnings: string[];
};

/**
 * Uzak sayfayı çekme sonucu.
 *
 * Hatalar istisna olarak fırlatılmaz; panelin kullanıcıya doğru mesajı
 * gösterebilmesi için ayrık birlik (discriminated union) olarak döner.
 * Özellikle `BLOCKED`, "bu site otomatik erişimi engelledi, sayfa içeriğini
 * kopyalayıp yapıştırın" akışını tetikler.
 */
export type FetchFailureReason =
  | "INVALID_URL"
  | "BLOCKED"
  | "TIMEOUT"
  | "HTTP_ERROR"
  | "NOT_HTML"
  | "TOO_MANY_REDIRECTS"
  | "NETWORK_ERROR";

export type FetchListingSuccess = {
  ok: true;
  html: string;
  /** Yönlendirmeler izlendikten sonra ulaşılan adres. */
  finalUrl: string;
  /** Boyut sınırına takılıp kesildiyse true. */
  truncated: boolean;
};

export type FetchListingFailure = {
  ok: false;
  reason: FetchFailureReason;
  /** Panelde doğrudan gösterilebilecek Türkçe açıklama. */
  message: string;
  httpStatus?: number;
  finalUrl?: string;
};

export type FetchListingResult = FetchListingSuccess | FetchListingFailure;

/**
 * `importFromUrl` sonucu. Ayrıştırma her zaman bir `ParseResult` üretir,
 * ama sayfaya hiç ulaşılamadıysa ayrıştırılacak bir şey yoktur; bu yüzden
 * çekme hatası ayrı bir dal olarak taşınır.
 */
export type ImportOutcome =
  | {
      ok: true;
      result: ParseResult;
      finalUrl: string;
      truncated: boolean;
    }
  | {
      ok: false;
      failure: FetchListingFailure;
    };
