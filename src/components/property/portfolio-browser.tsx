"use client";

import { useMemo, useState } from "react";
import { SearchX } from "lucide-react";

import { FilterGroup } from "@/components/property/filter-group";
import { PropertyCard } from "@/components/property/property-card";
import { Button, Container } from "@/components/ui";
import { portfolioPage } from "@/content/pages";
import type {
  FilterOption,
  ListingType,
  Property,
  PropertyCategory,
} from "@/content/properties";

export interface PortfolioBrowserProps {
  properties: readonly Property[];
  listingTypeOptions: readonly FilterOption<ListingType>[];
  categoryOptions: readonly FilterOption<PropertyCategory>[];
  districtOptions: readonly FilterOption[];
  /** URL sorgusundan gelen başlangıç seçimleri, örn /portfoy?tip=satilik */
  initialListingType?: ListingType | null;
  initialCategory?: PropertyCategory | null;
}

/**
 * İstemci tarafı portföy filtresi.
 *
 * Veri dışarıdan prop olarak gelir; bileşen yalnızca seçimi ve süzmeyi bilir.
 * Böylece içerik kaynağı değişse de bu katman aynı kalır.
 */
export function PortfolioBrowser({
  properties,
  listingTypeOptions,
  categoryOptions,
  districtOptions,
  initialListingType = null,
  initialCategory = null,
}: PortfolioBrowserProps) {
  const { filters, resultsSuffix, emptyTitle, emptyDescription } =
    portfolioPage;

  const [listingType, setListingType] = useState<ListingType | null>(
    initialListingType,
  );
  const [category, setCategory] = useState<PropertyCategory | null>(
    initialCategory,
  );
  const [district, setDistrict] = useState<string | null>(null);

  const visibleProperties = useMemo(
    () =>
      properties.filter(
        (property) =>
          (listingType === null || property.listingType === listingType) &&
          (category === null || property.category === category) &&
          (district === null || property.district === district),
      ),
    [properties, listingType, category, district],
  );

  const hasActiveFilter =
    listingType !== null || category !== null || district !== null;

  const resetFilters = () => {
    setListingType(null);
    setCategory(null);
    setDistrict(null);
  };

  return (
    <section
      data-portfolio-browser
      aria-labelledby="portfoy-sonuclari-basligi"
      className="bg-ink"
    >
      <Container width="page" className="flex flex-col gap-block py-section-sm">
        <h2 id="portfoy-sonuclari-basligi" className="sr-only">
          {portfolioPage.resultsLabel}
        </h2>

        <div
          role="group"
          aria-label={filters.groupLabel}
          className="flex flex-col gap-block border-b border-border pb-block"
        >
          <FilterGroup
            label={filters.listingType}
            allLabel={filters.all}
            options={listingTypeOptions}
            value={listingType}
            onChange={setListingType}
          />
          <FilterGroup
            label={filters.category}
            allLabel={filters.all}
            options={categoryOptions}
            value={category}
            onChange={setCategory}
          />
          <FilterGroup
            label={filters.district}
            allLabel={filters.all}
            options={districtOptions}
            value={district}
            onChange={setDistrict}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <p
            aria-live="polite"
            className="font-sans text-body-sm text-text-secondary"
          >
            <span className="text-text-primary tabular-nums">
              {visibleProperties.length}
            </span>{" "}
            {resultsSuffix}
          </p>

          {hasActiveFilter ? (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              {filters.reset}
            </Button>
          ) : null}
        </div>

        {visibleProperties.length > 0 ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProperties.map((property, index) => (
              <li key={property.id}>
                <PropertyCard property={property} priority={index < 3} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-start gap-stack border border-border bg-surface p-8 sm:p-12">
            <SearchX aria-hidden="true" className="size-6 text-accent" />
            <h3 className="font-display text-heading-lg text-text-primary">
              {emptyTitle}
            </h3>
            <p className="max-w-narrow font-sans text-body-md text-text-muted">
              {emptyDescription}
            </p>
            <Button variant="outline" size="md" onClick={resetFilters}>
              {filters.reset}
            </Button>
          </div>
        )}
      </Container>
    </section>
  );
}
