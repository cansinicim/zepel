import { siteConfig } from "@/content/site";

/**
 * Yönetim panelinin tarih ve sayı biçimlendirmesi.
 *
 * Saat dilimi ofisin saatine sabitlenir. Panel sayfaları yalnızca sunucuda
 * çizildiği için çıktı deterministiktir; istemcinin yerel saatine göre kayan
 * bir değer üretilmez.
 */

const TIME_ZONE = "Europe/Istanbul";

const dateTimeFormatter = new Intl.DateTimeFormat(siteConfig.locale, {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: TIME_ZONE,
});

const dateFormatter = new Intl.DateTimeFormat(siteConfig.locale, {
  dateStyle: "medium",
  timeZone: TIME_ZONE,
});

/** Geçersiz veya boş tarihlerde tabloyu bozmamak için basılan yer tutucu. */
const EMPTY = "-";

function parse(iso: string | undefined): Date | null {
  if (iso === undefined || iso.length === 0) return null;

  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** ISO zaman damgasını "12 Eyl 2026 14:30" biçimine çevirir. */
export function formatDateTime(iso: string | undefined): string {
  const date = parse(iso);
  return date === null ? EMPTY : dateTimeFormatter.format(date);
}

/** ISO zaman damgasını yalnızca gün olarak biçimler. */
export function formatDate(iso: string | undefined): string {
  const date = parse(iso);
  return date === null ? EMPTY : dateFormatter.format(date);
}

/**
 * Sayfalama sınırına dayanan sayımlar için etiket. Sınıra ulaşıldıysa
 * gerçek toplam bilinmediği için "100+" biçiminde gösterilir.
 */
export function formatCount(value: number, limit: number): string {
  return value >= limit ? `${limit}+` : String(value);
}

/** Uzun metni tabloda taşırmadan kısaltır. */
export function truncate(value: string, max: number): string {
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}
