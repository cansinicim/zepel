import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Check, MapPin, Phone } from "lucide-react";

import { PropertyCard } from "@/components/property/property-card";
import { PropertyGallery } from "@/components/property/property-gallery";
import { PropertySpecs } from "@/components/property/property-specs";
import { buttonStyles, Container, Eyebrow, SectionHeading } from "@/components/ui";
import { propertyDetail } from "@/content/pages";
import {
  categoryLabels,
  getPropertyBySlug,
  getRelatedProperties,
  listingTypeLabels,
  propertySlugs,
} from "@/content/properties";
import { contactInfo, navItems } from "@/content/site";
import { buildPropertyMetadata, propertyPath } from "@/lib/seo";
import {
  breadcrumbSchema,
  propertyListingSchema,
  safeJsonLd,
} from "@/lib/structured-data";

type PropertyPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams(): { slug: string }[] {
  return propertySlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);

  return property ? buildPropertyMetadata(property) : {};
}

export default async function PropertyDetailPage({
  params,
}: PropertyPageProps) {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  const related = getRelatedProperties(property.slug);

  return (
    <>
      {/* İlan yapısal verisi: fiyat, alan, oda sayısı ve kırıntı gezinme. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(propertyListingSchema(property)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(
            breadcrumbSchema([
              { name: navItems[0].label, path: "/" },
              { name: navItems[1].label, path: "/portfoy" },
              { name: property.title, path: propertyPath(property.slug) },
            ]),
          ),
        }}
      />

      <article data-property-detail className="bg-ink">
        <Container
          width="page"
          className="flex flex-col gap-block pt-28 pb-section-sm md:pt-36"
        >
          <Link
            href="/portfoy"
            className="inline-flex w-fit items-center gap-2 font-sans text-body-sm text-text-secondary transition-colors duration-[var(--duration-fast)] hover:text-accent"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            {propertyDetail.backLabel}
          </Link>

          <header className="flex flex-col gap-stack">
            <Eyebrow withRule>
              {listingTypeLabels[property.listingType]},{" "}
              {categoryLabels[property.category]}
            </Eyebrow>

            <h1 className="max-w-wide font-display text-display-md text-text-primary">
              {property.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              <p className="inline-flex items-center gap-2 font-sans text-body-md text-text-secondary">
                <MapPin
                  aria-hidden="true"
                  className="size-4 shrink-0 text-text-muted"
                />
                {property.location}, {property.district}, {property.city}
              </p>
              <p className="font-display text-display-sm text-accent tabular-nums">
                {property.priceLabel}
              </p>
            </div>
          </header>

          <div className="grid gap-block lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-8">
              <h2 className="sr-only">{propertyDetail.galleryLabel}</h2>
              <PropertyGallery
                images={property.images}
                title={property.title}
              />
            </div>

            <aside className="flex flex-col gap-block lg:col-span-4">
              <section aria-labelledby="kunye-basligi">
                <h2
                  id="kunye-basligi"
                  className="mb-4 font-sans text-eyebrow tracking-eyebrow text-text-muted uppercase"
                >
                  {propertyDetail.specsTitle}
                </h2>
                <PropertySpecs property={property} />
              </section>

              <section
                aria-labelledby="ilan-cta-basligi"
                className="flex flex-col gap-stack border border-border bg-surface p-6"
              >
                <h2
                  id="ilan-cta-basligi"
                  className="font-display text-heading-lg text-text-primary"
                >
                  {propertyDetail.ctaTitle}
                </h2>
                <p className="font-sans text-body-sm text-text-muted">
                  {propertyDetail.ctaDescription}
                </p>
                <Link
                  href={propertyDetail.ctaPrimary.href}
                  className={buttonStyles({ className: "w-full" })}
                >
                  {propertyDetail.ctaPrimary.label}
                </Link>
                <a
                  href={contactInfo.phoneHref}
                  className={buttonStyles({
                    variant: "outline",
                    className: "w-full",
                  })}
                >
                  <Phone aria-hidden="true" className="size-4" />
                  {contactInfo.phoneLabel}
                </a>
              </section>
            </aside>
          </div>

          <div className="grid gap-block lg:grid-cols-12 lg:gap-12">
            <section
              aria-labelledby="aciklama-basligi"
              className="flex flex-col gap-stack lg:col-span-7"
            >
              <h2
                id="aciklama-basligi"
                className="font-display text-display-sm text-text-primary"
              >
                {propertyDetail.descriptionTitle}
              </h2>
              <p className="font-sans text-body-lg text-text-secondary">
                {property.description}
              </p>
            </section>

            <section
              aria-labelledby="nitelikler-basligi"
              className="flex flex-col gap-stack lg:col-span-5"
            >
              <h2
                id="nitelikler-basligi"
                className="font-display text-heading-lg text-text-primary"
              >
                {propertyDetail.featuresTitle}
              </h2>
              <ul className="flex flex-col">
                {property.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 border-b border-border py-3"
                  >
                    <Check
                      aria-hidden="true"
                      className="mt-1 size-4 shrink-0 text-accent"
                    />
                    <span className="font-sans text-body-md text-text-secondary">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </Container>
      </article>

      {related.length > 0 ? (
        <section
          data-related-properties
          aria-labelledby="benzer-ilanlar-basligi"
          className="border-t border-border bg-ink"
        >
          <Container
            width="page"
            className="flex flex-col gap-block py-section-sm"
          >
            <SectionHeading
              titleId="benzer-ilanlar-basligi"
              size="sm"
              eyebrow={propertyDetail.relatedEyebrow}
              title={propertyDetail.relatedTitle}
              data-reveal
            />

            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.id}>
                  <PropertyCard property={item} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}
    </>
  );
}
