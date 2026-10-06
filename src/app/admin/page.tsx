import Link from "next/link";
import type { Metadata } from "next";

import { EmptyState } from "@/components/admin/empty-state";
import { formatDateTime, truncate } from "@/components/admin/format";
import {
  ADMIN_PATHS,
  SUBMISSION_STATUS_LABELS,
  serviceLabel,
} from "@/components/admin/labels";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Panel } from "@/components/admin/panel";
import { requireSession } from "@/components/admin/session";
import { StatusBadge } from "@/components/admin/status-badge";
import { buttonStyles } from "@/components/ui";
import { listAll as listAllListings } from "@/lib/db/listings";
import { list as listSubmissions } from "@/lib/db/submissions";

export const metadata: Metadata = { title: "Özet" };

const RECENT_SUBMISSIONS_COUNT = 5;

/**
 * Özet sayısal kart. Veri katmanı henüz bağlı değilse (D1 yoksa) sayı yerine
 * kısa bir açıklama gösterir; panel iskeleti bu durumda da çalışır kalır.
 */
function SummaryStat({
  label,
  value,
  href,
}: {
  label: string;
  value: number | null;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-2 border border-border bg-surface p-6 transition-colors duration-[var(--duration-fast)] ease-out-expo hover:border-border-strong"
    >
      <span className="font-sans text-body-sm text-text-muted">{label}</span>
      <span className="font-display text-display-sm text-text-primary">
        {value === null ? "-" : value}
      </span>
    </Link>
  );
}

export default async function AdminHomePage() {
  await requireSession();

  const [submissionsResult, listingsResult] = await Promise.allSettled([
    listSubmissions("new", { limit: RECENT_SUBMISSIONS_COUNT }),
    listAllListings({ limit: 100 }),
  ]);

  const recentSubmissions =
    submissionsResult.status === "fulfilled" ? submissionsResult.value : null;
  const listings = listingsResult.status === "fulfilled" ? listingsResult.value : null;

  const newSubmissionCount = recentSubmissions?.length ?? null;
  const draftCount = listings?.filter((listing) => listing.status === "draft").length ?? null;
  const publishedCount =
    listings?.filter((listing) => listing.status === "published").length ?? null;

  const dataUnavailable = recentSubmissions === null && listings === null;

  return (
    <div className="flex flex-col gap-10">
      <AdminPageHeader
        eyebrow="Yönetim"
        title="Özet"
        description="Talep ve ilan durumuna hızlı bakış."
      />

      {dataUnavailable ? (
        <EmptyState
          title="Veritabanı bağlantısı yok"
          description="D1 veritabanı henüz oluşturulmadı veya bağlanmadı. Bağlantı kurulduğunda özet sayılar burada görünür."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <SummaryStat
              label="Yeni talep"
              value={newSubmissionCount}
              href={ADMIN_PATHS.submissions}
            />
            <SummaryStat
              label="Taslak ilan"
              value={draftCount}
              href={ADMIN_PATHS.listings}
            />
            <SummaryStat
              label="Yayındaki ilan"
              value={publishedCount}
              href={ADMIN_PATHS.listings}
            />
          </div>

          <Panel title="Son talepler" description="En yeni 5 görüşme talebi.">
            {recentSubmissions === null ? (
              <EmptyState title="Talepler okunamadı" />
            ) : recentSubmissions.length === 0 ? (
              <EmptyState
                title="Yeni talep yok"
                description="Yeni bir görüşme talebi geldiğinde burada görünür."
              />
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {recentSubmissions.map((submission) => (
                  <li
                    key={submission.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-sans text-body-md font-medium text-text-primary">
                        {submission.fullName}
                      </span>
                      <span className="font-sans text-body-sm text-text-muted">
                        {serviceLabel(submission.service)} ·{" "}
                        {truncate(submission.message, 80)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBadge tone="accent">
                        {SUBMISSION_STATUS_LABELS[submission.status]}
                      </StatusBadge>
                      <span className="font-sans text-body-sm text-text-muted">
                        {formatDateTime(submission.createdAt)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </>
      )}

      <Panel title="Hızlı bağlantılar">
        <div className="flex flex-wrap gap-3">
          <Link href={ADMIN_PATHS.submissions} className={buttonStyles({ variant: "outline" })}>
            Talep kutusu
          </Link>
          <Link href={ADMIN_PATHS.listings} className={buttonStyles({ variant: "outline" })}>
            İlanlar
          </Link>
          <Link href={ADMIN_PATHS.import} className={buttonStyles({ variant: "outline" })}>
            İçe aktar
          </Link>
        </div>
      </Panel>
    </div>
  );
}
