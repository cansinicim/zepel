import { siteConfig } from "@/content/site";

/**
 * Sayı biçimlendirme yardımcıları.
 * Locale tek yerden (`siteConfig.locale`) okunur, bileşenlerde tekrar yazılmaz.
 * Formatlayıcılar modül seviyesinde bir kez kurulur; sunucuda ve istemcide
 * aynı çıktıyı verdikleri için hidrasyon farkı oluşmaz.
 */

const decimalFormatter = new Intl.NumberFormat(siteConfig.locale, {
  maximumFractionDigits: 1,
});

const integerFormatter = new Intl.NumberFormat(siteConfig.locale, {
  maximumFractionDigits: 0,
});

/** Ondalık basamağı olan sayıları Türkçe ayraçla biçimler, örn 12,4 ve 1.240 */
export function formatNumber(value: number): string {
  return Number.isInteger(value)
    ? integerFormatter.format(value)
    : decimalFormatter.format(value);
}

/** Alan değeri, birim çağıran tarafından eklenir. */
export function formatArea(value: number): string {
  return integerFormatter.format(value);
}

/** Sıra numarasını iki haneye tamamlar, örn 1 -> "01" */
export function padIndex(value: number): string {
  return String(value).padStart(2, "0");
}

/* Saat dilimi UTC'ye sabitlenir, sunucu ve istemci aynı günü basar. */
const longDateFormatter = new Intl.DateTimeFormat(siteConfig.locale, {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** ISO tarihi (YYYY-MM-DD) uzun Türkçe biçime çevirir, örn "2 Eylül 2026" */
export function formatLongDate(isoDate: string): string {
  return longDateFormatter.format(new Date(`${isoDate}T00:00:00Z`));
}
