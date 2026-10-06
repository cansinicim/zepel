import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { formatDateTime } from "@/components/admin/format";
import {
  ADMIN_PATHS,
  LISTING_STATUS_LABELS,
  LISTING_STATUS_TONES,
} from "@/components/admin/labels";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Panel } from "@/components/admin/panel";
import { requireSession } from "@/components/admin/session";
import { StatusBadge } from "@/components/admin/status-badge";
import { buttonStyles } from "@/components/ui";
import { getById } from "@/lib/db/listings";

import { ListingEditForm } from "./listing-edit-form";

/** Panel arama motorlarına kapalıdır. */
export const metadata: Metadata = {
  title: "İlan düzenle",
  robots: { index: false, follow: false },
};

type ListingEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ListingEditPage({ params }: ListingEditPageProps) {
  await requireSession();

  const { id } = await params;
  const listing = await getById(id);

  if (!listing) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-block">
      <AdminPageHeader
        eyebrow="İlan"
        title={listing.title}
        description={`Son güncelleme ${formatDateTime(listing.updatedAt)}`}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge tone={LISTING_STATUS_TONES[listing.status]}>
              {LISTING_STATUS_LABELS[listing.status]}
            </StatusBadge>
            <Link
              href={ADMIN_PATHS.listings}
              className={buttonStyles({ variant: "outline", size: "sm" })}
            >
              Listeye dön
            </Link>
          </div>
        }
      />

      {/*
        Önizleme yalnızca yayındaki ilanlar için anlamlıdır: taslak sayfası
        genel sitede yayınlanmaz, bağlantı 404 verirdi.
      */}
      {listing.status === "published" ? (
        <Panel
          title="Yayındaki sayfa"
          titleId="ilan-onizleme"
          description="Değişiklikleri kaydettikten sonra genel sitedeki halini kontrol edin."
        >
          <Link
            href={`/portfoy/${listing.slug}`}
            target="_blank"
            rel="noreferrer"
            className={buttonStyles({ variant: "outline", size: "sm" })}
          >
            Sayfayı yeni sekmede aç
          </Link>
        </Panel>
      ) : null}

      <ListingEditForm listing={listing} />
    </div>
  );
}
