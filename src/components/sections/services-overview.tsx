import Link from "next/link";

import { buttonStyles, Container, SectionHeading } from "@/components/ui";
import { services } from "@/content/sections";
import { resolveIcon } from "@/lib/icons";

/** Anasayfadaki özet hizmet listesi. Ayrıntılı kapsam `/hizmetler` sayfasındadır. */
export function ServicesOverview() {
  return (
    <section
      data-services
      aria-labelledby="hizmetler-basligi"
      className="border-b border-bone-border bg-bone"
    >
      <Container width="page" className="flex flex-col gap-block py-section">
        <SectionHeading
          titleId="hizmetler-basligi"
          tone="light"
          eyebrow={services.eyebrow}
          title={services.title}
          description={services.description}
          data-reveal
        />

        <ul className="grid gap-px border border-bone-border bg-bone-border sm:grid-cols-2 lg:grid-cols-3">
          {services.items.map((service) => {
            const Icon = resolveIcon(service.icon);
            return (
              <li
                key={service.slug}
                data-service-card
                className="flex flex-col gap-4 bg-bone p-6 transition-colors duration-[var(--duration-base)] ease-out-expo hover:bg-bone-muted sm:p-8"
              >
                <Icon
                  aria-hidden="true"
                  className="size-6 shrink-0 text-accent-deep"
                />
                <h3 className="font-display text-heading-lg text-ink-text">
                  {service.title}
                </h3>
                <p className="font-sans text-body-sm text-ink-text-muted">
                  {service.description}
                </p>
              </li>
            );
          })}
        </ul>

        <div>
          <Link
            href={services.cta.href}
            className={buttonStyles({
              variant: "outline",
              size: "lg",
              className:
                "border-bone-border text-ink-text hover:border-accent-deep hover:text-accent-deep",
            })}
          >
            {services.cta.label}
          </Link>
        </div>
      </Container>
    </section>
  );
}
