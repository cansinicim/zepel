import Image from "next/image";
import Link from "next/link";
import { Phone } from "lucide-react";

import { buttonStyles, Container, Eyebrow } from "@/components/ui";
import { contactCta } from "@/content/pages";
import { contactInfo } from "@/content/site";

/** Sayfa kapanışındaki çağrı bloğu. Tam genişlikte görsel, üstünde kısa metin. */
export function ContactCta() {
  return (
    <section
      data-contact-cta
      aria-labelledby="iletisim-cagrisi-basligi"
      className="relative isolate overflow-hidden bg-ink"
    >
      <div data-contact-cta-media className="absolute inset-0 -z-10">
        <Image
          src={contactCta.media.src}
          alt={contactCta.media.alt}
          fill
          loading="lazy"
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-overlay via-overlay/80 to-overlay/55"
        />
      </div>

      <Container width="page" className="py-section">
        <div className="flex max-w-narrow flex-col gap-stack" data-reveal>
          <Eyebrow withRule>{contactCta.eyebrow}</Eyebrow>

          <h2
            id="iletisim-cagrisi-basligi"
            className="font-display text-display-md text-text-primary"
          >
            {contactCta.title}
          </h2>

          <p className="font-sans text-body-lg text-text-secondary">
            {contactCta.description}
          </p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={contactCta.primaryCta.href}
              className={buttonStyles({ size: "lg" })}
            >
              {contactCta.primaryCta.label}
            </Link>

            <a
              href={contactInfo.phoneHref}
              className={buttonStyles({ variant: "outline", size: "lg" })}
            >
              <Phone aria-hidden="true" className="size-4" />
              <span className="sr-only">
                {contactCta.secondaryCtaPrefix},{" "}
              </span>
              {contactInfo.phoneLabel}
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
