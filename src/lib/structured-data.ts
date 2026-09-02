/**
 * Zepel Gayrimenkul, schema.org JSON-LD üreticileri.
 *
 * Buradaki fonksiyonlar saftır: yan etkisi yoktur, yalnızca `@/content`
 * altındaki gerçek veriden düz nesne üretir. Eksik veri uydurulmaz, ilgili
 * alan çıktıdan tamamen çıkarılır.
 *
 * Kullanım (sunucu bileşeninde):
 *
 *   <script
 *     type="application/ld+json"
 *     dangerouslySetInnerHTML={{ __html: safeJsonLd(realEstateAgentSchema()) }}
 *   />
 */

import { propertyDetail } from "@/content/pages";
import {
  categoryLabels,
  listingTypeLabels,
  properties,
  type ListingType,
  type Property,
  type PropertyCategory,
} from "@/content/properties";
import { contactInfo, siteConfig, socialLinks } from "@/content/site";
import { absoluteUrl, propertyPath } from "@/lib/seo";

/* -------------------------------------------------------------------------- */
/* Tipler ve güvenli serileştirme                                             */
/* -------------------------------------------------------------------------- */

export type JsonLd = Record<string, unknown>;

/**
 * JavaScript'te satır sonu sayılan, JSON'da ise geçerli olan ayraçlar.
 * Kaynakta ham karakter yerine kaçış dizisiyle yazılır, dosya okunabilir kalır.
 */
const LINE_SEPARATOR = "\u2028";
const PARAGRAPH_SEPARATOR = "\u2029";

/**
 * `<script>` içine gömülecek karakterlerin JSON kaçış karşılıkları.
 * `</script>` dizisinin erken kapanmasını ve HTML entity yorumlanmasını önler.
 */
const JSON_LD_ESCAPES: Readonly<Record<string, string>> = {
  "<": "\\u003c",
  ">": "\\u003e",
  "&": "\\u0026",
  [LINE_SEPARATOR]: "\\u2028",
  [PARAGRAPH_SEPARATOR]: "\\u2029",
};

const JSON_LD_UNSAFE_PATTERN = new RegExp(
  `[<>&${LINE_SEPARATOR}${PARAGRAPH_SEPARATOR}]`,
  "g",
);

/**
 * JSON-LD nesnesini XSS'e kapalı biçimde metne çevirir.
 * `<script type="application/ld+json">` içine yalnızca bu fonksiyonun
 * çıktısı yazılmalıdır.
 */
export function safeJsonLd(data: JsonLd | readonly JsonLd[]): string {
  return JSON.stringify(data).replace(
    JSON_LD_UNSAFE_PATTERN,
    (character) => JSON_LD_ESCAPES[character] ?? character,
  );
}

/* -------------------------------------------------------------------------- */
/* Ortak sabitler ve düğüm kimlikleri                                         */
/* -------------------------------------------------------------------------- */

const SCHEMA_CONTEXT = "https://schema.org";

/** `properties.ts` içindeki ham fiyatlar TRY cinsindendir. */
const PRICE_CURRENCY = "TRY";

/** UN/CEFACT birim kodları: MTK metrekare, MON ay. */
const AREA_UNIT_CODE = "MTK";
const MONTH_UNIT_CODE = "MON";

/**
 * Sayfalar arası tekil kimlikler.
 * Aynı kuruluş birden fazla sayfada geçtiğinde tek varlık olarak birleşir.
 */
export const ORGANIZATION_ID = absoluteUrl("/#organization");
export const WEBSITE_ID = absoluteUrl("/#website");

/** Marka logosu, kuruluş kayıtlarında zengin sonuç için gereklidir. */
const BRAND_LOGO_URL = absoluteUrl("/brand/zepel-logo.svg");

/** Kiralık ilanlarda fiyat periyodunun birim kodu karşılığı. */
const PERIOD_UNIT_CODES: Readonly<
  Record<NonNullable<Property["pricePeriod"]>, string>
> = {
  ay: MONTH_UNIT_CODE,
};

/** GoodRelations iş fonksiyonu, satış ile kiralamayı ayırır. */
const BUSINESS_FUNCTIONS: Readonly<Record<ListingType, string>> = {
  satilik: "http://purl.org/goodrelations/v1#Sell",
  kiralik: "http://purl.org/goodrelations/v1#LeaseOut",
};

/**
 * Mülk kategorisinin schema.org karşılığı.
 * Konut dışı kategorilerde (ofis, arsa) uygun bir alt tip bulunmadığı için
 * genel `Place` kullanılır.
 */
const ACCOMMODATION_TYPES: Readonly<Record<PropertyCategory, string>> = {
  villa: "SingleFamilyResidence",
  yali: "SingleFamilyResidence",
  rezidans: "Apartment",
  daire: "Apartment",
  ofis: "Place",
  arsa: "Place",
};

