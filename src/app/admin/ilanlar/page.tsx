import Link from "next/link";
import type { Metadata } from "next";

import { EmptyState } from "@/components/admin/empty-state";
import { formatDateTime } from "@/components/admin/format";
import {
  ADMIN_ACTIONS,
  ADMIN_PATHS,
  CONFIRM_MESSAGES,
  FILTER_PARAM,
  LISTING_FILTERS,
  LISTING_STATUS_LABELS,
  LISTING_STATUS_TONES,
  resolveStatusFilter,
} from "@/components/admin/labels";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Panel } from "@/components/admin/panel";
import { requireSession } from "@/components/admin/session";
import { StatusBadge } from "@/components/admin/status-badge";
import { SubmitButton } from "@/components/admin/submit-button";
import { buttonStyles } from "@/components/ui";
import { listAll } from "@/lib/db/listings";
import type { Listing } from "@/lib/db/types";
import { cn } from "@/lib/utils";

import { archiveListingAction, publishListingAction } from "../actions";

export const metadata: Metadata = { title: "İlanlar" };

type IlanlarPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function FilterTabs({ activeSlug }: { activeSlug: string }) {
  return (
    <nav aria-label="İlan durumu filtresi">
      <ul className="flex flex-wrap gap-2">
        {LISTING_FILTERS.map((filter) => {
          const active = filter.slug === activeSlug;
          return (
            <li key={filter.slug}>
              <Link
                href={`${ADMIN_PATHS.listings}?${FILTER_PARAM}=${filter.slug}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center border px-4 py-2 font-sans text-body-sm transition-colors duration-[var(--duration-fast)] ease-out-expo",
                  active
                    ? "border-accent text-accent"
                    : "border-border text-text-secondary hover:border-border-strong hover:text-text-primary",
                )}
              >
                {filter.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function ListingRow({ listing }: { listing: Listing }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-4 py-5 first:pt-0 last:pb-0">
      <div className="flex flex-col gap-1">
        <span className="font-sans text-body-md font-medium text-text-primary">
          {listing.title}
        </span>
        <span className="font-sans text-body-sm text-text-muted">
          {listing.priceLabel} · Güncelleme: {formatDateTime(listing.updatedAt)}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge tone={LISTING_STATUS_TONES[listing.status]}>
          {LISTING_STATUS_LABELS[listing.status]}
        </StatusBadge>

        <Link
          href={ADMIN_PATHS.listingEdit(listing.id)}
          className={buttonStyles({ variant: "outline", size: "sm" })}
        >
          {ADMIN_ACTIONS.edit}
        </Link>

        {listing.status !== "published" ? (
          <form action={publishListingAction}>
            <input type="hidden" name="id" value={listing.id} />
            <SubmitButton
              pendingLabel={ADMIN_ACTIONS.working}
              confirmMessage={CONFIRM_MESSAGES.publishListing}
              variant="primary"
              size="sm"
            >
              {ADMIN_ACTIONS.publish}
            </SubmitButton>
          </form>
        ) : null}

        {listing.status !== "archived" ? (
          <form action={archiveListingAction}>
            <input type="hidden" name="id" value={listing.id} />
            <SubmitButton
              pendingLabel={ADMIN_ACTIONS.working}
              confirmMessage={CONFIRM_MESSAGES.archiveListing}
              variant="ghost"
              size="sm"
            >
              {ADMIN_ACTIONS.archive}
            </SubmitButton>
          </form>
        ) : null}
      </div>
    </li>
  );
}

export default async function AdminListingsPage({ searchParams }: IlanlarPageProps) {
  await requireSession();

  const params = await searchParams;
  const rawFilter = typeof params[FILTER_PARAM] === "string" ? params[FILTER_PARAM] : undefined;
  const filter = resolveStatusFilter(LISTING_FILTERS, rawFilter);

  let listings: Listing[] | null = null;
  try {
    listings = await listAll({ status: filter.status, limit: 100 });
  } catch {
    listings = null;
  }

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Portföy"
        title="İlanlar"
        description="İlanları düzenleyin, yayına alın veya arşivleyin."
        actions={
          <Link href={ADMIN_PATHS.import} className={buttonStyles({ variant: "outline" })}>
            İçe aktar
          </Link>
        }
      />

      <FilterTabs activeSlug={filter.slug} />

      <Panel>
        {listings === null ? (
          <EmptyState
            title="İlanlar okunamadı"
            description="Veritabanı bağlantısı henüz kurulmamış olabilir."
          />
        ) : listings.length === 0 ? (
          <EmptyState
            title="Bu durumda ilan yok"
            description="Yeni ilan eklemek için içe aktarma aracını kullanabilirsiniz."
            action={
              <Link href={ADMIN_PATHS.import} className={buttonStyles({ variant: "outline" })}>
                İçe aktar
              </Link>
            }
          />
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {listings.map((listing) => (
              <ListingRow key={listing.id} listing={listing} />
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
