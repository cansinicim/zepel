import Image from "next/image";
import Link from "next/link";

import { buttonStyles, Container, Eyebrow } from "@/components/ui";
import { hero } from "@/content/sections";

/**
 * Tam ekran sinematik açılış. Görsel katmanı, metin katmanı ve kaydırma ipucu
 * ayrı `data-*` işaretleriyle verilir; motion katmanı bunları devralır.
 */
export function HeroSection() {
  return (
    <section
      data-hero
      aria-labelledby="hero-basligi"
      className="relative isolate flex min-h-svh flex-col justify-end overflow-hidden bg-ink"
    >
      <div data-hero-media className="absolute inset-0 -z-10">
        <Image
          src={hero.media.src}
          alt={hero.media.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-overlay via-overlay/70 to-overlay/25"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-overlay/80 via-transparent to-transparent"
        />
      </div>

      <Container
        width="page"
        className="flex flex-col gap-block pt-40 pb-16 md:pb-20"
      >
        <div className="flex max-w-wide flex-col gap-stack">
          <Eyebrow data-hero-eyebrow withRule>
            {hero.eyebrow}
          </Eyebrow>

          <h1
            id="hero-basligi"
            className="font-display text-display-xl text-text-primary"
          >
            {hero.titleLines.map((line, index) => (
              /* Maske kutusu. Satır aşağıdan yukarı kayarken kutunun dışında
                 kalır. `overflow-clip-margin` düzeni hiç değiştirmeden ğ, ü
                 gibi harflerin taşan kısımlarının kırpılmasını engeller;
                 padding + negatif margin telafisine gerek kalmaz. */
              <span
                key={line}
                className="block overflow-clip [overflow-clip-margin:0.18em]"
              >
                <span data-hero-line data-index={index} className="block">
                  {line}
                </span>
              </span>
            ))}
          </h1>

          <p
            data-hero-body
            className="max-w-narrow font-sans text-body-lg text-text-secondary"
          >
            {hero.description}
          </p>

          <div
            data-hero-actions
            className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Link
              href={hero.primaryCta.href}
              className={buttonStyles({ size: "lg" })}
            >
              {hero.primaryCta.label}
            </Link>
            <Link
              href={hero.secondaryCta.href}
              className={buttonStyles({ variant: "outline", size: "lg" })}
            >
              {hero.secondaryCta.label}
            </Link>
          </div>
        </div>

        <p
          data-hero-scroll-hint
          className="flex items-center gap-3 font-sans text-eyebrow tracking-eyebrow text-text-muted uppercase"
        >
          <span
            aria-hidden="true"
            className="h-10 w-px shrink-0 bg-border-strong"
          />
          {hero.scrollHint}
        </p>
      </Container>
    </section>
  );
}
