/**
 * Zepel Gayrimenkul, sitemap.xml.
 *
 * Rotalar elle listelenmez: statik sayfalar `navItems` ve yasal metinlerden,
 * ilan sayfaları `properties` dizisinden türetilir. Yeni bir ilan veya yasal
 * metin eklendiğinde site haritası kendiliğinden güncellenir.
 */

import type { MetadataRoute } from "next";

import {
  cookiePolicy,
  kvkkNotice,
  privacyPolicy,
  termsOfUse,
  type LegalDocument,
} from "@/content/legal";
import { properties } from "@/content/properties";
import { navItems } from "@/content/site";
import { absoluteUrl, propertyPath } from "@/lib/seo";

type SitemapEntry = MetadataRoute.Sitemap[number];
type ChangeFrequency = NonNullable<SitemapEntry["changeFrequency"]>;

type RouteRule = {
  readonly changeFrequency: ChangeFrequency;
  readonly priority: number;
};

/**
 * Statik sayfaların tarama sıklığı ve önceliği.
 * Anahtarlar `navItems` içindeki rotalarla birebir aynıdır.
 */
const STATIC_ROUTE_RULES: Readonly<Record<string, RouteRule>> = {
  "/": { changeFrequency: "weekly", priority: 1 },
  "/portfoy": { changeFrequency: "daily", priority: 0.9 },
  "/hizmetler": { changeFrequency: "monthly", priority: 0.7 },
  "/hakkimizda": { changeFrequency: "monthly", priority: 0.6 },
  "/iletisim": { changeFrequency: "monthly", priority: 0.7 },
};

/** Kurala bağlanmamış bir statik rota eklenirse kullanılacak değerler. */
const DEFAULT_STATIC_RULE: RouteRule = {
  changeFrequency: "monthly",
  priority: 0.5,
};

/** İlan sayfaları. Öne çıkan ilanlar bir kademe yüksek önceliklidir. */
const PROPERTY_RULE: RouteRule = { changeFrequency: "weekly", priority: 0.7 };
const FEATURED_PROPERTY_PRIORITY = 0.8;

/** Yasal metinler dizine açık kalır, ancak nadiren değişir. */
const LEGAL_RULE: RouteRule = { changeFrequency: "yearly", priority: 0.3 };

/** Yasal sayfalar, kendi `lastUpdated` tarihleriyle listelenir. */
const legalDocuments: readonly LegalDocument[] = [
  privacyPolicy,
  kvkkNotice,
  cookiePolicy,
  termsOfUse,
];

/**
 * Derleme anı.
 * Site statik üretildiği için içerik dosyalarındaki her değişiklik yeni bir
 * derleme demektir; tarih taşımayan sayfalar için doğru referans budur.
 */
const buildDate = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = navItems.map((item) => {
    const rule = STATIC_ROUTE_RULES[item.href] ?? DEFAULT_STATIC_RULE;

    return {
      url: absoluteUrl(item.href),
      lastModified: buildDate,
      changeFrequency: rule.changeFrequency,
      priority: rule.priority,
    };
  });

  const propertyEntries: MetadataRoute.Sitemap = properties.map((property) => ({
    url: absoluteUrl(propertyPath(property.slug)),
    lastModified: buildDate,
    changeFrequency: PROPERTY_RULE.changeFrequency,
    priority: property.featured
      ? FEATURED_PROPERTY_PRIORITY
      : PROPERTY_RULE.priority,
    images: [...property.images],
  }));

  const legalEntries: MetadataRoute.Sitemap = legalDocuments.map((document) => ({
    url: absoluteUrl(`/${document.slug}`),
    lastModified: new Date(`${document.lastUpdated}T00:00:00Z`),
    changeFrequency: LEGAL_RULE.changeFrequency,
    priority: LEGAL_RULE.priority,
  }));

  return [...staticEntries, ...propertyEntries, ...legalEntries];
}
