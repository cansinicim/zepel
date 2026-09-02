import type { FormField, ServiceSlug } from "@/content/sections";
import { cn } from "@/lib/utils";

const controlClass = [
  "w-full rounded-xs border bg-elevated px-4 font-sans text-body-md",
  "text-text-primary placeholder:text-text-muted",
  "transition-colors duration-[var(--duration-fast)] ease-out-expo",
  "border-border hover:border-border-strong focus:border-accent",
  "aria-[invalid=true]:border-danger",
].join(" ");

export type ServiceOption = {
  readonly value: ServiceSlug | "diger";
  readonly label: string;
};

export interface ContactFormFieldProps {
  field: FormField;
  /** Yalnızca `select` tipindeki alan için gereklidir. */
  options?: readonly ServiceOption[];
  defaultValue?: string;
  error?: string;
  disabled?: boolean;
}

/**
 * Tek bir form alanı: etiket, kontrol, yardım metni ve hata mesajı.
 * Hata ve yardım metni `aria-describedby` ile kontrole bağlanır.
 */
export function ContactFormField({
  field,
  options,
  defaultValue,
  error,
  disabled = false,
}: ContactFormFieldProps) {
  const controlId = `iletisim-${field.name}`;
  const errorId = `${controlId}-hata`;
  const helpId = `${controlId}-yardim`;

  const describedBy =
    [error ? errorId : null, field.helpText ? helpId : null]
      .filter((id) => id !== null)
      .join(" ") || undefined;

  const sharedProps = {
    id: controlId,
    name: field.name,
    required: field.required,
    disabled,
    "aria-invalid": error ? (true as const) : undefined,
    "aria-describedby": describedBy,
    defaultValue,
  };

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={controlId}
        className="font-sans text-body-sm font-medium text-text-secondary"
      >
        {field.label}
        {field.required ? (
          <span aria-hidden="true" className="ml-1 text-accent">
            *
          </span>
        ) : null}
      </label>

      {field.type === "textarea" ? (
        <textarea
          {...sharedProps}
          rows={5}
          placeholder={field.placeholder}
          className={cn(controlClass, "min-h-32 resize-y py-3")}
        />
      ) : field.type === "select" ? (
        <select {...sharedProps} className={cn(controlClass, "h-11")}>
          <option value="">{field.placeholder}</option>
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          {...sharedProps}
          type={field.type}
          placeholder={field.placeholder}
          autoComplete={
            field.name === "fullName"
              ? "name"
              : field.name === "email"
                ? "email"
                : field.name === "phone"
                  ? "tel"
                  : undefined
          }
          className={cn(controlClass, "h-11")}
        />
      )}

      {field.helpText ? (
        <p id={helpId} className="font-sans text-body-sm text-text-muted">
          {field.helpText}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className="font-sans text-body-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
