import { contactSection } from "@/content/sections";
import type {
  ImportStatus,
  ListingStatus,
  SubmissionStatus,
} from "@/lib/db/types";

/**
 * Yönetim panelinin paylaşılan metinleri ve etiket tabloları.
 *
 * Panel metinleri bileşenlerin içine gömülmez. Sayfaya özgü metinler ilgili
 * dosyanın başındaki `COPY` sabitinde, birden çok sayfada tekrarlananlar ise
 * burada durur. Genel site içeriği (`src/content`) bu panelden beslenmez;
 * yalnızca ilan tipi ve hizmet etiketleri gibi ortak sözlükler oradan okunur.
 */

/**
 * Panel rotaları. Adresler tek yerde durur, bileşenlerde metin olarak
 * tekrarlanmaz.
 */
export const ADMIN_PATHS = {
  home: "/admin",
  login: "/admin/login",
  submissions: "/admin/talepler",
  listings: "/admin/ilanlar",
  import: "/admin/ice-aktar",
  listingEdit: (id: string): string => `/admin/ilanlar/${encodeURIComponent(id)}`,
} as const;

/** Genele açık sayfalar. Yayınlanan ilanın önizleme adresi buradan üretilir. */
export const PUBLIC_PATHS = {
  home: "/",
  portfolio: "/portfoy",
  listing: (slug: string): string => `/portfoy/${encodeURIComponent(slug)}`,
} as const;

export const ADMIN_BRAND = {
  title: "Zepel Yönetim",
  subtitle: "Portföy ve talep paneli",
} as const;

/** Kenar menü. `exact`, yalnızca tam eşleşmede etkin sayılacak bağlantıyı işaretler. */
export const ADMIN_NAV_ITEMS = [
  { href: ADMIN_PATHS.home, label: "Özet", exact: true, badge: false },
  { href: ADMIN_PATHS.submissions, label: "Talepler", exact: false, badge: true },
  { href: ADMIN_PATHS.listings, label: "İlanlar", exact: false, badge: false },
  { href: ADMIN_PATHS.import, label: "İçe aktar", exact: false, badge: false },
] as const;

export type AdminNavItem = (typeof ADMIN_NAV_ITEMS)[number];

/** Rozet ve etiketlerde kullanılan görsel ton. */
export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger";

/* -------------------------------------------------------------------------- */
/* Durum sözlükleri                                                            */
/* -------------------------------------------------------------------------- */

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  draft: "Taslak",
  published: "Yayında",
  archived: "Arşiv",
};

export const LISTING_STATUS_TONES: Record<ListingStatus, BadgeTone> = {
  draft: "warning",
  published: "success",
  archived: "neutral",
};

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  new: "Yeni",
  read: "Okundu",
  archived: "Arşiv",
};

export const SUBMISSION_STATUS_TONES: Record<SubmissionStatus, BadgeTone> = {
  new: "accent",
  read: "neutral",
  archived: "neutral",
};

export const IMPORT_STATUS_LABELS: Record<ImportStatus, string> = {
  pending: "Bekliyor",
  parsed: "Ayrıştırıldı",
  failed: "Başarısız",
  applied: "Taslağa dönüştürüldü",
};

export const IMPORT_STATUS_TONES: Record<ImportStatus, BadgeTone> = {
  pending: "neutral",
  parsed: "accent",
  failed: "danger",
  applied: "success",
};

/* -------------------------------------------------------------------------- */
/* Adres çubuğundaki filtreler                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Filtre sekmeleri. Adres çubuğunda Türkçe ve okunur bir değer taşınır
 * ("?durum=yayinda"), veritabanı durumu buradan çözülür. Bilinmeyen değer
 * varsayılana düşer, hiçbir zaman doğrudan sorguya verilmez.
 */
export const FILTER_PARAM = "durum";

export type StatusFilter<TStatus extends string> = {
  readonly slug: string;
  readonly status: TStatus;
  readonly label: string;
};

export const LISTING_FILTERS: readonly StatusFilter<ListingStatus>[] = [
  { slug: "taslak", status: "draft", label: LISTING_STATUS_LABELS.draft },
  { slug: "yayinda", status: "published", label: LISTING_STATUS_LABELS.published },
  { slug: "arsiv", status: "archived", label: LISTING_STATUS_LABELS.archived },
];

export const SUBMISSION_FILTERS: readonly StatusFilter<SubmissionStatus>[] = [
  { slug: "yeni", status: "new", label: SUBMISSION_STATUS_LABELS.new },
  { slug: "okundu", status: "read", label: SUBMISSION_STATUS_LABELS.read },
  { slug: "arsiv", status: "archived", label: SUBMISSION_STATUS_LABELS.archived },
];

/** Adres çubuğundaki değeri güvenle durum değerine çevirir. */
export function resolveStatusFilter<TStatus extends string>(
  filters: readonly StatusFilter<TStatus>[],
  raw: string | undefined,
): StatusFilter<TStatus> {
  return filters.find((filter) => filter.slug === raw) ?? filters[0];
}

/* -------------------------------------------------------------------------- */
/* Ortak eylem metinleri                                                       */
/* -------------------------------------------------------------------------- */

export const ADMIN_ACTIONS = {
  signOut: "Çıkış yap",
  save: "Kaydet",
  saving: "Kaydediliyor",
  publish: "Yayına al",
  archive: "Arşivle",
  edit: "Düzenle",
  markRead: "Okundu işaretle",
  preview: "Önizleme",
  openSource: "Kaynak sayfa",
  working: "İşleniyor",
} as const;

export const CONFIRM_MESSAGES = {
  publishListing:
    "İlan yayına alınacak ve site üzerinde herkese görünür olacak. Onaylıyor musunuz?",
  archiveListing:
    "İlan arşive alınacak ve siteden kaldırılacak. Onaylıyor musunuz?",
  archiveSubmission: "Talep arşive alınacak. Onaylıyor musunuz?",
} as const;

/* -------------------------------------------------------------------------- */
/* İçerik sözlükleri                                                           */
/* -------------------------------------------------------------------------- */

export { categoryLabels, listingTypeLabels } from "@/content/properties";

const SERVICE_LABELS: Readonly<Record<string, string>> = Object.fromEntries(
  contactSection.serviceOptions.map((option) => [option.value, option.label]),
);

/** Talepteki hizmet değerini okunur etikete çevirir, bilinmiyorsa ham değeri döner. */
export function serviceLabel(value: string): string {
  return SERVICE_LABELS[value] ?? value;
}
