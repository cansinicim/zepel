import Image from "next/image";
import Link from "next/link";
import { Bath, BedDouble, Ruler, type LucideIcon } from "lucide-react";

import { propertyDetail } from "@/content/pages";
import { listingTypeLabels, type Property } from "@/content/properties";
import { formatArea } from "@/lib/format";
import { cn } from "@/lib/utils";

type CardSpec = {
  id: string;
  icon: LucideIcon;
  value: string;
  label: string;
};

/** Kartlarda gösterilecek künye satırı, sıfır değerli alanlar elenir. */
function buildSpecs(property: Property): CardSpec[] {
  const { specLabels, areaUnit } = propertyDetail;
  const specs: CardSpec[] = [];

  if (property.beds > 0) {
    specs.push({
      id: "beds",
      icon: BedDouble,
      value: String(property.beds),
      label: specLabels.beds,
    });
  }

  if (property.baths > 0) {
    specs.push({
      id: "baths",
      icon: Bath,
      value: String(property.baths),
      label: specLabels.baths,
    });
  }

  specs.push({
    id: "area",
    icon: Ruler,
    value: `${formatArea(property.area)} ${areaUnit}`,
    label: specLabels.area,
  });

  return specs;
}

export interface PropertyCardProps {
  property: Property;
  /** Başlık etiketi, sayfadaki hiyerarşiye göre verilir. */
  headingAs?: "h2" | "h3";
  /** İlk ekranda görünen kartlarda görsel öncelikli yüklenir. */
  priority?: boolean;
  className?: string;
}

export function PropertyCard({
  property,
  headingAs: Heading = "h3",
  priority = false,
  className,
}: PropertyCardProps) {
  const specs = buildSpecs(property);
  const coverImage = property.images[0];

  return (
    <article
      data-property-card
      data-property-id={property.id}
      className={cn(
        "group relative isolate flex h-full flex-col overflow-hidden border border-border bg-surface",
        "transition-colors duration-[var(--duration-base)] ease-out-expo hover:border-border-strong",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-elevated">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={property.title}
            fill
            priority={priority}
            loading={priority ? undefined : "lazy"}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-[var(--duration-slow)] ease-out-expo group-hover:scale-[1.04]"
          />
        ) : null}

        <span className="absolute top-4 left-4 inline-flex items-center rounded-xs bg-overlay/85 px-3 py-1 font-sans text-eyebrow tracking-eyebrow text-text-primary uppercase backdrop-blur-sm">
          {listingTypeLabels[property.listingType]}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <p className="font-sans text-eyebrow tracking-eyebrow text-text-muted uppercase">
          {property.location}, {property.district}
        </p>

        <Heading className="font-display text-heading-lg text-text-primary">
          <Link
            href={`/portfoy/${property.slug}`}
            className="transition-colors duration-[var(--duration-fast)] after:absolute after:inset-0 after:content-[''] group-hover:text-accent"
          >
            {property.title}
          </Link>
        </Heading>

        <dl className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-4">
          {specs.map((spec) => {
            const Icon = spec.icon;
            return (
              <div key={spec.id} className="flex items-center gap-2">
                <Icon
                  aria-hidden="true"
                  className="size-4 shrink-0 text-text-muted"
                />
                <dt className="sr-only">{spec.label}</dt>
                <dd className="font-sans text-body-sm text-text-secondary tabular-nums">
                  {spec.value}
                </dd>
              </div>
            );
          })}
        </dl>

        <p className="font-display text-heading-lg text-accent tabular-nums">
          {property.priceLabel}
        </p>
      </div>
    </article>
  );
}
