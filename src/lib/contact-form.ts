import { contactSection, type FormFieldName } from "@/content/sections";

/**
 * İletişim formunun sözleşmesi ve saf doğrulama mantığı.
 *
 * Bu modülde sunucuya özgü hiçbir şey yoktur, bu yüzden hem Server Action hem de
 * istemci tarafı bileşen aynı tipleri paylaşabilir. Server Action dosyaları
 * ("use server") yalnızca async fonksiyon export edebildiği için sabitler ve
 * tipler burada durur.
 */

export type ContactFormStatus = "idle" | "success" | "error";

export type ContactFieldErrors = Partial<Record<FormFieldName, string>>;

export type ContactFormState = {
  readonly status: ContactFormStatus;
  readonly message: string;
  readonly detail?: string;
  readonly fieldErrors: ContactFieldErrors;
  /**
   * Hata durumunda formu yeniden doldurmak için kullanıcı girdisi.
   * Yalnızca `defaultValue` olarak verilir, HTML olarak render edilmez.
   */
  readonly values?: Partial<Record<FormFieldName, string>>;
};

export const initialContactFormState: ContactFormState = {
  status: "idle",
  message: contactSection.status.idle,
  fieldErrors: {},
};

/** Bot tuzağı alanı. Görünmez tutulur, doldurulmuşsa istek sessizce yok sayılır. */
export const HONEYPOT_FIELD = "sirket-adi";

export const CONTACT_LIMITS = {
  nameMin: 2,
  nameMax: 120,
  phoneDigitsMin: 10,
  phoneDigitsMax: 15,
  /** Ham uzunluk sınırı: rakam dışı karakterle şişirilmiş girdiyi eler. */
  phoneRawMax: 40,
  emailMax: 254,
  messageMin: 20,
  messageMax: 1500,
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

const countDigits = (value: string): number =>
  (value.match(/\d/g) ?? []).length;

const validServiceValues = new Set<string>(
  contactSection.serviceOptions.map((option) => option.value),
);

export type ContactFormValues = Record<FormFieldName, string>;

/** FormData'yı kırpılmış string alanlara indirger. */
export function readContactFormValues(formData: FormData): ContactFormValues {
  const read = (name: FormFieldName): string => {
    const value = formData.get(name);
    return typeof value === "string" ? value.trim() : "";
  };

  return {
    fullName: read("fullName"),
    phone: read("phone"),
    email: read("email"),
    service: read("service"),
    message: read("message"),
  };
}

/** Bot tuzağı alanı doldurulmuş mu? */
export function isHoneypotFilled(formData: FormData): boolean {
  const value = formData.get(HONEYPOT_FIELD);
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Alan bazlı doğrulama. Tüm uyarı metinleri içerik katmanından gelir.
 * Boş nesne dönerse form geçerlidir.
 */
export function validateContactForm(
  values: ContactFormValues,
): ContactFieldErrors {
  const messages = contactSection.status;
  const errors: ContactFieldErrors = {};

  if (values.fullName.length === 0) {
    errors.fullName = messages.requiredField;
  } else if (
    values.fullName.length < CONTACT_LIMITS.nameMin ||
    values.fullName.length > CONTACT_LIMITS.nameMax
  ) {
    errors.fullName = messages.invalidName;
  }

  if (values.phone.length === 0) {
    errors.phone = messages.requiredField;
  } else {
    const digits = countDigits(values.phone);
    if (
      values.phone.length > CONTACT_LIMITS.phoneRawMax ||
      digits < CONTACT_LIMITS.phoneDigitsMin ||
      digits > CONTACT_LIMITS.phoneDigitsMax
    ) {
      errors.phone = messages.invalidPhone;
    }
  }

  if (values.email.length === 0) {
    errors.email = messages.requiredField;
  } else if (
    values.email.length > CONTACT_LIMITS.emailMax ||
    !EMAIL_PATTERN.test(values.email)
  ) {
    errors.email = messages.invalidEmail;
  }

  if (values.service.length === 0) {
    errors.service = messages.requiredField;
  } else if (!validServiceValues.has(values.service)) {
    errors.service = messages.invalidService;
  }

  // Mesaj zorunlu değildir, ama yazıldıysa anlamlı bir uzunlukta olmalıdır.
  if (values.message.length > 0) {
    if (values.message.length < CONTACT_LIMITS.messageMin) {
      errors.message = messages.shortMessage;
    } else if (values.message.length > CONTACT_LIMITS.messageMax) {
      errors.message = messages.longMessage;
    }
  }

  return errors;
}
