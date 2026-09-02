import { Check } from "lucide-react";

import { Container } from "@/components/ui";
import { servicesPage } from "@/content/pages";
import { services } from "@/content/sections";
import { padIndex } from "@/lib/format";
import { resolveIcon } from "@/lib/icons";

/**
 * `/hizmetler` sayfasındaki ayrıntılı hizmet listesi.
 * Her hizmet kendi `id`'sine sahiptir, alt bilgideki bağlantılar buraya çıpalanır.
 */
export function ServicesDetail() {
  return (
    <section data-services-detail className="bg-ink">
      <Container width="page" className="flex flex-col py-section-sm">
        <ol className="flex flex-col">
          {services.items.map((service, index) => {
            const Icon = resolveIcon(service.icon);
            return (
              <li
                key={service.slug}
                id={service.slug}
                data-service-detail
                data-index={index}
                className="scroll-mt-28 border-b border-border py-block first:border-t"
              >
                <div className="grid gap-block lg:grid-cols-12 lg:gap-12">
                  <div className="flex flex-col gap-4 lg:col-span-5">
                    <span
                      aria-hidden="true"
                      className="font-sans text-eyebrow tracking-eyebrow text-text-muted tabular-nums"
                    >
                      {padIndex(index + 1)}
                    </span>
                    <Icon
                      aria-hidden="true"
                      className="size-6 shrink-0 text-accent"
                    />
                    <h2 className="font-display text-display-sm text-text-primary">
                      {service.title}
                    </h2>
                    <p className="max-w-narrow font-sans text-body-lg text-text-secondary">
                      {service.description}
                    </p>
                  </div>

                  <div className="lg:col-span-6 lg:col-start-7">
                    <h3 className="mb-4 font-sans text-eyebrow tracking-eyebrow text-text-muted uppercase">
                      {servicesPage.detailsLabel}
                    </h3>
                    <ul className="flex flex-col">
                      {service.details.map((detail) => (
                        <li
                          key={detail}
                          className="flex items-start gap-3 border-b border-border py-3 last:border-b-0"
                        >
                          <Check
                            aria-hidden="true"
                            className="mt-1 size-4 shrink-0 text-accent"
                          />
                          <span className="font-sans text-body-md text-text-secondary">
                            {detail}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
