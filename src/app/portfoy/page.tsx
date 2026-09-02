import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { PortfolioBrowser } from "@/components/property/portfolio-browser";
import { ContactCta } from "@/components/sections/contact-cta";
import { portfolioPage } from "@/content/pages";
import {
  categoryFilters,
  districtFilters,
  listingTypeFilters,
  properties,
  type ListingType,
  type PropertyCategory,
} from "@/content/properties";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: portfolioPage.intro.title,
  description: portfolioPage.intro.description,
  path: "/portfoy",
});

/**
 * Route tipleri derleme sırasında üretildiği için `PageProps<"/portfoy">`
 * yerine sorgu sözleşmesi burada açıkça yazılır. Sayfa tek bir tipe bağlı
 * kalır ve tip üretimi sırasına duyarlı olmaz.
 */
type PortfolioSearchParams = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** URL sorgusundaki değeri yalnızca bilinen filtre seçeneklerinden biriyse kabul eder. */
function readFilterParam<TValue extends string>(
  raw: string | string[] | undefined,
  allowed: readonly { readonly value: TValue }[],
): TValue | null {
  if (typeof raw !== "string") return null;
  const match = allowed.find((option) => option.value === raw);
  return match ? match.value : null;
}

export default async function PortfolioPage({
  searchParams,
}: PortfolioSearchParams) {
  const params = await searchParams;

  const initialListingType = readFilterParam<ListingType>(
    params.tip,
    listingTypeFilters,
  );
  const initialCategory = readFilterParam<PropertyCategory>(
    params.kategori,
    categoryFilters,
  );

  return (
    <>
      <PageHeader intro={portfolioPage.intro} />
      <PortfolioBrowser
        properties={properties}
        listingTypeOptions={listingTypeFilters}
        categoryOptions={categoryFilters}
        districtOptions={districtFilters}
        initialListingType={initialListingType}
        initialCategory={initialCategory}
      />
      <ContactCta />
    </>
  );
}
