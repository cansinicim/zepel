import Image from "next/image";
import Link from "next/link";

import { buttonStyles, Container, Eyebrow, SectionHeading } from "@/components/ui";
import { scrollStory } from "@/content/scroll-story";
import { padIndex } from "@/lib/format";
import { cn } from "@/lib/utils";

const stepCount = scrollStory.steps.length;

/**
 * Sinematik kaydırma bölümü.
 *
 * Yapı, JavaScript olmadan da anlamlıdır:
 * - Görsel katmanı yapışkandır, metin blokları üzerinde akar.
 * - Beş görsel üst üste durur, ilki görünür; motion katmanı `data-scroll-story-image`
 *   elemanlarını çapraz geçişle değiştirir.
 * - `motion-reduce` altında yapışkanlık ve tam ekran yükseklikler kalkar,
 *   bölüm düz bir dikey akışa dönüşür.
 *
 * Bu dosya animasyon kodu içermez, yalnızca kancaları bırakır.
 */
export function ScrollStorySection() {
  return (
    <section
      data-scroll-story
      aria-labelledby="anlati-basligi"
      className="relative border-b border-border bg-ink"
    >
      <Container width="page" className="py-section-sm">
        <SectionHeading
          titleId="anlati-basligi"
          eyebrow={scrollStory.sectionEyebrow}
          title={scrollStory.sectionTitle}
          data-reveal
        />
      </Container>

      <div data-scroll-story-track className="relative">
        <div
          data-scroll-story-media
          className={cn(
            "sticky top-0 h-svh w-full overflow-hidden",
            "motion-reduce:relative motion-reduce:h-[55svh]",
          )}
        >
          {scrollStory.steps.map((step, index) => (
            <Image
              key={step.id}
              data-scroll-story-image
              data-step-index={index}
              src={step.image}
              alt={step.imageAlt}
              fill
              sizes="100vw"
              className={cn(
                "object-cover",
                index === 0 ? "opacity-100" : "opacity-0",
              )}
            />
          ))}

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-overlay via-overlay/65 to-overlay/35"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-overlay/75 via-transparent to-transparent"
          />

          <div
            aria-hidden="true"
            className="absolute inset-x-gutter bottom-8 h-px bg-border-strong motion-reduce:hidden"
          >
            <span
              data-scroll-story-progress
              className="block h-full w-full origin-left scale-x-[0.2] bg-accent"
            />
          </div>
        </div>

        <ol
          data-scroll-story-steps
          className="relative -mt-[100svh] motion-reduce:mt-0"
        >
          {scrollStory.steps.map((step, index) => (
            <li
              key={step.id}
              data-scroll-story-step
              data-step-index={index}
              className={cn(
                "flex min-h-svh items-center",
                "motion-reduce:min-h-0 motion-reduce:items-start",
              )}
            >
              <Container width="page" className="py-section-sm">
                <article className="flex max-w-narrow flex-col gap-stack border border-border bg-overlay/70 p-6 backdrop-blur-sm sm:p-10 motion-reduce:bg-surface motion-reduce:backdrop-blur-none">
                  <Eyebrow withRule>{step.eyebrow}</Eyebrow>

                  <h3 className="font-display text-display-sm text-text-primary">
                    {step.title}
                  </h3>

                  <p className="font-sans text-body-lg text-text-secondary">
                    {step.body}
                  </p>

                  {step.stat ? (
                    <dl className="mt-2 flex flex-col gap-1 border-t border-border pt-5">
                      <dt className="order-2 font-sans text-body-sm text-text-muted">
                        {step.stat.label}
                      </dt>
                      <dd className="order-1 font-display text-heading-lg text-accent tabular-nums">
                        {step.stat.value}
                      </dd>
                    </dl>
                  ) : null}

                  <p
                    data-scroll-story-index
                    className="mt-2 font-sans text-eyebrow tracking-eyebrow text-text-muted tabular-nums uppercase"
                  >
                    {padIndex(index + 1)}
                    <span aria-hidden="true" className="px-2 text-accent">
                      /
                    </span>
                    {padIndex(stepCount)}
                  </p>
                </article>
              </Container>
            </li>
          ))}
        </ol>
      </div>

      <Container width="page" className="py-section-sm">
        <Link
          href={scrollStory.outroCtaHref}
          className={buttonStyles({ variant: "outline", size: "lg" })}
        >
          {scrollStory.outroCtaLabel}
        </Link>
      </Container>
    </section>
  );
}
