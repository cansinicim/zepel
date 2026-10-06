import type { ListingType, PropertyCategory } from "@/content/properties";
import type { Listing, ListingInput } from "@/lib/db/types";
import type { ParsedListing } from "@/lib/import/types";

import { safeHttpUrl } from "./contact-links";

/**
 * İlan formunun saf sözleşmesi: alan adları, doğrulama ve dönüşümler.
 *
 * Sunucuya özgü hiçbir şey içermez; hem Server Action hem de istemci bileşeni
 * aynı tipleri paylaşır. Formdan gelen her değer burada doğrulanır, doğrulama
 * istemcideki `required` gibi özniteliklere bırakılmaz.
 */

export const LISTING_FIELD_NAMES = [
  "title",
  "description",
  "city",
  "district",
  "location",
  "listingType",
  "category",
  "price",
  "beds",
  "baths",
  "area",
  "plotArea",
  "buildYear",
  "features",
  "images",
  "featured",
  "sourceUrl",
] as const;

export type ListingFormField = (typeof LISTING_FIELD_NAMES)[number];

/** Formun ham hali. Tüm değerler metindir, dönüşüm tek noktada yapılır. */
export type ListingFormValues = Record<ListingFormField, string>;

export type ListingFieldErrors = Partial<Record<ListingFormField, string>>;

/** Onay kutusunun işaretli halinde taşıdığı değer. */
export const CHECKED = "1";

export const LISTING_TYPE_VALUES = [
  "satilik",
  "kiralik",
] as const satisfies readonly ListingType[];

export const CATEGORY_VALUES = [
  "villa",
  "rezidans",
  "daire",
  "yali",
  "arsa",
  "ofis",
] as const satisfies readonly PropertyCategory[];

/** Sınırlar tek yerde toplanır, bileşenlerde sabit değer yazılmaz. */
export const LISTING_LIMITS = {
  titleMin: 3,
  titleMax: 160,
  descriptionMax: 4000,
  shortTextMax: 120,
  priceMax: 1_000_000_000_000,
  areaMax: 1_000_000,
  roomsMax: 100,
  buildYearMin: 1800,
  buildYearMax: 2100,
  featuresMax: 40,
  featureLengthMax: 160,
  imagesMax: 24,
  urlMax: 2048,
} as const;

const ERRORS = {
  required: "Bu alan zorunlu.",
  titleLength: `Başlık ${LISTING_LIMITS.titleMin} ile ${LISTING_LIMITS.titleMax} karakter arasında olmalı.`,
  descriptionLength: `Açıklama en fazla ${LISTING_LIMITS.descriptionMax} karakter olabilir.`,
  shortTextLength: `En fazla ${LISTING_LIMITS.shortTextMax} karakter olabilir.`,
  listingType: "Geçerli bir ilan tipi seçin.",
  category: "Geçerli bir kategori seçin.",
  number: "Yalnızca sayı girin, örnek: 12500000",
  priceRange: "Fiyat 0 ile 1.000.000.000.000 arasında olmalı.",
  areaRange: `Alan 0 ile ${LISTING_LIMITS.areaMax} arasında olmalı.`,
  roomsRange: `En fazla ${LISTING_LIMITS.roomsMax} olabilir.`,
  buildYearRange: `Yapım yılı ${LISTING_LIMITS.buildYearMin} ile ${LISTING_LIMITS.buildYearMax} arasında olmalı.`,
  featuresCount: `En fazla ${LISTING_LIMITS.featuresMax} nitelik girebilirsiniz.`,
  featureLength: `Her nitelik en fazla ${LISTING_LIMITS.featureLengthMax} karakter olabilir.`,
  imagesCount: `En fazla ${LISTING_LIMITS.imagesMax} görsel girebilirsiniz.`,
  imageUrl: "Görsel adresleri http veya https ile başlamalı, her satıra bir adres yazın.",
  sourceUrl: "Kaynak adresi http veya https ile başlamalı.",
} as const;

/** Boş form. Yeni kayıt ve sıfırlama için tek başlangıç noktası. */
export const EMPTY_LISTING_FORM: ListingFormValues = {
  title: "",
  description: "",
  city: "",
  district: "",
  location: "",
  listingType: "satilik",
  category: "daire",
  price: "",
  beds: "",
  baths: "",
  area: "",
  plotArea: "",
  buildYear: "",
  features: "",
  images: "",
  featured: "",
  sourceUrl: "",
};

