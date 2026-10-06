import type { Metadata } from "next";

import { AdminNav } from "@/components/admin/admin-nav";
import { ADMIN_ACTIONS, ADMIN_BRAND } from "@/components/admin/labels";
import { Container } from "@/components/ui";
import { isSignedIn } from "@/lib/admin-auth";
import { countNew } from "@/lib/db/submissions";

import { signOutAction } from "./actions";

/**
 * Yönetim panelinin kendi iskeleti.
 *
 * Genel sitenin `SiteHeader` / `SiteFooter` bileşenlerini kullanmaz: panel
 * ayrı bir uygulama gibi davranır, ziyaretçi gezinmesiyle karışmaz. Arama
 * motorlarının paneli indekslememesi için `robots` burada kapatılır.
 */
export const metadata: Metadata = {
  title: ADMIN_BRAND.title,
  robots: { index: false, follow: false },
};

/**
 * Yeni talep sayısı yalnızca rozet için okunur. Veri katmanı hazır değilse
 * (D1 henüz bağlanmadıysa) panel iskeleti yine de çalışsın diye hata
 * yutulur ve rozet basitçe gösterilmez.
 */
async function readNewSubmissionCount(): Promise<number | null> {
  try {
    return await countNew();
  } catch {
    return null;
  }
}

/**
 * Panel iskeleti oturuma göre dallanır.
 *
 * Giriş sayfası bu layout'un altında yaşar (`src/app/admin/login`), ama
 * kenar menüsü ve çıkış düğmesi yalnızca oturum açıkken anlamlıdır: aksi
 * halde oturumsuz bir ziyaretçiye korumalı sayfalara bağlantı ve işlevsiz
 * bir "çıkış yap" düğmesi gösterilir. Oturum yoksa içerik (giriş formu)
 * sade bir kapta, panel çerçevesi olmadan basılır. Bu, yalnızca görünümü
 * belirler; her korumalı sayfa kendi `requireSession()` çağrısıyla ayrıca
 * yönlendirme yapar.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const signedIn = await isSignedIn();

  if (!signedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink px-gutter py-16 font-sans text-text-primary">
        {children}
      </div>
    );
  }

  const newSubmissionCount = await readNewSubmissionCount();

  return (
    <div className="flex min-h-screen flex-col bg-ink font-sans text-text-primary">
      <a
        href="#panel-icerik"
        className="sr-only rounded-xs bg-accent px-4 py-2 font-sans text-body-sm font-medium text-ink focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60]"
      >
        İçeriğe atla
      </a>

      <header className="border-b border-border bg-surface">
        <Container width="wide" className="flex items-center justify-between gap-6 py-4">
          <div className="flex flex-col">
            <span className="font-display text-heading-md text-text-primary">
              {ADMIN_BRAND.title}
            </span>
            <span className="font-sans text-body-sm text-text-muted">
              {ADMIN_BRAND.subtitle}
            </span>
          </div>

          <form action={signOutAction}>
            <button
              type="submit"
              className="font-sans text-body-sm text-text-secondary underline decoration-border-strong underline-offset-4 transition-colors duration-[var(--duration-fast)] ease-out-expo hover:text-accent hover:decoration-accent"
            >
              {ADMIN_ACTIONS.signOut}
            </button>
          </form>
        </Container>
      </header>

      <div className="flex-1">
        <Container width="wide" className="flex flex-col gap-8 py-8 lg:flex-row lg:gap-12">
          <aside className="lg:w-56 lg:shrink-0">
            <AdminNav
              newSubmissionCount={newSubmissionCount}
              badgeLabel="yeni talep"
              ariaLabel="Yönetim paneli menüsü"
            />
          </aside>

          <main id="panel-icerik" className="min-w-0 flex-1">
            {children}
          </main>
        </Container>
      </div>
    </div>
  );
}
