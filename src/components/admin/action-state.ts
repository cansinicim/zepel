/**
 * Panel sunucu eylemlerinin durum tipleri ve sabitleri.
 *
 * Bunlar bilinçli olarak `src/app/admin/actions.ts` dışında durur: `"use server"`
 * işaretli bir dosya yalnızca async fonksiyon dışa açabilir, sabit ve tip
 * dışa açamaz. Durum biçimini hem sunucu eylemleri hem de formu çizen istemci
 * bileşenleri kullandığı için ortak yer burasıdır.
 */

import type { ListingFormValues } from "@/components/admin/listing-form-schema";
import type { ParseResult } from "@/lib/import/types";

/* -------------------------------------------------------------------------- */
/* Giriş                                                                       */
/* -------------------------------------------------------------------------- */

export type LoginState = {
  readonly status: "idle" | "error";
  readonly message: string;
};

export const initialLoginState: LoginState = { status: "idle", message: "" };

/* -------------------------------------------------------------------------- */
/* İlan formu                                                                  */
/* -------------------------------------------------------------------------- */

export type ListingFormState = {
  readonly status: "idle" | "success" | "error";
  readonly message: string;
  readonly fieldErrors: Partial<Record<keyof ListingFormValues, string>>;
  readonly values?: ListingFormValues;
};

export function idleListingFormState(message: string): ListingFormState {
  return { status: "idle", message, fieldErrors: {} };
}

/**
 * "Kaydet" ile "Kaydet ve yayınla" aynı eylemi tetikler, birbirinden bu
 * gönderim değeriyle ayrılır. Böylece form durumu ikiye bölünmez.
 */
export const LISTING_INTENT_FIELD = "intent";
export const LISTING_INTENT_PUBLISH = "kaydet-ve-yayinla";

/* -------------------------------------------------------------------------- */
/* İçe aktarma                                                                 */
/* -------------------------------------------------------------------------- */

export type ImportUrlState = {
  readonly status: "idle" | "success" | "error";
  readonly message: string;
  readonly result?: ParseResult;
  readonly importId?: string;
};

export const initialImportUrlState: ImportUrlState = {
  status: "idle",
  message: "",
};

export type SaveImportDraftState = {
  readonly status: "idle" | "success" | "error";
  readonly message: string;
  readonly fieldErrors: Partial<Record<keyof ListingFormValues, string>>;
  readonly values?: ListingFormValues;
  readonly listingEditPath?: string;
};

export function idleSaveImportDraftState(message: string): SaveImportDraftState {
  return { status: "idle", message, fieldErrors: {} };
}
