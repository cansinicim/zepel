import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { buttonStyles, Container } from "@/components/ui";
import { legalPageLabels, type LegalDocument } from "@/content/legal";
import { formatLongDate, padIndex } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";

/**
 * Yasal metin sayfalarının ortak gövdesi.
 * Dört yasal rota da (`/gizlilik-politikasi`, `/kvkk-aydinlatma-metni`,
 * `/cerez-politikasi`, `/kullanim-kosullari`) bu bileşeni kullanır;
 * fark yalnızca `@/content/legal` içinden gelen belgedir.
 */
export interface LegalDocumentPageProps {
  document: LegalDocument;
}

/** Sayfa sonundaki bilgilendirme kutusunun başlık id'si. */
const NOTICE_TITLE_ID = "yasal-bilgilendirme-notu";

/**
 * Yasal sayfaların metadata'sı, tek yerden üretilir.
 * Yasal metinler arama motorlarına açık kalır, bu yüzden `noIndex` verilmez.
 */
export function legalMetadata(document: LegalDocument): Metadata {
  return buildMetadata({
    title: document.title,
    description: document.description,
    path: `/${document.slug}`,
  });
}

export function LegalDocumentPage({ document: doc }: LegalDocumentPageProps) {
  return (
    <>
      <PageHeader
        intro={{
          eyebrow: legalPageLabels.eyebrow,
          title: doc.title,
          description: doc.description,
        }}
      />

      <div className="bg-ink">
        <Container width="narrow" className="py-section-sm">
          <article className="flex flex-col gap-block">
            <header className="flex flex-col gap-stack" data-reveal>
              <p className="font-sans text-eyebrow tracking-eyebrow text-text-muted uppercase">
                {legalPageLabels.lastUpdatedLabel}:{" "}
                <time dateTime={doc.lastUpdated}>
                  {formatLongDate(doc.lastUpdated)}
                </time>
              </p>

              {doc.intro.map((paragraph, index) => (
                <p
                  key={index}
                  className="font-sans text-body-lg text-text-secondary"
                >
                  {paragraph}
                </p>
              ))}
            </header>

            <ol className="flex flex-col">
              {doc.sections.map((section, index) => (
                <li
                  key={section.heading}
                  data-reveal
                  className="flex flex-col gap-stack border-t border-border py-block last:border-b"
                >
                  <div className="flex flex-col gap-3">
                    <span
                      aria-hidden="true"
                      className="font-sans text-eyebrow tracking-eyebrow text-text-muted tabular-nums"
                    >
                      {padIndex(index + 1)}
                    </span>
                    <h2 className="font-display text-display-sm text-text-primary">
                      {section.heading}
                    </h2>
                  </div>

                  <div className="flex flex-col gap-stack">
                    {section.paragraphs.map((paragraph, index) => (
                      <p
                        key={index}
                        className="font-sans text-body-md text-text-secondary"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {section.bullets ? (
                    <ul className="flex flex-col">
                      {section.bullets.map((bullet, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 border-b border-border py-3 last:border-b-0"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-3 h-px w-4 shrink-0 bg-accent"
                          />
                          <span className="font-sans text-body-md text-text-secondary">
                            {bullet}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ol>

            <aside
              data-reveal
              aria-labelledby={NOTICE_TITLE_ID}
              className="flex flex-col items-start gap-stack border border-border bg-surface p-6 sm:p-8"
            >
              <h2
                id={NOTICE_TITLE_ID}
                className="font-display text-heading-lg text-text-primary"
              >
                {legalPageLabels.noticeTitle}
              </h2>
              <p className="font-sans text-body-md text-text-muted">
                {legalPageLabels.noticeBody}
              </p>
              <Link
                href={legalPageLabels.noticeCta.href}
                className={buttonStyles({ variant: "outline" })}
              >
                {legalPageLabels.noticeCta.label}
              </Link>
            </aside>
          </article>
        </Container>
      </div>
    </>
  );
}
