import { siteConfig } from "@/content/site";

/**
 * Sayaç animasyonu için biçimlendirici üretir.
 *
 * Ondalık basamak sayısı hedefe göre sabitlenir: tam sayı hedeflerde ara
 * değerler de tam sayı olarak görünür, ondalıklı hedeflerde tek basamak
 * korunur. Böylece sayaç sıçramaz ve bitiş değeri sunucunun bastığı metinle
 * birebir aynı olur.
 */
export function createCounterFormatter(
  fractionDigits: number,
): (value: number) => string {
  const formatter = new Intl.NumberFormat(siteConfig.locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
  return (value) => formatter.format(value);
}

/** Hedef değere göre gösterilecek ondalık basamak sayısı. */
export function resolveFractionDigits(target: number): number {
  return Number.isInteger(target) ? 0 : 1;
}
