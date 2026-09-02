"use client";

import { useActionState } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";

import { ContactFormField } from "@/components/sections/contact-form-field";
import { Button } from "@/components/ui";
import { contactSection } from "@/content/sections";
import { submitContactForm } from "@/app/actions/contact";
import {
  HONEYPOT_FIELD,
  initialContactFormState,
} from "@/lib/contact-form";
import { cn } from "@/lib/utils";

const STATUS_REGION_ID = "iletisim-formu-durum";

/**
 * Görüşme talebi formu.
 *
 * Doğrulama sunucuda yapılır; bu bileşen yalnızca dönen durumu gösterir.
 * Kullanıcı girdisi hiçbir yerde HTML olarak render edilmez.
 */
export function ContactForm() {
  const [state, formAction, isPending] = useActionState(
    submitContactForm,
    initialContactFormState,
  );

  const isSuccess = state.status === "success";
  const isError = state.status === "error";

  return (
    <section
      data-contact-form
      aria-labelledby="iletisim-formu-basligi"
      className="flex flex-col gap-block border border-border bg-surface p-6 sm:p-10"
    >
      <h2
        id="iletisim-formu-basligi"
        className="font-display text-display-sm text-text-primary"
      >
        {contactSection.formTitle}
      </h2>

      <form action={formAction} noValidate className="flex flex-col gap-block">
        <div className="grid gap-6 sm:grid-cols-2">
          {contactSection.fields.map((field) => {
            const isWide = field.type === "textarea" || field.type === "select";
            return (
              <div
                key={field.name}
                className={cn(isWide && "sm:col-span-2")}
              >
                <ContactFormField
                  field={field}
                  options={
                    field.type === "select"
                      ? contactSection.serviceOptions
                      : undefined
                  }
                  defaultValue={state.values?.[field.name]}
                  error={state.fieldErrors[field.name]}
                  disabled={isPending}
                />
              </div>
            );
          })}
        </div>

        {/* Bot tuzağı: ekran okuyuculardan ve klavyeden gizli, insan görmez. */}
        <div aria-hidden="true" className="sr-only">
          <label htmlFor={HONEYPOT_FIELD}>{contactSection.formTitle}</label>
          <input
            id={HONEYPOT_FIELD}
            name={HONEYPOT_FIELD}
            type="text"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </div>

        <div className="flex flex-col gap-4">
          <div
            id={STATUS_REGION_ID}
            role="status"
            aria-live="polite"
            className={cn(
              "flex items-start gap-3 font-sans text-body-sm",
              isSuccess && "text-success",
              isError && "text-danger",
              !isSuccess && !isError && "text-text-muted",
            )}
          >
            {isSuccess ? (
              <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            ) : null}
            {isError ? (
              <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            ) : null}
            <span>
              {isPending ? contactSection.status.submitting : state.message}
              {state.detail ? ` ${state.detail}` : ""}
            </span>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="submit"
              size="lg"
              disabled={isPending}
              aria-describedby={STATUS_REGION_ID}
            >
              {isPending
                ? contactSection.status.submitting
                : contactSection.submitLabel}
            </Button>
          </div>

          <p className="max-w-narrow font-sans text-body-sm text-text-muted">
            {contactSection.consentText}
          </p>
        </div>
      </form>
    </section>
  );
}
