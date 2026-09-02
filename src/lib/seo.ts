/**
 * Zepel Gayrimenkul, SEO metadata yardımcıları.
 *
 * Next.js Metadata API için tek üretim noktası. Sayfa bileşenleri başlık,
 * açıklama, canonical, Open Graph ve Twitter alanlarını kendi içinde yazmaz;
 * bu dosyadaki `buildMetadata` ve `buildPropertyMetadata` fonksiyonlarını
 * çağırır. Tüm metinler `@/content` altındaki içerik dosyalarından türetilir.
 */

import type { Metadata } from "next";

import { propertyDetail } from "@/content/pages";
import {
  categoryLabels,
  listingTypeLabels,
  type Property,
} from "@/content/properties";
import { hero } from "@/content/sections";
import { siteConfig } from "@/content/site";
import { formatArea } from "@/lib/format";

/* -------------------------------------------------------------------------- */
/* Taban adres                                                                */
/* -------------------------------------------------------------------------- */

/** Sondaki eğik çizgileri ve boşlukları temizler, karşılaştırılabilir taban üretir. */
function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

/**
 * Kanonik taban adres.
 * Öncelik `NEXT_PUBLIC_SITE_URL`, tanımlı değilse `siteConfig.url` yedeğe düşer.
 * Ortam değişkeni derleme anında gömülür, bu yüzden tam adla okunmalıdır.
 */
export const siteUrl: string = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || siteConfig.url,
);

/**
 * Göreli bir rotayı mutlak adrese çevirir.
 * Zaten mutlak olan adresler (ör. Unsplash görselleri) olduğu gibi döner.
 */
export function absoluteUrl(path: string = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;

  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;
  const withoutTrailingSlash = withLeadingSlash.replace(/\/+$/, "");

  return withoutTrailingSlash === ""
    ? `${siteUrl}/`
    : `${siteUrl}${withoutTrailingSlash}`;
}

/** İlan detay sayfasının rotası, tek yerden üretilir. */
export function propertyPath(slug: string): string {
  return `/portfoy/${slug}`;
}

/**
 * Open Graph locale biçimi alt çizgi ister (tr_TR), `siteConfig.locale` ise
 * BCP 47 biçimindedir (tr-TR). Dönüşüm burada yapılır.
 */
export const openGraphLocale: string = siteConfig.locale.replace("-", "_");

/* -------------------------------------------------------------------------- */
/* Açıklama metni                                                             */
/* -------------------------------------------------------------------------- */

/** Arama sonuçlarında kırpılmadan görünen üst sınır. */
const MAX_DESCRIPTION_LENGTH = 158;

/** Kısa açıklamalara ilan metninin de eklendiği alt eşik. */
const MIN_DESCRIPTION_LENGTH = 110;

/** Boşlukları sadeleştirir, sınırı aşan metni kelime sınırında keser. */
function clampDescription(
  value: string,
  max: number = MAX_DESCRIPTION_LENGTH,
): string {
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;

  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const head = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;

  return `${head.replace(/[.,;:]+$/, "")}…`;
}

/** Etiketleri cümle içinde kullanmak için Türkçe kurallarına göre küçültür. */
function lowerCase(value: string): string {
  return value.toLocaleLowerCase(siteConfig.locale);
}

/**
 * İlan için meta açıklaması: ilan tipi, mülk tipi, konum, künye ve fiyat.
 * Metin kısa kalırsa ilan tanıtımının başı da eklenir.
 */
export function buildPropertyDescription(property: Property): string {
  const { specLabels, areaUnit } = propertyDetail;

  const headline = `${listingTypeLabels[property.listingType]} ${lowerCase(
    categoryLabels[property.category],
  )}, ${property.location}, ${property.district}, ${property.city}.`;

  const specs = [
    property.beds > 0 ? `${property.beds} ${lowerCase(specLabels.beds)}` : null,
    property.baths > 0
      ? `${property.baths} ${lowerCase(specLabels.baths)}`
      : null,
    `${formatArea(property.area)} ${areaUnit}`,
  ].filter((entry): entry is string => entry !== null);

  const summary = `${headline} ${specs.join(", ")}. ${property.priceLabel}.`;

  return clampDescription(
    summary.length < MIN_DESCRIPTION_LENGTH
      ? `${summary} ${property.description}`
      : summary,
  );
}

/* -------------------------------------------------------------------------- */
/* Metadata üretimi                                                           */
/* -------------------------------------------------------------------------- */

export type SeoImage = {
  readonly url: string;
  readonly alt: string;
};

/**
 * Varsayılan paylaşım görseli.
 * Anasayfa hero görseli kullanılır, böylece markaya ait gerçek bir görsel
 * servis edilir ve kırık bir OG bağlantısı oluşmaz.
 */
export const defaultSeoImage: SeoImage = {
  url: hero.media.src,
  alt: hero.media.alt,
};

export type SeoPageType = "website" | "article";

export type BuildMetadataOptions = {
  /** Sayfa başlığı. Kök layout'taki `%s | Zepel Gayrimenkul` şablonuna girer. */
  readonly title: string;
  readonly description: string;
  /** Site köküne göre rota, ör. "/portfoy". Canonical ve OG url bundan üretilir. */
  readonly path: string;
  /** Sosyal kartlarda başlığın markadan önceki kısmı, verilmezse `title` kullanılır. */
  readonly socialTitle?: string;
  readonly image?: SeoImage;
  readonly type?: SeoPageType;
  readonly keywords?: readonly string[];
  /** Arama motorlarından gizlenmesi gereken sayfalar için. */
  readonly noIndex?: boolean;
};

/** Dizine açık sayfalar için robots yönergeleri. */
const INDEXABLE_ROBOTS: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

/** Dizine kapalı sayfalar için robots yönergeleri. */
const NON_INDEXABLE_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};

/**
 * Bir sayfa için tam Metadata nesnesi üretir.
 * Canonical göreli verilir, kök layout'taki `metadataBase` ile mutlak hale gelir.
 */
export function buildMetadata({
  title,
  description,
  path,
  socialTitle,
  image = defaultSeoImage,
  type = "website",
  keywords,
  noIndex = false,
}: BuildMetadataOptions): Metadata {
  const shortDescription = clampDescription(description);
  const shareTitle = `${socialTitle ?? title} | ${siteConfig.name}`;

  return {
    title,
    description: shortDescription,
    ...(keywords ? { keywords: [...keywords] } : {}),
    alternates: { canonical: path },
    robots: noIndex ? NON_INDEXABLE_ROBOTS : INDEXABLE_ROBOTS,
    openGraph: {
      type,
      locale: openGraphLocale,
      siteName: siteConfig.name,
      url: path,
      title: shareTitle,
      description: shortDescription,
      images: [{ url: image.url, alt: image.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description: shortDescription,
      images: [image.url],
    },
  };
}

/**
 * İlan detay sayfasının metadata'sı.
 * Başlık kısa tutulur, fiyat sosyal kart başlığına ve açıklamaya taşınır.
 * İlk ilan görseli Open Graph görseli olarak kullanılır.
 */
export function buildPropertyMetadata(property: Property): Metadata {
  const cover = property.images[0];

  return buildMetadata({
    title: property.title,
    socialTitle: `${property.title}, ${property.priceLabel}`,
    description: buildPropertyDescription(property),
    path: propertyPath(property.slug),
    image: cover ? { url: cover, alt: property.title } : defaultSeoImage,
    keywords: [
      listingTypeLabels[property.listingType],
      categoryLabels[property.category],
      property.district,
      property.city,
      ...siteConfig.keywords,
    ],
  });
}