/* -------------------------------------------------------------------------- */
/* Okuma                                                                       */
/* -------------------------------------------------------------------------- */

/** FormData'yı kırpılmış metin alanlarına indirger. */
export function readListingForm(formData: FormData): ListingFormValues {
  const read = (name: ListingFormField): string => {
    const value = formData.get(name);
    return typeof value === "string" ? value.trim() : "";
  };

  const values = {} as Record<ListingFormField, string>;
  for (const name of LISTING_FIELD_NAMES) {
    values[name] = read(name);
  }

  // Onay kutusu işaretli değilse tarayıcı alanı hiç göndermez.
  values.featured = values.featured.length > 0 ? CHECKED : "";

  return values;
}

/** Satır satır yazılmış listeyi diziye çevirir, boş satırları atar. */
export function parseLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/** Diziyi satır satır metne çevirir. */
export function toLines(values: readonly string[]): string {
  return values.join("\n");
}

/**
 * Sayı girdisini tam sayıya çevirir.
 * Binlik ayracı olarak nokta ve boşluk kabul edilir ("12.500.000").
 * Bunun dışında rakam olmayan bir karakter varsa girdi geçersizdir.
 */
export function parseIntegerInput(raw: string): number | null {
  const cleaned = raw.replace(/[.\s ]/g, "");
  return /^\d+$/.test(cleaned) ? Number(cleaned) : null;
}

/* -------------------------------------------------------------------------- */
/* Doğrulama                                                                   */
/* -------------------------------------------------------------------------- */

/** Alan bazlı doğrulama. Boş nesne dönerse form geçerlidir. */
export function validateListingForm(
  values: ListingFormValues,
): ListingFieldErrors {
  const errors: ListingFieldErrors = {};

  if (values.title.length === 0) {
    errors.title = ERRORS.required;
  } else if (
    values.title.length < LISTING_LIMITS.titleMin ||
    values.title.length > LISTING_LIMITS.titleMax
  ) {
    errors.title = ERRORS.titleLength;
  }

  if (values.description.length > LISTING_LIMITS.descriptionMax) {
    errors.description = ERRORS.descriptionLength;
  }

  for (const field of ["city", "district", "location"] as const) {
    if (values[field].length > LISTING_LIMITS.shortTextMax) {
      errors[field] = ERRORS.shortTextLength;
    }
  }

  if (!isListingType(values.listingType)) {
    errors.listingType = ERRORS.listingType;
  }

  if (!isCategory(values.category)) {
    errors.category = ERRORS.category;
  }

  if (values.price.length === 0) {
    errors.price = ERRORS.required;
  } else {
    const price = parseIntegerInput(values.price);
    if (price === null) {
      errors.price = ERRORS.number;
    } else if (price > LISTING_LIMITS.priceMax) {
      errors.price = ERRORS.priceRange;
    }
  }

  for (const field of ["beds", "baths"] as const) {
    const error = validateOptionalNumber(
      values[field],
      LISTING_LIMITS.roomsMax,
      ERRORS.roomsRange,
    );
    if (error !== null) errors[field] = error;
  }

  for (const field of ["area", "plotArea"] as const) {
    const error = validateOptionalNumber(
      values[field],
      LISTING_LIMITS.areaMax,
      ERRORS.areaRange,
    );
    if (error !== null) errors[field] = error;
  }

  if (values.buildYear.length > 0) {
    const year = parseIntegerInput(values.buildYear);
    if (year === null) {
      errors.buildYear = ERRORS.number;
    } else if (
      year < LISTING_LIMITS.buildYearMin ||
      year > LISTING_LIMITS.buildYearMax
    ) {
      errors.buildYear = ERRORS.buildYearRange;
    }
  }

  const features = parseLines(values.features);
  if (features.length > LISTING_LIMITS.featuresMax) {
    errors.features = ERRORS.featuresCount;
  } else if (
    features.some((feature) => feature.length > LISTING_LIMITS.featureLengthMax)
  ) {
    errors.features = ERRORS.featureLength;
  }

  const images = parseLines(values.images);
  if (images.length > LISTING_LIMITS.imagesMax) {
    errors.images = ERRORS.imagesCount;
  } else if (images.some((image) => safeHttpUrl(image) === null)) {
    errors.images = ERRORS.imageUrl;
  }

  if (values.sourceUrl.length > 0 && safeHttpUrl(values.sourceUrl) === null) {
    errors.sourceUrl = ERRORS.sourceUrl;
  }

  return errors;
}

