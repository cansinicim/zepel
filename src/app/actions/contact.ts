"use server";

import { contactSection } from "@/content/sections";
import {
  isHoneypotFilled,
  readContactFormValues,
  validateContactForm,
  type ContactFormState,
} from "@/lib/contact-form";

/**
 * İletişim formu Server Action'ı.
 *
 * Doğrulama tamamen sunucuda yapılır; istemcideki `required` gibi öznitelikler
 * yalnızca kullanıcı kolaylığıdır, güvenlik sınırı değildir.
 *
 * TODO: Gerçek e-posta / CRM entegrasyonu bağlanacak (örn. transactional mail
 * servisi ya da ofis CRM webhook'u). Bugün yalnızca sunucu kaydı düşülür.
 */
export async function submitContactForm(
  _previousState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const messages = contactSection.status;

  // Bot tuzağı dolduysa isteği başarılı gibi karşılar, hiçbir şey işlemeyiz.
  if (isHoneypotFilled(formData)) {
    return {
      status: "success",
      message: messages.success,
      detail: messages.successDetail,
      fieldErrors: {},
    };
  }

  const values = readContactFormValues(formData);
  const fieldErrors = validateContactForm(values);

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: messages.validation,
      fieldErrors,
      values,
    };
  }

  // Kişisel veri loglanmaz: ad, telefon, e-posta ve mesaj gövdesi kayda düşmez.
  console.log("[iletisim] yeni görüşme talebi", {
    service: values.service,
    hasMessage: values.message.length > 0,
    receivedAt: new Date().toISOString(),
  });

  return {
    status: "success",
    message: messages.success,
    detail: messages.successDetail,
    fieldErrors: {},
  };
}
