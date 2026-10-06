import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ADMIN_BRAND, ADMIN_PATHS } from "@/components/admin/labels";
import { isSignedIn } from "@/lib/admin-auth";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Giriş",
};

/**
 * Giriş sayfası. Panelin tek istisnası: `requireSession()` yerine tersini
 * yapar, oturum zaten açıksa özet sayfasına yönlendirir.
 */
export default async function AdminLoginPage() {
  if (await isSignedIn()) {
    redirect(ADMIN_PATHS.home);
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-8 border border-border bg-surface p-8">
      <div className="flex flex-col gap-2 text-center">
        <span className="font-display text-heading-lg text-text-primary">
          {ADMIN_BRAND.title}
        </span>
        <span className="font-sans text-body-sm text-text-muted">
          Devam etmek için parolanızı girin.
        </span>
      </div>

      <LoginForm />
    </div>
  );
}
