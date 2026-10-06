import Link from "next/link";
import type { Metadata } from "next";

import { EmptyState } from "@/components/admin/empty-state";
import { formatDateTime } from "@/components/admin/format";
import {
  ADMIN_ACTIONS,
  ADMIN_PATHS,
  CONFIRM_MESSAGES,
  FILTER_PARAM,
  SUBMISSION_FILTERS,
  SUBMISSION_STATUS_LABELS,
  resolveStatusFilter,
  serviceLabel,
} from "@/components/admin/labels";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Panel } from "@/components/admin/panel";
import { requireSession } from "@/components/admin/session";
import { StatusBadge } from "@/components/admin/status-badge";
import { SubmitButton } from "@/components/admin/submit-button";
import { mailtoHref, telHref, whatsappHref } from "@/components/admin/contact-links";
import { cn } from "@/lib/utils";
import { list as listSubmissions } from "@/lib/db/submissions";
import type { Submission } from "@/lib/db/types";

import { archiveSubmissionAction, markSubmissionReadAction } from "../actions";

export const metadata: Metadata = { title: "Talepler" };

type TalepPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

/** Filtre sekmeleri. Etkin sekme `aria-current="page"` taşır. */
function FilterTabs({ activeSlug }: { activeSlug: string }) {
  return (
    <nav aria-label="Talep durumu filtresi">
      <ul className="flex flex-wrap gap-2">
        {SUBMISSION_FILTERS.map((filter) => {
          const active = filter.slug === activeSlug;
          return (
            <li key={filter.slug}>
              <Link
                href={`${ADMIN_PATHS.submissions}?${FILTER_PARAM}=${filter.slug}`}
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

/** Tek satırlık iletişim bağlantısı; adres çözülemezse düz metin gösterir. */
function ContactLink({
  href,
  label,
}: {
  href: string | null;
  label: string;
}) {
  if (href === null) {
    return <span className="font-sans text-body-sm text-text-muted">{label}</span>;
  }

  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      className="font-sans text-body-sm text-accent underline decoration-border-strong underline-offset-4 hover:decoration-accent"
    >
      {label}
    </a>
  );
}

function SubmissionRow({ submission }: { submission: Submission }) {
  return (
    <li className="flex flex-col gap-4 py-6 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="font-sans text-body-md font-medium text-text-primary">
            {submission.fullName}
          </span>
          <span className="font-sans text-body-sm text-text-muted">
            {serviceLabel(submission.service)} · {formatDateTime(submission.createdAt)}
          </span>
        </div>
        <StatusBadge tone={submission.status === "new" ? "accent" : "neutral"}>
          {SUBMISSION_STATUS_LABELS[submission.status]}
        </StatusBadge>
      </div>

      {submission.message.length > 0 ? (
        <p className="max-w-narrow font-sans text-body-sm text-text-secondary">
          {submission.message}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <ContactLink href={telHref(submission.phone)} label={submission.phone} />
        <ContactLink href={whatsappHref(submission.phone)} label="WhatsApp" />
        <ContactLink href={mailtoHref(submission.email)} label={submission.email} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {submission.status === "new" ? (
          <form action={markSubmissionReadAction}>
            <input type="hidden" name="id" value={submission.id} />
            <SubmitButton pendingLabel={ADMIN_ACTIONS.working} variant="outline" size="sm">
              {ADMIN_ACTIONS.markRead}
            </SubmitButton>
          </form>
        ) : null}

        {submission.status !== "archived" ? (
          <form action={archiveSubmissionAction}>
            <input type="hidden" name="id" value={submission.id} />
            <SubmitButton
              pendingLabel={ADMIN_ACTIONS.working}
              confirmMessage={CONFIRM_MESSAGES.archiveSubmission}
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

export default async function AdminSubmissionsPage({ searchParams }: TalepPageProps) {
  await requireSession();

  const params = await searchParams;
  const rawFilter = typeof params[FILTER_PARAM] === "string" ? params[FILTER_PARAM] : undefined;
  const filter = resolveStatusFilter(SUBMISSION_FILTERS, rawFilter);

  let submissions: Submission[] | null = null;
  try {
    submissions = await listSubmissions(filter.status, { limit: 50 });
  } catch {
    submissions = null;
  }

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Talep kutusu"
        title="Görüşme talepleri"
        description="İletişim formundan gelen talepleri buradan takip edin."
      />

      <FilterTabs activeSlug={filter.slug} />

      <Panel>
        {submissions === null ? (
          <EmptyState
            title="Talepler okunamadı"
            description="Veritabanı bağlantısı henüz kurulmamış olabilir."
          />
        ) : submissions.length === 0 ? (
          <EmptyState
            title="Bu durumda talep yok"
            description="Filtreyi değiştirip diğer durumlara bakabilirsiniz."
          />
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {submissions.map((submission) => (
              <SubmissionRow key={submission.id} submission={submission} />
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
