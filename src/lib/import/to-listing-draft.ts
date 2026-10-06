/**
 * Ayrıştırılmış ilan verisini veritabanı taslağına çevirir.
 *
 * Bu modül, bilinçli olarak birbirinden bağımsız tutulan iki tarafı birleştiren
 * tek noktadır: `src/lib/import` sözleşmesi (`ParsedListing`) ile veri katmanı
 * sözleşmesi (`ListingInput`). Ayrıştırıcı veritabanını, veri katmanı da
 * ayrıştırıcıyı tanımaz; köprü burada durur.
 *
 * Kural: eksik veriyi uydurmaz. Zorunlu bir alan yoksa taslak üretilmez ve
 * hangi alanların eksik olduğu geri bildirilir; yönetici paneli bunları elle
 * doldurtur. Sessizce varsayılan atamak, yanlış fiyat veya yanlış kategoriyle
 * ilan yayınlanmasına yol açardı.
 */

import type { ListingInput } from "@/lib/db/types";
import type { ParsedListing } from "@/lib/import/types";

/** Panelde gösterilecek okunabilir alan adları. */
const FIELD_LABELS: Record<string, string> = {
  title: "Başlık",
  price: "Fiyat",
  listingType: "İlan tipi",
  category: "Mülk tipi",
};

export type ListingDraftResult = {
  /** Zorunlu alanlar tamamsa taslak girdisi, değilse null. */
  readonly input: ListingInput | null;
  /** Eksik zorunlu alanların okunabilir adları. */
  readonly missing: readonly string[];
  /** Taslağa alınmayan veriler hakkında bilgilendirme. */
  readonly notes: readonly string[];
};

/** Metni kırpar, boşsa undefined döndürür. Boş metin veritabanına yazılmaz. */
function text(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

/** Sayıyı doğrular: sonlu, negatif olmayan ve makul üst sınırın altında. */
function positive(value: number | undefined, max: number): number | undefined {
  if (value === undefined || !Number.isFinite(value)) return undefined;
  if (value < 0 || value > max) return undefined;
  return Math.round(value);
}

export function toListingDraft(parsed: ParsedListing): ListingDraftResult {
  const missing: string[] = [];
  const notes: string[] = [];

  const title = text(parsed.title);
  if (!title) missing.push(FIELD_LABELS.title);

  const price = positive(parsed.price, 100_000_000_000);
  if (price === undefined || price === 0) missing.push(FIELD_LABELS.price);

  if (!parsed.listingType) missing.push(FIELD_LABELS.listingType);
  if (!parsed.category) missing.push(FIELD_LABELS.category);

  /**
   * Para birimi TRY dışındaysa fiyatı taşımayız. Kur çevirisi yapmak, kurun
   * hangi güne ait olduğu belirsiz olduğu için yanlış fiyat üretir.
   */
  const currency = parsed.currency?.toUpperCase();
  if (currency && currency !== "TRY") {
    notes.push(
      `Kaynak fiyat ${currency} cinsinden görünüyor. Fiyatı TRY olarak elle girin.`,
    );
    if (!missing.includes(FIELD_LABELS.price)) missing.push(FIELD_LABELS.price);
  }

  if (missing.length > 0) {
    return { input: null, missing, notes };
  }

  const images = (parsed.images ?? []).filter((url) =>
    url.startsWith("https://"),
  );
  if ((parsed.images?.length ?? 0) > images.length) {
    notes.push("Güvenli olmayan bazı görsel adresleri taslağa alınmadı.");
  }

  return {
    input: {
      // Yukarıdaki kontroller geçtiği için bu alanların dolu olduğu kesindir.
      title: title as string,
      price: price as number,
      listingType: parsed.listingType as NonNullable<ParsedListing["listingType"]>,
      category: parsed.category as NonNullable<ParsedListing["category"]>,
      description: text(parsed.description),
      location: text(parsed.location),
      city: text(parsed.city),
      district: text(parsed.district),
      beds: positive(parsed.beds, 100),
      baths: positive(parsed.baths, 100),
      area: positive(parsed.area, 1_000_000),
      plotArea: positive(parsed.plotArea, 100_000_000) ?? null,
      buildYear: positive(parsed.buildYear, new Date().getFullYear() + 5) ?? null,
      features: parsed.features?.map((item) => item.trim()).filter(Boolean) ?? [],
      images,
      // İçe aktarılan ilan asla doğrudan öne çıkarılmaz, bu yönetici kararıdır.
      featured: false,
      sourceUrl: text(parsed.sourceUrl) ?? null,
    },
    missing,
    notes,
  };
}
