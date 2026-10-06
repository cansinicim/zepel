"use server";

import { headers } from "next/headers";

import { contactSection } from "@/content/sections";
import {
  isHoneypotFilled,
  readContactFormValues,
  validateContactForm,
  type ContactFormState,
} from "@/lib/contact-form";
import { create as createSubmission, hashClientIp } from "@/lib/db/submissions";
import { consumeRateLimit } from "@/lib/rate-limit";

/** Aynı istemciden 10 dakikada en fazla 5 gönderim. */
const RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 } as const;

/**
 * İstemci kimliği. Ters vekil arkasında `x-forwarded-for` ilk değeri kullanılır.
 * Başlık taklit edilebilir, bu yüzden oran sınırlama tek başına bir güvenlik
 * sınırı değil, kaba kullanımı yavaşlatan ilk katmandır.
 */
async function resolveClientKey(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  const candidate =
    forwarded?.split(",")[0]?.trim() || headerList.get("x-real-ip");

  return candidate && candidate.length > 0 ? candidate : "bilinmeyen";
}

/**
 * İletişim formu Server Action'ı.
 *
 * Doğrulama tamamen sunucuda yapılır; istemcideki `required` gibi öznitelikler
 * yalnızca kullanıcı kolaylığıdır, güvenlik sınırı değildir.
 *
 * Talep veritabanına yazılır ve yönetici panelindeki talep kutusunda görünür.
 * E-posta gönderimi bilinçli olarak yoktur: talepler panelden takip edilir,
 * böylece dış bir e-posta servisine ve onun ücretine bağımlılık doğmaz.
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

  const { allowed } = consumeRateLimit(await resolveClientKey(), RATE_LIMIT);

  if (!allowed) {
    return {
      status: "error",
      message: messages.tooManyRequests,
      detail: messages.tooManyRequestsDetail,
      fieldErrors: {},
      values,
    };
  }

  const fieldErrors = validateContactForm(values);

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: messages.validation,
      fieldErrors,
      values,
    };
  }

  try {
    await createSubmission({
      ...values,
      // Ham IP saklanmaz, yalnızca tuzlanmış özeti tutulur.
      ipHash: await hashClientIp(await resolveClientKey()),
    });
  } catch (error) {
    /*
     * Kayıt başarısızsa kullanıcıya başarı gösterilmez, aksi halde talebinin
     * ulaştığını sanır. Hata ayrıntısı kullanıcıya sızdırılmaz, yalnızca
     * sunucu kaydına düşer ve kişisel veri içermez.
     */
    console.error("[iletisim] talep kaydedilemedi", {
      reason: error instanceof Error ? error.message : "bilinmeyen",
      receivedAt: new Date().toISOString(),
    });

    return {
      status: "error",
      message: messages.unexpected,
      fieldErrors: {},
      values,
    };
  }

  return {
    status: "success",
    message: messages.success,
    detail: messages.successDetail,
    fieldErrors: {},
  };
}
