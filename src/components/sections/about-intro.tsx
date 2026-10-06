import Link from "next/link";

import { buttonStyles, Container, SectionHeading } from "@/components/ui";
import { about } from "@/content/sections";

export interface AboutIntroProps {
  /**
   * Sayfadaki başlık hiyerarşisi. Anasayfada bölüm başlığıdır (h2),
   * `/hakkimizda` sayfasında sayfanın tek h1'idir.
   */
  as?: "h1" | "h2";
  /** Sayfa başlığı olarak kullanıldığında üst boşluk sabit bara göre açılır. */
  withPageOffset?: boolean;
}

export function AboutIntro({
  as = "h2",
  withPageOffset = false,
}: AboutIntroProps) {
  return (
    <section
      data-about
      className="border-b border-border bg-ink"
      aria-labelledby="hakkimizda-basligi"
    >
      <Container
        width="page"
        className={
          withPageOffset
            ? "pt-32 pb-section md:pt-40 lg:pt-48"
            : "py-section"
        }
      >
        <div className="grid gap-block lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading
              titleId="hakkimizda-basligi"
              as={as}
              size={as === "h1" ? "lg" : "md"}
              eyebrow={about.eyebrow}
              title={about.title}
              data-reveal
            />
          </div>

          <div className="flex flex-col gap-block lg:col-span-7">
            <div className="flex flex-col gap-stack" data-reveal>
              {about.paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="font-sans text-body-lg text-text-secondary"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <ul className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-3">
              {about.highlights.map((highlight) => (
                <li
                  key={highlight.title}
                  data-about-highlight
                  className="flex flex-col gap-3 bg-surface p-6"
                >
                  <h3 className="font-display text-heading-md text-text-primary">
                    {highlight.title}
                  </h3>
                  <p className="font-sans text-body-sm text-text-muted">
                    {highlight.description}
                  </p>
                </li>
              ))}
            </ul>

            {as === "h2" ? (
              <div>
                <Link
                  href={about.cta.href}
                  className={buttonStyles({ variant: "outline" })}
                >
                  {about.cta.label}
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
