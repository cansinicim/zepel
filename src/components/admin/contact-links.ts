/**
 * Talep kutusundaki tıklanabilir iletişim bağlantıları.
 *
 * GÜVENLİK: Bağlantı adresleri kullanıcı girdisinden türetilir, bu yüzden
 * şema (scheme) asla girdiden gelmez. Telefon yalnızca rakamlara indirgenir,
 * e-posta biçim kontrolünden geçmeden bağlantıya dönüşmez. Böylece
 * "javascript:" gibi bir şema enjekte edilemez. Doğrulamayı geçmeyen değer
 * bağlantı değil, düz metin olarak gösterilir.
 */

/** Türkiye ülke kodu, yerel yazılmış numaraları tamamlamak için. */
const COUNTRY_CODE = "90";

/** Ulusal numara uzunluğu (alan kodu dahil, baştaki sıfır hariç). */
const NATIONAL_LENGTH = 10;

/** Uluslararası numaralarda kabul edilen uzunluk aralığı. */
const MIN_DIGITS = 10;
const MAX_DIGITS = 15;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

/** Girdiyi yalnızca rakamlara indirger. */
function digitsOf(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Numarayı uluslararası biçime yaklaştırır.
 * "0532 417 60 20" ve "532 417 60 20" için "905324176020" üretir.
 */
export function normalizePhone(raw: string): string | null {
  let digits = digitsOf(raw);

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  if (digits.length === NATIONAL_LENGTH + 1 && digits.startsWith("0")) {
    digits = `${COUNTRY_CODE}${digits.slice(1)}`;
  } else if (digits.length === NATIONAL_LENGTH) {
    digits = `${COUNTRY_CODE}${digits}`;
  }

  if (digits.length < MIN_DIGITS || digits.length > MAX_DIGITS) {
    return null;
  }

  return digits;
}

/** "tel:" bağlantısı. Numara çözülemezse null. */
export function telHref(raw: string): string | null {
  const digits = normalizePhone(raw);
  return digits === null ? null : `tel:+${digits}`;
}

/** WhatsApp bağlantısı. Numara çözülemezse null. */
export function whatsappHref(raw: string): string | null {
  const digits = normalizePhone(raw);
  return digits === null ? null : `https://wa.me/${digits}`;
}

/** "mailto:" bağlantısı. Adres biçimi geçersizse null. */
export function mailtoHref(raw: string): string | null {
  const address = raw.trim();
  return EMAIL_PATTERN.test(address) ? `mailto:${encodeURI(address)}` : null;
}

/**
 * Görsellerde ve kaynak bağlantılarında kullanılacak adresi doğrular.
 * Yalnızca http ve https kabul edilir.
 */
export function safeHttpUrl(raw: string | undefined): string | null {
  if (raw === undefined || raw.length === 0) return null;

  try {
    const url = new URL(raw);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}
