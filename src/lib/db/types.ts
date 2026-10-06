import type {
  ListingType,
  Property,
  PropertyCategory,
} from "@/content/properties";
import type { ContactFormValues } from "@/lib/contact-form";

/**
 * Veri katmanının tip sözleşmesi.
 *
 * İki ayrı tip ailesi vardır ve karıştırılmaz:
 *   * `*Row`     : D1'den okunan ham satır. Sütun adları snake_case, boş alanlar `null`.
 *   * Alan tipi  : Uygulamanın kullandığı biçim (camelCase, opsiyonel alanlar).
 * Dönüşüm her tablo için tek bir yerde (ilgili modülün `mapRow` fonksiyonu) yapılır.
 */

/* -------------------------------------------------------------------------- */
/* D1 istemcisi                                                                */
/* -------------------------------------------------------------------------- */

/**
 * D1 API'sinin kullandığımız kadarı. `@cloudflare/workers-types` bu projede
 * kurulu olmadığı için asgari ve yapısal olarak uyumlu bir tanım tutuyoruz;
 * gerçek `D1Database` bu arayüze sorunsuz atanır. Paket eklendiğinde bu blok
 * silinip global tip kullanılabilir.
 */
export type D1Result<T> = {
  readonly results: T[];
  readonly success: boolean;
};

export type D1PreparedStatement = {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<D1Result<T>>;
  run(): Promise<D1Result<unknown>>;
};

export type D1Database = {
  prepare(query: string): D1PreparedStatement;
};

/* -------------------------------------------------------------------------- */
/* Ortak                                                                       */
/* -------------------------------------------------------------------------- */

/** Sayfalama girdisi. Sınırlar `client.ts` içindeki PAGINATION ile kırpılır. */
export type PageOptions = {
  readonly limit?: number;
  readonly offset?: number;
};

/* -------------------------------------------------------------------------- */
/* listings                                                                    */
/* -------------------------------------------------------------------------- */

export const LISTING_STATUSES = ["draft", "published", "archived"] as const;

export type ListingStatus = (typeof LISTING_STATUSES)[number];

/** listings tablosunun ham satırı. */
export type ListingRow = {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly location: string;
  readonly city: string;
  readonly district: string;
  readonly listing_type: string;
  readonly category: string;
  readonly price: number;
  readonly price_period: string | null;
  readonly beds: number;
  readonly baths: number;
  readonly area: number;
  readonly plot_area: number | null;
  readonly build_year: number | null;
  /** JSON dizi metni */
  readonly features: string;
  /** JSON dizi metni */
  readonly images: string;
  readonly featured: number;
  readonly status: string;
  readonly source_url: string | null;
  readonly created_at: string;
  readonly updated_at: string;
  readonly published_at: string | null;
};

/**
 * İlanın alan tipi. `Property` sözleşmesini aynen kapsar, üzerine yalnızca
 * yönetim tarafının ihtiyaç duyduğu alanları ekler. Bu sayede bir `Listing`,
 * mevcut sayfalara `Property` olarak doğrudan verilebilir.
 */
export type Listing = Property & {
  readonly status: ListingStatus;
  readonly sourceUrl?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly publishedAt?: string;
};

/**
 * Yeni ilan girdisi. `slug` ve `priceLabel` türetilir, `pricePeriod` ilan
 * tipinden çıkarılır, `status` her zaman 'draft' başlar.
 */
export type ListingInput = {
  readonly title: string;
  readonly description?: string;
  readonly location?: string;
  readonly city?: string;
  readonly district?: string;
  readonly listingType: ListingType;
  readonly category: PropertyCategory;
  /** Ham fiyat, TRY. Kiralık ilanda aylık bedeldir. */
  readonly price: number;
  readonly beds?: number;
  readonly baths?: number;
  readonly area?: number;
  readonly plotArea?: number | null;
  readonly buildYear?: number | null;
  readonly features?: readonly string[];
  readonly images?: readonly string[];
  readonly featured?: boolean;
  readonly sourceUrl?: string | null;
};

/**
 * Kısmi güncelleme. `status` bilerek dışarıda bırakıldı: durum geçişleri
 * `publish()` ve `archive()` üzerinden yapılır, böylece `published_at`
 * tutarlılığı tek noktada korunur.
 */
export type ListingPatch = Partial<ListingInput>;

/** Yönetim tarafı liste filtresi. Tüm alanlar parametre olarak bağlanır. */
export type ListingFilter = PageOptions & {
  readonly status?: ListingStatus;
  readonly listingType?: ListingType;
  readonly category?: PropertyCategory;
  readonly city?: string;
  readonly district?: string;
  readonly featured?: boolean;
  /** Başlık, semt ve mahalle üzerinde serbest metin araması. */
  readonly search?: string;
};

/** Genele açık liste filtresi: durum sabittir, dışarıdan verilemez. */
export type PublishedListingFilter = Omit<ListingFilter, "status">;

/* -------------------------------------------------------------------------- */
/* submissions                                                                 */
/* -------------------------------------------------------------------------- */

export const SUBMISSION_STATUSES = ["new", "read", "archived"] as const;

export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

export type SubmissionRow = {
  readonly id: string;
  readonly full_name: string;
  readonly phone: string;
  readonly email: string;
  readonly service: string;
  readonly message: string;
  readonly status: string;
  readonly ip_hash: string | null;
  readonly created_at: string;
};

export type Submission = {
  readonly id: string;
  readonly fullName: string;
  readonly phone: string;
  readonly email: string;
  readonly service: string;
  readonly message: string;
  readonly status: SubmissionStatus;
  /** Tuzlanmış IP özeti. Ham IP hiçbir yerde saklanmaz. */
  readonly ipHash?: string;
  readonly createdAt: string;
};

/**
 * Form girdisi, `ContactFormValues` ile birebir aynıdır. Sözleşme
 * `src/lib/contact-form.ts` içinde yaşar, burada yalnızca genişletilir.
 */
export type SubmissionInput = ContactFormValues & {
  readonly ipHash?: string | null;
};

/* -------------------------------------------------------------------------- */
/* imports                                                                     */
/* -------------------------------------------------------------------------- */

export const IMPORT_STATUSES = ["pending", "parsed", "failed", "applied"] as const;

export type ImportStatus = (typeof IMPORT_STATUSES)[number];

export type ImportRow = {
  readonly id: string;
  readonly source_url: string | null;
  readonly raw_input: string;
  readonly status: string;
  readonly parsed_json: string | null;
  readonly error: string | null;
  readonly listing_id: string | null;
  readonly created_at: string;
};

export type ImportRecord = {
  readonly id: string;
  readonly sourceUrl?: string;
  readonly rawInput: string;
  readonly status: ImportStatus;
  /** Ayrıştırılmış ilan alanları. Bozuk JSON durumunda `undefined` döner. */
  readonly parsed?: unknown;
  readonly error?: string;
  readonly listingId?: string;
  readonly createdAt: string;
};

export type ImportInput = {
  readonly rawInput: string;
  readonly sourceUrl?: string | null;
};
