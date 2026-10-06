import Link from "next/link";
import type { Metadata } from "next";

import { EmptyState } from "@/components/admin/empty-state";
import { formatDateTime } from "@/components/admin/format";
import { ADMIN_PATHS } from "@/components/admin/labels";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Panel } from "@/components/admin/panel";
import { requireSession } from "@/components/admin/session";
import { list as listImports } from "@/lib/db/imports";
import type { ImportStatus } from "@/lib/db/types";

import { ImportWorkbench } from "./import-workbench";

/** Panel arama motorlarına kapalıdır. */
export const metadata: Metadata = {
  title: "İçe aktar",
  robots: { index: false, follow: false },
};

const IMPORT_STATUS_LABELS: Record<ImportStatus, string> = {
  pending: "Bekliyor",
  parsed: "Ayrıştırıldı",
  failed: "Başarısız",
  applied: "Taslağa dönüştü",
};

/** Son denemeler listesi, kısa tutulur; amaç geçmiş değil son durumu görmek. */
const RECENT_LIMIT = 8;

export default async function ImportPage() {
  await requireSession();

  const recent = await listImports(RECENT_LIMIT);

  return (
    <div className="flex flex-col gap-block">
      <AdminPageHeader
        eyebrow="İlan"
        title="İlan içe aktar"
        description="Dış bir ilan sayfasından bilgileri çekin. Ayrıştırılan ilan doğrudan yayına girmez, önce taslak olarak kaydedilir."
      />

      <ImportWorkbench />

      <Panel
        title="Son denemeler"
        titleId="ice-aktar-gecmis"
        description="Bir deneme başarısız olduysa kaynağı ve nedenini buradan görebilirsiniz."
      >
        {recent.length === 0 ? (
          <EmptyState
            title="Henüz içe aktarma yapılmadı."
            description="Yukarıdaki kutuya bir ilan bağlantısı veya sayfa içeriği yapıştırarak başlayın."
          />
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {recent.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-baseline justify-between gap-3 py-3"
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="truncate font-sans text-body-sm text-text-primary">
                    {item.sourceUrl ?? "Yapıştırılan içerik"}
                  </span>
                  {item.error ? (
                    <span className="font-sans text-body-sm text-text-muted">
                      {item.error}
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-sans text-body-sm text-text-secondary">
                    {IMPORT_STATUS_LABELS[item.status]}
                  </span>
                  <span className="font-sans text-body-sm text-text-muted tabular-nums">
                    {formatDateTime(item.createdAt)}
                  </span>
                  {item.listingId ? (
                    <Link
                      href={ADMIN_PATHS.listingEdit(item.listingId)}
                      className="font-sans text-body-sm text-accent hover:underline"
                    >
                      İlanı aç
                    </Link>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
