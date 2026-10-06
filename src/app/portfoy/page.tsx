import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { PortfolioBrowser } from "@/components/property/portfolio-browser";
import { ContactCta } from "@/components/sections/contact-cta";
import { portfolioPage } from "@/content/pages";
import {
  buildCategoryFilters,
  buildDistrictFilters,
  buildListingTypeFilters,
  type ListingType,
  type PropertyCategory,
} from "@/content/properties";
import { PAGINATION } from "@/lib/db/client";
import { listPublished, toProperty } from "@/lib/db/listings";
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

  // Filtre seçenekleri yayındaki gerçek ilanlardan türetilir; bu yüzden
  // önce ilanlar okunur, URL'den gelen başlangıç seçimleri bu seçeneklere
  // karşı doğrulanır (bilinmeyen bir değer sessizce "tümü"ne düşer).
  // Portföy sayfası istemci tarafında filtreler, bu yüzden sayfalama yerine
  // sistemin izin verdiği azami sayıda (PAGINATION.maxLimit) ilan çekilir.
  const listings = await listPublished({ limit: PAGINATION.maxLimit });
  const properties = listings.map(toProperty);

  const listingTypeFilters = buildListingTypeFilters(properties);
  const categoryFilters = buildCategoryFilters(properties);
  const districtFilters = buildDistrictFilters(properties);

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
