"use client";

import { useActionState } from "react";

import { FormStatusMessage } from "@/components/admin/form-status";
import { SubmitButton } from "@/components/admin/submit-button";

import { initialLoginState } from "@/components/admin/action-state";

import { signInAction } from "../actions";

const STATUS_ID = "giris-durum";

/**
 * Giriş formu. Tek alanı vardır: parola. Doğrulama ve oran sınırlama
 * tamamen `signInAction` içinde, sunucu tarafında yapılır.
 */
export function LoginForm() {
  const [state, formAction] = useActionState(signInAction, initialLoginState);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="giris-parola"
          className="font-sans text-body-sm font-medium text-text-secondary"
        >
          Parola
        </label>
        <input
          id="giris-parola"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          autoFocus
          aria-invalid={state.status === "error" ? true : undefined}
          aria-describedby={STATUS_ID}
          className="h-11 w-full rounded-xs border border-border bg-elevated px-4 font-sans text-body-md text-text-primary transition-colors duration-[var(--duration-fast)] ease-out-expo placeholder:text-text-muted hover:border-border-strong focus:border-accent aria-[invalid=true]:border-danger"
        />
      </div>

      <FormStatusMessage
        id={STATUS_ID}
        status={state.status === "error" ? "error" : "idle"}
        message={state.status === "error" ? state.message : ""}
      />

      <SubmitButton pendingLabel="Giriş yapılıyor" variant="primary" size="lg">
        Giriş yap
      </SubmitButton>
    </form>
  );
}
