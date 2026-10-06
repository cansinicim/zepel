/**
 * Panel formlarının ortak durum sözleşmesi.
 *
 * `useActionState` ile çalışan her form bu şekli kullanır: tek bir özet mesaj,
 * alan bazlı hatalar ve formu yeniden doldurmak için ham değerler. Değerler
 * yalnızca `defaultValue` olarak verilir, hiçbir zaman HTML olarak basılmaz.
 */

export type AdminFormStatus = "idle" | "success" | "error";

export type AdminFormState<TField extends string = string> = {
  readonly status: AdminFormStatus;
  readonly message: string;
  readonly fieldErrors: Partial<Record<TField, string>>;
  readonly values?: Partial<Record<TField, string>>;
};

/** Başlangıç durumu üretir. Mesaj çağıran tarafın metin sabitinden gelir. */
export function idleFormState<TField extends string = string>(
  message: string,
): AdminFormState<TField> {
  return { status: "idle", message, fieldErrors: {} };
}

export function errorFormState<TField extends string = string>(
  message: string,
  fieldErrors: Partial<Record<TField, string>> = {},
  values?: Partial<Record<TField, string>>,
): AdminFormState<TField> {
  return { status: "error", message, fieldErrors, values };
}

export function successFormState<TField extends string = string>(
  message: string,
  values?: Partial<Record<TField, string>>,
): AdminFormState<TField> {
  return { status: "success", message, fieldErrors: {}, values };
}