/** `yearBuilt` yalnızca Accommodation alt tiplerinde geçerlidir. */
const ACCOMMODATION_SUBTYPES: readonly string[] = [
  "SingleFamilyResidence",
  "Apartment",
];

/* -------------------------------------------------------------------------- */
/* İçerikten türetilen yardımcılar                                            */
/* -------------------------------------------------------------------------- */

/** "tr-TR" biçimindeki locale'den ülke kodunu okur, yoksa alan atlanır. */
function countryFromLocale(locale: string): string | undefined {
  const region = locale.split("-")[1];
  return region ? region.toUpperCase() : undefined;
}

const ADDRESS_COUNTRY = countryFromLocale(siteConfig.locale);

/** `tel:` ve `mailto:` şemalarını temizler. */
function stripScheme(href: string): string {
  return href.replace(/^[a-z]+:/i, "");
}

/** "34365 Şişli, İstanbul" biçimindeki son adres satırını ayrıştırır. */
const POSTAL_LINE = /^(\d{4,5})\s+(.+)$/;

/**
 * Ofis adresini PostalAddress düğümüne çevirir.
 * Son satır beklenen biçimde değilse tek satırlık adrese düşülür ve
 * ayrıştırılamayan alanlar çıktıya hiç eklenmez.
 */
function postalAddressSchema(): JsonLd {
  const lines = contactInfo.addressLines;
  const lastLine = lines[lines.length - 1];
  const match = lastLine ? POSTAL_LINE.exec(lastLine) : null;

  if (!match) {
    return {
      "@type": "PostalAddress",
      streetAddress: contactInfo.addressSingleLine,
      ...(ADDRESS_COUNTRY ? { addressCountry: ADDRESS_COUNTRY } : {}),
    };
  }

  const [, postalCode, remainder] = match;
  const [locality, region] = remainder
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  return {
    "@type": "PostalAddress",
    streetAddress: lines.slice(0, -1).join(", "),
    ...(locality ? { addressLocality: locality } : {}),
    ...(region ? { addressRegion: region } : {}),
    postalCode,
    ...(ADDRESS_COUNTRY ? { addressCountry: ADDRESS_COUNTRY } : {}),
  };
}

/**
 * Türkçe gün adı, schema.org karşılığı.
 * `contactInfo.hours` gün bilgisini serbest metin tuttuğu için bu sözlük gerekir.
 */
const WEEK_DAYS = [
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
  "Pazar",
] as const;

type TurkishDay = (typeof WEEK_DAYS)[number];

const SCHEMA_DAYS: Readonly<Record<TurkishDay, string>> = {
  Pazartesi: "Monday",
  Salı: "Tuesday",
  Çarşamba: "Wednesday",
  Perşembe: "Thursday",
  Cuma: "Friday",
  Cumartesi: "Saturday",
  Pazar: "Sunday",
};

function isTurkishDay(value: string): value is TurkishDay {
  return (WEEK_DAYS as readonly string[]).includes(value);
}

/**
 * "Pazartesi, Cuma" gibi etiketleri gün listesine açar.
 * İçerik dosyasında uzun tire kullanılmadığı için virgül aralık ayracıdır:
 * iki gün yazılmışsa aradaki günler de kapsanır, tek gün yazılmışsa o gün alınır.
 */
function parseDays(label: string): string[] {
  const days = label
    .split(",")
    .map((part) => part.trim())
    .filter(isTurkishDay);

  if (days.length === 0) return [];
  if (days.length === 1) return [SCHEMA_DAYS[days[0]]];

  const start = WEEK_DAYS.indexOf(days[0]);
  const end = WEEK_DAYS.indexOf(days[days.length - 1]);
  if (start < 0 || end < 0 || end < start) {
    return days.map((day) => SCHEMA_DAYS[day]);
  }

  return WEEK_DAYS.slice(start, end + 1).map((day) => SCHEMA_DAYS[day]);
}

/** "09.00, 19.00" biçimindeki değeri açılış ve kapanış saatine çevirir. */
function parseTimeRange(
  value: string,
): { opens: string; closes: string } | null {
  const matches = [...value.matchAll(/(\d{1,2})[.:](\d{2})/g)];
  if (matches.length < 2) return null;

  const toTime = (match: RegExpMatchArray): string =>
    `${match[1].padStart(2, "0")}:${match[2]}`;

  return {
    opens: toTime(matches[0]),
    closes: toTime(matches[matches.length - 1]),
  };
}

/**
 * Çalışma saatleri.
 * "Randevu ile" gibi saat içermeyen satırlar geçerli bir opens/closes çifti
 * üretemediği için çıktıya eklenmez.
 */