function validateOptionalNumber(
  raw: string,
  max: number,
  rangeMessage: string,
): string | null {
  if (raw.length === 0) return null;

  const value = parseIntegerInput(raw);
  if (value === null) return ERRORS.number;

  return value > max ? rangeMessage : null;
}

export function isListingType(value: string): value is ListingType {
  return (LISTING_TYPE_VALUES as readonly string[]).includes(value);
}

export function isCategory(value: string): value is PropertyCategory {
  return (CATEGORY_VALUES as readonly string[]).includes(value);
}

/* -------------------------------------------------------------------------- */
/* Dönüşüm                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Doğrulanmış formu veri katmanının girdi tipine çevirir.
 * Yalnızca `validateListingForm` boş döndükten sonra çağrılmalıdır.
 */
export function toListingInput(values: ListingFormValues): ListingInput {
  const optionalNumber = (raw: string): number | null =>
    raw.length === 0 ? null : parseIntegerInput(raw);

  return {
    title: values.title,
    description: values.description,
    location: values.location,
    city: values.city,
    district: values.district,
    listingType: isListingType(values.listingType) ? values.listingType : "satilik",
    category: isCategory(values.category) ? values.category : "daire",
    price: parseIntegerInput(values.price) ?? 0,
    beds: optionalNumber(values.beds) ?? 0,
    baths: optionalNumber(values.baths) ?? 0,
    area: optionalNumber(values.area) ?? 0,
    plotArea: optionalNumber(values.plotArea),
    buildYear: optionalNumber(values.buildYear),
    features: parseLines(values.features),
    images: parseLines(values.images),
    featured: values.featured === CHECKED,
    sourceUrl: values.sourceUrl.length > 0 ? values.sourceUrl : null,
  };
}

/** Kayıtlı ilanı forma doldurur. */
export function fromListing(listing: Listing): ListingFormValues {
  const optional = (value: number | undefined): string =>
    value === undefined ? "" : String(value);

  return {
    title: listing.title,
    description: listing.description,
    city: listing.city,
    district: listing.district,
    location: listing.location,
    listingType: listing.listingType,
    category: listing.category,
    price: String(listing.price),
    beds: String(listing.beds),
    baths: String(listing.baths),
    area: String(listing.area),
    plotArea: optional(listing.plotArea),
    buildYear: optional(listing.buildYear),
    features: toLines(listing.features),
    images: toLines(listing.images),
    featured: listing.featured ? CHECKED : "",
    sourceUrl: listing.sourceUrl ?? "",
  };
}

/**
 * Ayrıştırıcıdan gelen ilanı forma doldurur.
 *
 * Ayrıştırıcı hiçbir alanı garanti etmez; bulunamayan alanlar boş kalır ve
 * yönetici panelde tamamlar. Hiçbir değer doğrudan kaydedilmez, önce
 * `validateListingForm` süzgecinden geçer.
 */
export function fromParsedListing(parsed: ParsedListing): ListingFormValues {
  const optional = (value: number | undefined): string =>
    value === undefined ? "" : String(Math.max(0, Math.trunc(value)));

  return {
    title: parsed.title ?? "",
    description: parsed.description ?? "",
    city: parsed.city ?? "",
    district: parsed.district ?? "",
    location: parsed.location ?? "",
    listingType:
      parsed.listingType !== undefined && isListingType(parsed.listingType)
        ? parsed.listingType
        : EMPTY_LISTING_FORM.listingType,
    category:
      parsed.category !== undefined && isCategory(parsed.category)
        ? parsed.category
        : EMPTY_LISTING_FORM.category,
    price: optional(parsed.price),
    beds: optional(parsed.beds),
    baths: optional(parsed.baths),
    area: optional(parsed.area),
    plotArea: optional(parsed.plotArea),
    buildYear: optional(parsed.buildYear),
    features: toLines(parsed.features ?? []),
    images: toLines((parsed.images ?? []).filter((url) => safeHttpUrl(url) !== null)),
    featured: "",
    sourceUrl: parsed.sourceUrl ?? "",
  };
}
