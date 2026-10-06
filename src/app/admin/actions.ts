"use server";

import { revalidatePath } from "next/cache";
import {
  LISTING_INTENT_FIELD,
  LISTING_INTENT_PUBLISH,
  type ImportUrlState,
  type ListingFormState,
  type LoginState,
  type SaveImportDraftState,
} from "@/components/admin/action-state";
import { redirect } from "next/navigation";

import { ADMIN_PATHS } from "@/components/admin/labels";
import {
  readListingForm,
  toListingInput,
  validateListingForm,
} from "@/components/admin/listing-form-schema";
import { isSignedIn, requireAdmin, signIn, signOut } from "@/lib/admin-auth";
import * as importsDb from "@/lib/db/imports";
import * as listingsDb from "@/lib/db/listings";
import * as submissionsDb from "@/lib/db/submissions";
import type { ListingInput } from "@/lib/db/types";
import { importFromUrl } from "@/lib/import";
import { consumeRateLimit } from "@/lib/rate-limit";

/**
 * Yönetim panelinin sunucu eylemleri.
 *
 * GÜVENLİK: Her eylem (giriş hariç) ilk satırında `requireAdmin()` çağırır.
 * Sayfanın `requireSession()` ile korunuyor olması bu eylemleri korumaz;
 * eylemler kendi uç noktalarıdır ve doğrudan çağrılabilir.
 */

/** Giriş denemesi oran sınırı: 10 dakikada en fazla 8 deneme, IP başına. */
const LOGIN_RATE_LIMIT = { limit: 8, windowMs: 10 * 60 * 1000 } as const;

/** İçe aktarma girdisi için üst sınırlar; boş veya aşırı büyük girdi elenir. */
const IMPORT_LIMITS = {
  urlMax: 2048,
  htmlMax: 4_000_000,
} as const;

const GENERIC_LOGIN_ERROR = "Giriş bilgileri hatalı.";

/* -------------------------------------------------------------------------- */
/* Kimlik doğrulama                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Giriş eylemi. Tek istisna: `requireAdmin()` çağırmaz, çünkü henüz oturum
 * yoktur. Oran sınırlaması, bilinen bir istemci kimliği olmadığı için
 * sabit bir anahtar yerine `x-forwarded-for` üzerinden çözülür.
 */
export async function signInAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const { headers } = await import("next/headers");
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  const clientKey =
    forwarded?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "bilinmeyen";

  const { allowed } = consumeRateLimit(`admin-login:${clientKey}`, LOGIN_RATE_LIMIT);
  if (!allowed) {
    return {
      status: "error",
      message: "Çok fazla deneme yapıldı. Birkaç dakika sonra tekrar deneyin.",
    };
  }

  const password = formData.get("password");
  if (typeof password !== "string" || password.length === 0) {
    return { status: "error", message: GENERIC_LOGIN_ERROR };
  }

  const ok = await signIn(password);
  if (!ok) {
    return { status: "error", message: GENERIC_LOGIN_ERROR };
  }

  redirect(ADMIN_PATHS.home);
}

export async function signOutAction(): Promise<void> {
  await requireAdmin();
  await signOut();
  redirect(ADMIN_PATHS.login);
}

/* -------------------------------------------------------------------------- */
/* Talepler                                                                    */
/* -------------------------------------------------------------------------- */

export async function markSubmissionReadAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = readId(formData);
  if (id === null) return;

  await submissionsDb.markRead(id);
  revalidatePath(ADMIN_PATHS.submissions);
  revalidatePath(ADMIN_PATHS.home);
}

export async function archiveSubmissionAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = readId(formData);
  if (id === null) return;

  await submissionsDb.archive(id);
  revalidatePath(ADMIN_PATHS.submissions);
  revalidatePath(ADMIN_PATHS.home);
}

/* -------------------------------------------------------------------------- */
/* İlanlar                                                                     */
/* -------------------------------------------------------------------------- */

/** İlan yayınlandığında/güncellendiğinde genel sitedeki etkilenen yolları tazeler. */
function revalidatePublicListingPaths(slug?: string): void {
  revalidatePath("/");
  revalidatePath("/portfoy");
  if (slug !== undefined) {
    revalidatePath(`/portfoy/${slug}`);
  }
}

export async function publishListingAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = readId(formData);
  if (id === null) return;

  const listing = await listingsDb.publish(id);
  revalidatePath(ADMIN_PATHS.listings);
  revalidatePath(ADMIN_PATHS.home);
  revalidatePublicListingPaths(listing?.slug);
}

export async function archiveListingAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = readId(formData);
  if (id === null) return;

  const listing = await listingsDb.archive(id);
  revalidatePath(ADMIN_PATHS.listings);
  revalidatePath(ADMIN_PATHS.home);
  revalidatePublicListingPaths(listing?.slug);
}

/**
 * Formdaki gönderim düğmesinin adı ve "kaydet ve yayınla" değeri.
 * `ListingEditForm` iki ayrı düğmeye aynı `name`, farklı `value` verir;
 * eylem hangi düğmenin tıklandığını buradan çözer.
 */
/**
 * İlan güncelleme eylemi. Tek form, tek eylem: hangi düğmenin tıklandığı
 * `intent` alanından okunur (bkz. `ListingEditForm`). Değer "kaydet-ve-yayinla"
 * ise güncellemenin ardından ilan yayına da alınır, aksi halde yalnızca
 * alanlar kaydedilir ve durum değişmez.
 */
