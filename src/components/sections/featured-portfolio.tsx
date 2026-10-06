import Link from "next/link";

import { PropertyCard } from "@/components/property/property-card";
import { buttonStyles, Container, SectionHeading } from "@/components/ui";
import { featuredPortfolio } from "@/content/pages";
import type { Property } from "@/content/properties";

export interface FeaturedPortfolioProps {
  /** Öne çıkan ilanlar, veri kaynağından (veritabanı veya demo dizi) çağıran taraf sağlar. */
  properties: readonly Property[];
}

export function FeaturedPortfolio({ properties }: FeaturedPortfolioProps) {
  return (
    <section
      data-featured-portfolio
      aria-labelledby="one-cikan-portfoy-basligi"
      className="border-b border-border bg-ink"
    >
      <Container width="page" className="flex flex-col gap-block py-section">
        <div className="flex flex-col gap-block md:flex-row md:items-end md:justify-between">
          <SectionHeading
            titleId="one-cikan-portfoy-basligi"
            eyebrow={featuredPortfolio.eyebrow}
            title={featuredPortfolio.title}
            description={featuredPortfolio.description}
            data-reveal
          />

          <Link
            href={featuredPortfolio.cta.href}
            className={buttonStyles({
              variant: "outline",
              className: "shrink-0",
            })}
          >
            {featuredPortfolio.cta.label}
          </Link>
        </div>

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <li key={property.id} data-reveal>
              <PropertyCard property={property} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