function openingHoursSchema(): JsonLd[] {
  return contactInfo.hours.flatMap((entry) => {
    const dayOfWeek = parseDays(entry.label);
    const time = parseTimeRange(entry.value);
    if (dayOfWeek.length === 0 || !time) return [];

    return [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek,
        opens: time.opens,
        closes: time.closes,
      },
    ];
  });
}

/** Portföydeki şehirlerden hizmet verilen bölgeleri türetir. */
function areaServedSchema(): JsonLd[] {
  return Array.from(new Set(properties.map((property) => property.city)))
    .sort((a, b) => a.localeCompare(b, siteConfig.locale))
    .map((city) => ({
      "@type": "City",
      name: city,
      ...(ADDRESS_COUNTRY ? { addressCountry: ADDRESS_COUNTRY } : {}),
    }));
}

/* -------------------------------------------------------------------------- */
/* Kuruluş                                                                    */
/* -------------------------------------------------------------------------- */

export type GeoCoordinatesInput = {
  readonly latitude: number;
  readonly longitude: number;
};

/**
 * Ofisin yerel işletme kaydı.
 * `RealEstateAgent`, `LocalBusiness` ve `Organization` alt tipi olduğu için
 * `ORGANIZATION_ID` ile aynı varlığı tanımlar.
 *
 * Koordinat `site.ts` içinde tutulmadığından `geo` yalnızca çağıran taraf
 * değeri verdiğinde eklenir.
 */
export function realEstateAgentSchema(geo?: GeoCoordinatesInput): JsonLd {
  const openingHours = openingHoursSchema();

  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "RealEstateAgent",
    "@id": ORGANIZATION_ID,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    alternateName: siteConfig.shortName,
    slogan: siteConfig.tagline,
    description: siteConfig.description,
    url: absoluteUrl("/"),
    logo: BRAND_LOGO_URL,
    image: BRAND_LOGO_URL,
    foundingDate: String(siteConfig.foundedYear),
    telephone: stripScheme(contactInfo.phoneHref),
    email: stripScheme(contactInfo.emailHref),
    address: postalAddressSchema(),
    hasMap: contactInfo.mapsUrl,
    areaServed: areaServedSchema(),
    ...(openingHours.length > 0
      ? { openingHoursSpecification: openingHours }
      : {}),
    currenciesAccepted: PRICE_CURRENCY,
    knowsLanguage: [siteConfig.locale],
    sameAs: socialLinks.map((link) => link.href),
    ...(geo
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: geo.latitude,
            longitude: geo.longitude,
          },
        }
      : {}),
  };
}

/**
 * Kuruluşun sade kaydı.
 *
 * DİKKAT: `realEstateAgentSchema()` ile aynı `@id` değerini taşır, çünkü ikisi
 * de aynı varlığı tanımlar. Aynı sayfada ikisi birden basılmamalıdır; site
 * genelinde `realEstateAgentSchema()` tercih edilir, bu fonksiyon yalnızca
 * yerel işletme bağlamı olmayan bir sayfa gerektiğinde kullanılır.
 */
export function organizationSchema(): JsonLd {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    alternateName: siteConfig.shortName,
    description: siteConfig.description,
    url: absoluteUrl("/"),
    logo: BRAND_LOGO_URL,
    foundingDate: String(siteConfig.foundedYear),
    address: postalAddressSchema(),
    sameAs: socialLinks.map((link) => link.href),
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        telephone: stripScheme(contactInfo.phoneHref),
        email: stripScheme(contactInfo.emailHref),
        availableLanguage: [siteConfig.locale],
        ...(ADDRESS_COUNTRY ? { areaServed: ADDRESS_COUNTRY } : {}),
      },
    ],
  };
}

/* -------------------------------------------------------------------------- */
/* Site                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Site kaydı.
 *
 * `potentialAction` (SearchAction) bilinçli olarak eklenmez: sitede serbest
 * metin arama rotası yoktur, portföy sayfası yalnızca sabit filtre değerleri
 * kabul eder. Var olmayan bir arama uç noktası bildirmek yanlış veri olur.
 */
export function websiteSchema(): JsonLd {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: siteConfig.name,
    alternateName: siteConfig.shortName,
    description: siteConfig.description,
    url: absoluteUrl("/"),
    inLanguage: siteConfig.locale,
    publisher: { "@id": ORGANIZATION_ID },
  };
}

/* -------------------------------------------------------------------------- */
/* Kırıntı navigasyonu                                                        */
/* -------------------------------------------------------------------------- */

export type BreadcrumbItem = {
  readonly name: string;
  /** Site köküne göre rota, ör. "/portfoy". */
  readonly path: string;
};