export async function updateListingAction(
  id: string,
  _previousState: ListingFormState,
  formData: FormData,
): Promise<ListingFormState> {
  await requireAdmin();

  const shouldPublish = formData.get(LISTING_INTENT_FIELD) === LISTING_INTENT_PUBLISH;
  const values = readListingForm(formData);
  const fieldErrors = validateListingForm(values);

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Formda düzeltilmesi gereken alanlar var.",
      fieldErrors,
      values,
    };
  }

  const input = toListingInput(values);
  const updated = await listingsDb.update(id, input);

  if (updated === null) {
    return {
      status: "error",
      message: "İlan bulunamadı, kaydedilemedi.",
      fieldErrors: {},
      values,
    };
  }

  const finalListing = shouldPublish ? await listingsDb.publish(id) : updated;

  revalidatePath(ADMIN_PATHS.listingEdit(id));
  revalidatePath(ADMIN_PATHS.listings);
  if (shouldPublish || updated.status === "published") {
    revalidatePath(ADMIN_PATHS.home);
    revalidatePublicListingPaths((finalListing ?? updated).slug);
  }

  return {
    status: "success",
    message: shouldPublish ? "İlan kaydedildi ve yayına alındı." : "İlan kaydedildi.",
    fieldErrors: {},
    values,
  };
}

/* -------------------------------------------------------------------------- */
/* İçe aktarma                                                                 */
/* -------------------------------------------------------------------------- */

/** Bağlantıdan içe aktarma. Sonuç doğrudan kaydedilmez, önizleme formuna dökülür. */
export async function importFromUrlAction(
  _previousState: ImportUrlState,
  formData: FormData,
): Promise<ImportUrlState> {
  await requireAdmin();

  const rawUrl = formData.get("url");
  const url = typeof rawUrl === "string" ? rawUrl.trim() : "";

  if (url.length === 0) {
    return { status: "error", message: "Bir bağlantı girin." };
  }

  if (url.length > IMPORT_LIMITS.urlMax) {
    return { status: "error", message: "Bağlantı çok uzun." };
  }

  const record = await importsDb.create({ rawInput: url, sourceUrl: url });
  const outcome = await importFromUrl(url);

  if (!outcome.ok) {
    await importsDb.markFailed(record.id, outcome.failure.message);

    if (outcome.failure.reason === "BLOCKED") {
      return {
        status: "error",
        message:
          "Bu site otomatik erişimi engelliyor. Sayfa içeriğini kopyalayıp aşağıdaki kutuya yapıştırın.",
        importId: record.id,
      };
    }

    return { status: "error", message: outcome.failure.message, importId: record.id };
  }

  await importsDb.markParsed(record.id, outcome.result);

  return {
    status: "success",
    message:
      outcome.result.warnings.length > 0
        ? "İçerik ayrıştırıldı, birkaç uyarı var. Alanları kontrol edip kaydedin."
        : "İçerik ayrıştırıldı. Alanları kontrol edip kaydedin.",
    result: outcome.result,
    importId: record.id,
  };
}

/** Yapıştırılan sayfa içeriğinden içe aktarma. Ağ erişimi içermez. */
export async function importFromHtmlAction(
  _previousState: ImportUrlState,
  formData: FormData,
): Promise<ImportUrlState> {
  await requireAdmin();

  const rawHtml = formData.get("html");
  const html = typeof rawHtml === "string" ? rawHtml.trim() : "";
  const rawSourceUrl = formData.get("sourceUrl");
  const sourceUrl =
    typeof rawSourceUrl === "string" && rawSourceUrl.trim().length > 0
      ? rawSourceUrl.trim()
      : undefined;

  if (html.length === 0) {
    return { status: "error", message: "Yapıştırılacak içerik boş olamaz." };
  }

  if (html.length > IMPORT_LIMITS.htmlMax) {
    return { status: "error", message: "Yapıştırılan içerik çok büyük." };
  }

  const record = await importsDb.create({ rawInput: html, sourceUrl });

  const { importFromHtml } = await import("@/lib/import");
  const result = importFromHtml(html, sourceUrl);
  await importsDb.markParsed(record.id, result);

  return {
    status: "success",
    message:
      result.warnings.length > 0
        ? "İçerik ayrıştırıldı, birkaç uyarı var. Alanları kontrol edip kaydedin."
        : "İçerik ayrıştırıldı. Alanları kontrol edip kaydedin.",
    result,
    importId: record.id,
  };
}

/**
 * Önizlemede düzenlenen alanları taslak ilan olarak kaydeder.
 * Yönetici düzeltmeden önce hiçbir şey veritabanına yazılmaz.
 */
export async function saveImportDraftAction(
  importId: string,
  _previousState: SaveImportDraftState,
  formData: FormData,
): Promise<SaveImportDraftState> {
  await requireAdmin();

  const values = readListingForm(formData);
  const fieldErrors = validateListingForm(values);

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Formda düzeltilmesi gereken alanlar var.",
      fieldErrors,
      values,
    };
  }

  const input: ListingInput = toListingInput(values);
  const listing = await listingsDb.createDraft(input);
  await importsDb.markApplied(importId, listing.id);

  revalidatePath(ADMIN_PATHS.listings);
  revalidatePath(ADMIN_PATHS.import);

  return {
    status: "success",
    message: "Taslak ilan olarak kaydedildi.",
    fieldErrors: {},
    listingEditPath: ADMIN_PATHS.listingEdit(listing.id),
  };
}

/* -------------------------------------------------------------------------- */
/* İç yardımcılar                                                              */
/* -------------------------------------------------------------------------- */

function readId(formData: FormData): string | null {
  const value = formData.get("id");
  return typeof value === "string" && value.length > 0 ? value : null;
}

/** Yalnızca `isSignedIn` yeniden dışa aktarılır; sayfalar `requireSession` kullanır. */
export { isSignedIn };
