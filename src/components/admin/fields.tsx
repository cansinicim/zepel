import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Panel form alanları.
 *
 * Etiket, kontrol, yardım metni ve hata mesajı tek yerde bağlanır: her kontrol
 * `id` ile etiketine, hata ve yardım metinlerine ise `aria-describedby` ile
 * bağlıdır. Hatalı alan `aria-invalid` taşır.
 */

const controlClass = [
  "w-full rounded-xs border bg-elevated px-4 font-sans text-body-md",
  "text-text-primary placeholder:text-text-muted",
  "transition-colors duration-[var(--duration-fast)] ease-out-expo",
  "border-border hover:border-border-strong focus:border-accent",
  "aria-[invalid=true]:border-danger",
].join(" ");

export interface FieldBaseProps {
  /** Form alan adı. Kontrolün `id` değeri de bundan türetilir. */
  name: string;
  label: string;
  /** Aynı sayfada birden çok form varsa `id` çakışmasını önler. */
  idPrefix?: string;
  error?: string;
  help?: string;
  /** Etiketin yanında gösterilen küçük bilgi, örneğin alanın kaynağı. */
  note?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

type FieldShellProps = FieldBaseProps & {
  controlId: string;
  errorId: string;
  helpId: string;
  children: ReactNode;
};

function FieldShell({
  controlId,
  errorId,
  helpId,
  label,
  error,
  help,
  note,
  required,
  className,
  children,
}: FieldShellProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label
          htmlFor={controlId}
          className="font-sans text-body-sm font-medium text-text-secondary"
        >
          {label}
          {required ? (
            <span aria-hidden="true" className="ml-1 text-accent">
              *
            </span>
          ) : null}
        </label>
        {note}
      </div>

      {children}

      {help ? (
        <p id={helpId} className="font-sans text-body-sm text-text-muted">
          {help}
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

/** Kontrolün ortak özniteliklerini üretir. Hook değildir, saf bir yardımcıdır. */
function buildControlProps(props: FieldBaseProps) {
  const controlId = `${props.idPrefix ?? "alan"}-${props.name}`;
  const errorId = `${controlId}-hata`;
  const helpId = `${controlId}-yardim`;

  const describedBy =
    [props.error ? errorId : null, props.help ? helpId : null]
      .filter((id) => id !== null)
      .join(" ") || undefined;

  return {
    controlId,
    errorId,
    helpId,
    shared: {
      id: controlId,
      name: props.name,
      required: props.required,
      disabled: props.disabled,
      "aria-invalid": props.error ? (true as const) : undefined,
      "aria-describedby": describedBy,
    },
  };
}

export interface TextFieldProps extends FieldBaseProps {
  type?: "text" | "url" | "password";
  defaultValue?: string;
  placeholder?: string;
  inputMode?: "text" | "numeric" | "url";
  autoComplete?: string;
  autoFocus?: boolean;
}

export function TextField({
  type = "text",
  defaultValue,
  placeholder,
  inputMode,
  autoComplete,
  autoFocus,
  ...base
}: TextFieldProps) {
  const { controlId, errorId, helpId, shared } = buildControlProps(base);

  return (
    <FieldShell
      {...base}
      controlId={controlId}
      errorId={errorId}
      helpId={helpId}
    >
      <input
        {...shared}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        className={cn(controlClass, "h-11")}
      />
    </FieldShell>
  );
}

export interface TextAreaFieldProps extends FieldBaseProps {
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
}

export function TextAreaField({
  defaultValue,
  placeholder,
  rows = 5,
  ...base
}: TextAreaFieldProps) {
  const { controlId, errorId, helpId, shared } = buildControlProps(base);

  return (
    <FieldShell
      {...base}
      controlId={controlId}
      errorId={errorId}
      helpId={helpId}
    >
      <textarea
        {...shared}
        rows={rows}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={cn(controlClass, "resize-y py-3")}
      />
    </FieldShell>
  );
}

export type SelectOption = {
  readonly value: string;
  readonly label: string;
};

export interface SelectFieldProps extends FieldBaseProps {
  options: readonly SelectOption[];
  defaultValue?: string;
}

export function SelectField({
  options,
  defaultValue,
  ...base
}: SelectFieldProps) {
  const { controlId, errorId, helpId, shared } = buildControlProps(base);

  return (
    <FieldShell
      {...base}
      controlId={controlId}
      errorId={errorId}
      helpId={helpId}
    >
      <select
        {...shared}
        defaultValue={defaultValue}
        className={cn(controlClass, "h-11")}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export interface CheckboxFieldProps
  extends Omit<FieldBaseProps, "required"> {
  value: string;
  defaultChecked?: boolean;
}

export function CheckboxField({
  value,
  defaultChecked,
  ...base
}: CheckboxFieldProps) {
  const { controlId, errorId, helpId, shared } = buildControlProps(base);

  return (
    <div className={cn("flex flex-col gap-2", base.className)}>
      <div className="flex items-center gap-3">
        <input
          {...shared}
          type="checkbox"
          value={value}
          defaultChecked={defaultChecked}
          className="size-5 shrink-0 accent-[var(--color-accent)]"
        />
        <label
          htmlFor={controlId}
          className="font-sans text-body-sm font-medium text-text-secondary"
        >
          {base.label}
        </label>
      </div>

      {base.help ? (
        <p id={helpId} className="font-sans text-body-sm text-text-muted">
          {base.help}
        </p>
      ) : null}

      {base.error ? (
        <p id={errorId} className="font-sans text-body-sm text-danger">
          {base.error}
        </p>
      ) : null}
    </div>
  );
}