/** Sayfanın kırıntı yolu. Sıra, verilen dizinin sırasıdır. */
export function breadcrumbSchema(items: readonly BreadcrumbItem[]): JsonLd {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/* -------------------------------------------------------------------------- */
/* İlan                                                                       */
/* -------------------------------------------------------------------------- */

/** İlanın konumu, mahalle sokak satırına, ilçe ve şehir idari alanlara yazılır. */
function propertyAddressSchema(property: Property): JsonLd {
  return {
    "@type": "PostalAddress",
    streetAddress: property.location,
    addressLocality: property.district,
    addressRegion: property.city,
    ...(ADDRESS_COUNTRY ? { addressCountry: ADDRESS_COUNTRY } : {}),
  };
}

/**
 * Fiyat tanımı.
 * Kiralık ilanlarda bedel aylıktır, bu yüzden `UnitPriceSpecification` ile
 * birim ve fatura dönemi açıkça belirtilir. Satılık ilanlarda tek seferlik
 * bedel olarak `PriceSpecification` kullanılır.
 */
function priceSpecificationSchema(property: Property): JsonLd {
  const unitCode = property.pricePeriod
    ? PERIOD_UNIT_CODES[property.pricePeriod]
    : undefined;

  if (!unitCode) {
    return {
      "@type": "PriceSpecification",
      price: property.price,
      priceCurrency: PRICE_CURRENCY,
    };
  }

  return {
    "@type": "UnitPriceSpecification",
    price: property.price,
    priceCurrency: PRICE_CURRENCY,
    unitCode,
    billingIncrement: 1,
    billingDuration: 1,
    referenceQuantity: {
      "@type": "QuantitativeValue",
      value: 1,
      unitCode,
    },
  };
}

function offerSchema(property: Property, url: string): JsonLd {
  return {
    "@type": "Offer",
    "@id": `${url}#offer`,
    url,
    price: property.price,
    priceCurrency: PRICE_CURRENCY,
    availability: `${SCHEMA_CONTEXT}/InStock`,
    businessFunction: BUSINESS_FUNCTIONS[property.listingType],
    priceSpecification: priceSpecificationSchema(property),
    seller: { "@id": ORGANIZATION_ID },
  };
}

/**
 * Mülkün kendisi.
 *
 * Tip çoklu verilir: `Product` teklif (`offers`) alanını geçerli kılar,
 * ikinci tip ise mülkün gerçek niteliğini (konut, daire, yer) taşır.
 */
function accommodationSchema(property: Property, url: string): JsonLd {
  const accommodationType = ACCOMMODATION_TYPES[property.category];
  const { specLabels, areaUnit } = propertyDetail;

  const additionalProperty: JsonLd[] = [
    {
      "@type": "PropertyValue",
      name: specLabels.area,
      value: property.area,
      unitCode: AREA_UNIT_CODE,
      unitText: areaUnit,
    },
    ...(property.plotArea
      ? [
          {
            "@type": "PropertyValue",
            name: specLabels.plotArea,
            value: property.plotArea,
            unitCode: AREA_UNIT_CODE,
            unitText: areaUnit,
          },
        ]
      : []),
  ];

  return {
    "@type": ["Product", accommodationType],
    "@id": `${url}#mulk`,
    sku: property.id,
    name: property.title,
    description: property.description,
    category: categoryLabels[property.category],
    image: [...property.images],
    address: propertyAddressSchema(property),
    floorSize: {
      "@type": "QuantitativeValue",
      value: property.area,
      unitCode: AREA_UNIT_CODE,
      unitText: areaUnit,
    },
    ...(property.beds > 0 ? { numberOfRooms: property.beds } : {}),
    ...(property.baths > 0
      ? { numberOfBathroomsTotal: property.baths }
      : {}),
    ...(property.buildYear &&
    ACCOMMODATION_SUBTYPES.includes(accommodationType)
      ? { yearBuilt: property.buildYear }
      : {}),
    amenityFeature: property.features.map((feature) => ({
      "@type": "LocationFeatureSpecification",
      name: feature,
      value: true,
    })),
    additionalProperty,
    offers: offerSchema(property, url),
  };
}

/**
 * İlan detay sayfasının yapısal verisi.
 * `RealEstateListing` sayfayı, `mainEntity` ise mülkü ve teklifini tanımlar.
 */
export function propertyListingSchema(property: Property): JsonLd {
  const url = absoluteUrl(propertyPath(property.slug));

  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "RealEstateListing",
    "@id": `${url}#ilan`,
    url,
    name: `${listingTypeLabels[property.listingType]} ${property.title}`,
    description: property.description,
    image: [...property.images],
    inLanguage: siteConfig.locale,
    isPartOf: { "@id": WEBSITE_ID },
    provider: { "@id": ORGANIZATION_ID },
    mainEntity: accommodationSchema(property, url),
  };
}
