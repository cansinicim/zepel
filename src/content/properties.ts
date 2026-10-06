/**
 * Zepel Gayrimenkul, örnek ilan portföyü.
 *
 * NOT: Buradaki ilanlar demo amaçlı hazırlanmış temsili verilerdir.
 * Gerçek bir taşınmazı, sahibini veya fiyatını temsil etmez.
 * Görseller Unsplash üzerinden servis edilir.
 */

export type ListingType = "satilik" | "kiralik";

export type PropertyCategory =
  | "villa"
  | "rezidans"
  | "daire"
  | "yali"
  | "arsa"
  | "ofis";

export type Property = {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  /** 2, 3 cümlelik editoryal tanıtım metni */
  readonly description: string;
  /** Mahalle veya semt */
  readonly location: string;
  readonly city: string;
  readonly district: string;
  readonly listingType: ListingType;
  readonly category: PropertyCategory;
  /** Ham fiyat, TRY. Kiralık ilanlarda aylık bedeldir. */
  readonly price: number;
  /** Ekranda gösterilecek biçimlenmiş fiyat, örn "₺ 84.500.000" */
  readonly priceLabel: string;
  /** Kiralık ilanlarda fiyat periyodu */
  readonly pricePeriod?: "ay";
  readonly beds: number;
  readonly baths: number;
  /** Brüt kullanım alanı, m2 */
  readonly area: number;
  /** Arsa veya bahçe alanı, m2 */
  readonly plotArea?: number;
  /** Arsa ilanlarında bulunmaz */
  readonly buildYear?: number;
  readonly features: readonly string[];
  readonly images: readonly string[];
  readonly featured: boolean;
};

/** Unsplash görsel URL'i üretir, tüm ilanlarda aynı boyut ve kalite parametreleri kullanılır. */
const img = (photoId: string): string =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=2400&q=80`;

export const properties: readonly Property[] = [
  {
    id: "zpl-001",
    slug: "bebek-bogaz-manzarali-yali-dairesi",
    title: "Bebek'te Boğaz manzaralı yalı dairesi",
    description:
      "Bebek koyuna bakan tarihi bir yalının tamamı yenilenmiş orta katı. Salon cephesi baştan başa Boğaz'a açılıyor, akşam ışığı gün boyu takip edilebiliyor. Bina yönetimi güçlü, iskele kullanım hakkı daireye tanımlı.",
    location: "Bebek Mahallesi",
    city: "İstanbul",
    district: "Beşiktaş",
    listingType: "satilik",
    category: "daire",
    price: 285000000,
    priceLabel: "₺ 285.000.000",
    beds: 4,
    baths: 3,
    area: 310,
    buildYear: 1962,
    features: [
      "Kesintisiz Boğaz manzarası",
      "Ortak iskele kullanım hakkı",
      "Tam yenilenmiş ıslak hacimler",
      "Yerden ısıtma",
      "İki araçlık kapalı otopark",
      "24 saat güvenlik",
    ],
    images: [
      img("photo-1600585154340-be6161a56a0c"),
      img("photo-1600607687939-ce8a6c25118c"),
      img("photo-1600566753086-00f18fb6b3ea"),
      img("photo-1505873242700-f289a29e1e0f"),
    ],
    featured: true,
  },
  {
    id: "zpl-002",
    slug: "zekeriyakoy-orman-cephesi-villa",
    title: "Zekeriyaköy'de orman cepheli müstakil villa",
    description:
      "Site içinde, arkası doğrudan ormana bakan köşe parselde konumlu. Üç katlı yapı 2021'de tamamen elden geçirildi, bodrum kat sinema ve spor alanına dönüştürüldü. Bahçe olgun ağaçlarla kapalı, komşu görüşü yok.",
    location: "Zekeriyaköy",
    city: "İstanbul",
    district: "Sarıyer",
    listingType: "satilik",
    category: "villa",
    price: 92500000,
    priceLabel: "₺ 92.500.000",
    beds: 5,
    baths: 4,
    area: 520,
    plotArea: 1150,
    buildYear: 2009,
    features: [
      "Orman cepheli köşe parsel",
      "Özel havuz ve peyzajlı bahçe",
      "Akıllı ev sistemi",
      "Jeneratör ve su deposu",
      "Sinema odası",
      "Üç araçlık kapalı otopark",
      "Site içi güvenlik",
    ],
    images: [
      img("photo-1613490493576-7fde63acd811"),
      img("photo-1580587771525-78b9dba3b914"),
      img("photo-1600566753086-00f18fb6b3ea"),
      img("photo-1560448204-e02f11c3d0e2"),
    ],
    featured: true,
  },
  {
    id: "zpl-003",
    slug: "nisantasi-butik-rezidans-dairesi",
    title: "Nişantaşı'nda butik rezidans dairesi",
    description:
      "Toplam on iki daireli bir butik rezidansın üst katında, iki cepheli bir daire. Abdi İpekçi Caddesi yürüme mesafesinde, buna rağmen sokak sessiz. Concierge hizmeti bina bünyesinde veriliyor.",
    location: "Teşvikiye",
    city: "İstanbul",
    district: "Şişli",
    listingType: "satilik",
    category: "rezidans",
    price: 48750000,
    priceLabel: "₺ 48.750.000",
    beds: 3,
    baths: 2,
    area: 195,
    buildYear: 2018,
    features: [
      "Butik bina, on iki daire",
      "Concierge ve resepsiyon",
      "İki cepheli aydınlık plan",
      "Merkezi iklimlendirme",
      "Kapalı otopark",
      "Yangın ve deprem yönetmeliğine uygun yapı",
    ],
    images: [
      img("photo-1524758631624-e2822e304c36"),
      img("photo-1522708323590-d24dbb6b0267"),
      img("photo-1484154218962-a197022b5858"),
      img("photo-1505873242700-f289a29e1e0f"),
    ],
    featured: true,
  },
  {
    id: "zpl-004",
    slug: "atasehir-finans-merkezi-kiralik-ofis",
    title: "Ataşehir'de finans merkezinde kiralık ofis katı",
    description:
      "A sınıfı bir kulenin tam katı, bölünmemiş açık plan. Metro çıkışına yürüme mesafesinde, otoyol bağlantısı doğrudan. Kat, kurumsal kiracının plan tercihine göre teslim edilebiliyor.",
    location: "Barbaros Mahallesi",
    city: "İstanbul",
    district: "Ataşehir",
    listingType: "kiralik",
    category: "ofis",
    price: 1450000,
    priceLabel: "₺ 1.450.000 / ay",
    pricePeriod: "ay",
    beds: 0,
    baths: 4,
    area: 980,
    buildYear: 2016,
    features: [
      "A sınıfı kule, tam kat",
      "Bölünmemiş açık plan",
      "Raised floor ve kablolama altyapısı",
      "Jeneratör ve UPS desteği",
      "40 araçlık tahsisli otopark",
      "LEED sertifikalı bina",
    ],
    images: [
      img("photo-1497366811353-6870744d04b2"),
      img("photo-1497366754035-f200968a6e72"),
      img("photo-1524758631624-e2822e304c36"),
    ],
    featured: false,
  },
  {
    id: "zpl-005",
    slug: "beykoz-tarihi-yali",
    title: "Beykoz'da restore edilmiş tarihi yalı",
    description:
      "Anadolu yakasının sakin hattında, denize sıfır konumlu tescilli yalı. Restorasyon 2019'da kurul onayıyla tamamlandı, özgün ahşap detaylar korundu. Kendi iskelesi ve tekne bağlama hakkı var.",
    location: "Anadolu Hisarı hattı",
    city: "İstanbul",
    district: "Beykoz",
    listingType: "satilik",
    category: "yali",
    price: 410000000,
    priceLabel: "₺ 410.000.000",
    beds: 7,
    baths: 5,
    area: 740,
    plotArea: 1400,
    buildYear: 1897,
    features: [
      "Denize sıfır, özel iskele",
      "Kurul onaylı restorasyon",
      "Özgün ahşap işçilik",
      "Hamam ve kış bahçesi",
      "Müştemilat ve personel dairesi",
      "Beş araçlık otopark",
      "Tam güvenlik altyapısı",
    ],
    images: [
      img("photo-1523217582562-09d0def993a6"),
      img("photo-1512917774080-9991f1c4c750"),
      img("photo-1600607687939-ce8a6c25118c"),
      img("photo-1571003123894-1f0594d2b5d9"),
    ],
    featured: true,
  },
  {
    id: "zpl-006",
    slug: "bodrum-yalikavak-deniz-manzarali-villa",
    title: "Yalıkavak'ta deniz manzaralı taş villa",
    description:
      "Marinanın üst yamacında, üç taraftan denize bakan bağımsız villa. Yerel taş ve ahşap ağırlıklı mimari, iç mekânda modern bir kurguyla birleşiyor. Sonsuzluk havuzu gün batımı yönüne konumlandırılmış.",
    location: "Yalıkavak",
    city: "Muğla",
    district: "Bodrum",
    listingType: "satilik",
    category: "villa",
    price: 165000000,
    priceLabel: "₺ 165.000.000",
    beds: 5,
    baths: 5,
    area: 430,
    plotArea: 1800,
    buildYear: 2020,
    features: [
      "Kesintisiz deniz manzarası",
      "Sonsuzluk havuzu",
      "Akıllı ev sistemi",
      "Güneş enerjili sıcak su",
      "Misafir evi",
      "Marinaya beş dakika",
    ],
    images: [
      img("photo-1582610116397-edb318620f90"),
      img("photo-1571003123894-1f0594d2b5d9"),
      img("photo-1600596542815-ffad4c1539a9"),
      img("photo-1520250497591-112f2f40a3f4"),
    ],
    featured: true,
  },
  {
    id: "zpl-007",
    slug: "cesme-alacati-sezonluk-kiralik-villa",
    title: "Alaçatı'da sezonluk kiralık taş villa",
    description:
      "Taş sokaklara yürüme mesafesinde, yüksek duvarlarla çevrili özel bahçeli villa. Avlu, gün boyu gölge alacak şekilde kurgulanmış. Haziran ve eylül arası aylık dönemlerle kiralanıyor.",
    location: "Alaçatı",
    city: "İzmir",
    district: "Çeşme",
    listingType: "kiralik",
    category: "villa",
    price: 750000,
    priceLabel: "₺ 750.000 / ay",
    pricePeriod: "ay",
    beds: 4,
    baths: 4,
    area: 260,
    plotArea: 620,
    buildYear: 2017,
    features: [
      "Özel havuz ve gölgeli avlu",
      "Alaçatı merkeze yürüme mesafesi",
      "Tam donanımlı mutfak",
      "Haftalık temizlik hizmeti dahil",
      "Kapalı otopark",
      "Eşyalı teslim",
    ],
    images: [
      img("photo-1540541338287-41700207dee6"),
      img("photo-1507525428034-b723cf961d3e"),
      img("photo-1524758631624-e2822e304c36"),
    ],
    featured: false,
  },
  {
    id: "zpl-008",
    slug: "gocek-marina-rezidans-dairesi",
    title: "Göcek'te marina cepheli rezidans dairesi",
    description:
      "Marinaya bakan alçak katlı bir sitede, iki teraslı bahçe katı dairesi. Sabah kahvesi terasla, akşam yürüyüşü marina hattıyla tamamlanıyor. Site kendi plajına ve tekne bağlama kotasına sahip.",
    location: "Göcek merkez",
    city: "Muğla",
    district: "Fethiye",
    listingType: "satilik",
    category: "rezidans",
    price: 38500000,
    priceLabel: "₺ 38.500.000",
    beds: 3,
    baths: 3,
    area: 175,
    plotArea: 90,
    buildYear: 2015,
    features: [
      "Marina manzarası",
      "İki adet özel teras",
      "Site içi plaj ve havuz",
      "Tekne bağlama kotası",
      "Kapalı otopark",
      "Yıl boyu site yönetimi",
    ],
    images: [
      img("photo-1600047509807-ba8f99d2cdde"),
      img("photo-1600566753086-00f18fb6b3ea"),
      img("photo-1600607687939-ce8a6c25118c"),
    ],
    featured: false,
  },
  {
    id: "zpl-009",
    slug: "kas-deniz-manzarali-imarli-arsa",
    title: "Kaş'ta deniz manzaralı imarlı arsa",
    description:
      "Meis adasına bakan yamaçta, konut imarlı tek parsel. Yol, elektrik ve su altyapısı parsele kadar getirilmiş. Yaklaşık 400 m2 inşaat hakkı bulunuyor, mimari ön çalışma dosyada mevcut.",
    location: "Çukurbağ Yarımadası",
    city: "Antalya",
    district: "Kaş",
    listingType: "satilik",
    category: "arsa",
    price: 34500000,
    priceLabel: "₺ 34.500.000",
    beds: 0,
    baths: 0,
    area: 2400,
    plotArea: 2400,
    features: [
      "Konut imarlı tek parsel",
      "Meis adası ve deniz manzarası",
      "Yol, elektrik ve su parselde",
      "Yaklaşık 400 m2 inşaat hakkı",
      "Mimari ön proje dosyada",
      "Kaş merkeze on dakika",
    ],
    images: [
      img("photo-1507525428034-b723cf961d3e"),
      img("photo-1506905925346-21bda4d32df4"),
      img("photo-1540541338287-41700207dee6"),
    ],
    featured: false,
  },
  {
    id: "zpl-010",
    slug: "sapanca-gol-manzarali-villa",
    title: "Sapanca'da göl manzaralı müstakil villa",
    description:
      "Göl hattına bakan yamaçta, ormanla komşu tek parsel villa. İstanbul'a otoyolla bir saat, hafta sonu kullanımına ve uzaktan çalışmaya uygun. Isıtma altyapısı yıl boyu kullanım için kurgulanmış.",
    location: "Kırkpınar",
    city: "Sakarya",
    district: "Sapanca",
    listingType: "satilik",
    category: "villa",
    price: 42000000,
    priceLabel: "₺ 42.000.000",
    beds: 4,
    baths: 3,
    area: 340,
    plotArea: 1600,
    buildYear: 2019,
    features: [
      "Göl ve orman manzarası",
      "Kapalı ısıtmalı havuz",
      "Şömineli yaşam alanı",
      "Yerden ısıtma ve doğalgaz",
      "Fiber internet altyapısı",
      "İstanbul'a bir saat",
    ],
    images: [
      img("photo-1568605114967-8130f3a36994"),
      img("photo-1506905925346-21bda4d32df4"),
      img("photo-1600607687939-ce8a6c25118c"),
    ],
    featured: false,
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Türetilmiş veriler ve yardımcılar                                          */
/* -------------------------------------------------------------------------- */

export const featuredProperties: readonly Property[] = properties.filter(
  (property) => property.featured,
);

export function getPropertyBySlug(slug: string): Property | undefined {
  return properties.find((property) => property.slug === slug);
}

/**
 * Bir ilana en yakın diğer ilanlar.
 * Öncelik sırası: aynı kategori, sonra aynı şehir, sonra kalan portföy.
 */
export function getRelatedProperties(
  slug: string,
  limit = 3,
): readonly Property[] {
  const current = getPropertyBySlug(slug);
  if (!current) return [];

  const others = properties.filter((property) => property.slug !== slug);

  const score = (property: Property): number => {
    if (property.category === current.category) return 0;
    if (property.city === current.city) return 1;
    return 2;
  };

  return [...others].sort((a, b) => score(a) - score(b)).slice(0, limit);
}

export type FilterOption<TValue extends string = string> = {
  readonly value: TValue;
  readonly label: string;
  readonly count: number;
};

/**
 * Sayaç üretici. `items` parametre olarak verilir, böylece hem demo diziden
 * hem de veritabanından okunan gerçek ilan listesinden filtre seçenekleri
 * türetilebilir; sabit `properties` dizisine bağlı kalınmaz.
 */
const countBy = <TValue extends string>(
  items: readonly Property[],
  values: readonly TValue[],
  predicate: (property: Property, value: TValue) => boolean,
): Record<TValue, number> =>
  values.reduce(
    (acc, value) => {
      acc[value] = items.filter((property) => predicate(property, value)).length;
      return acc;
    },
    {} as Record<TValue, number>,
  );

const CATEGORY_LABELS: Record<PropertyCategory, string> = {
  villa: "Villa",
  rezidans: "Rezidans",
  daire: "Daire",
  yali: "Yalı",
  arsa: "Arsa",
  ofis: "Ofis",
};

const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  satilik: "Satılık",
  kiralik: "Kiralık",
};

const CATEGORY_ORDER: readonly PropertyCategory[] = [
  "villa",
  "yali",
  "rezidans",
  "daire",
  "arsa",
  "ofis",
];

const LISTING_TYPE_ORDER: readonly ListingType[] = ["satilik", "kiralik"];

/**
 * Kategori filtre seçenekleri, yalnızca verilen ilan kümesinde karşılığı
 * olan kategoriler. `items` verilmezse demo dizi kullanılır (geriye dönük
 * uyumluluk için); genel sitede gerçek ilanlar bu parametreyle geçirilir.
 */
export function buildCategoryFilters(
  items: readonly Property[] = properties,
): readonly FilterOption<PropertyCategory>[] {
  const counts = countBy(
    items,
    CATEGORY_ORDER,
    (property, value) => property.category === value,
  );

  return CATEGORY_ORDER.filter((category) => counts[category] > 0).map((category) => ({
    value: category,
    label: CATEGORY_LABELS[category],
    count: counts[category],
  }));
}

/** İlan tipi filtre seçenekleri. Bkz. {@link buildCategoryFilters}. */
export function buildListingTypeFilters(
  items: readonly Property[] = properties,
): readonly FilterOption<ListingType>[] {
  const counts = countBy(
    items,
    LISTING_TYPE_ORDER,
    (property, value) => property.listingType === value,
  );

  return LISTING_TYPE_ORDER.map((listingType) => ({
    value: listingType,
    label: LISTING_TYPE_LABELS[listingType],
    count: counts[listingType],
  }));
}

/**
 * İlçe filtre seçenekleri, verilen ilan kümesinden türetilir ve alfabetik
 * sıralanır. Bkz. {@link buildCategoryFilters}.
 */
export function buildDistrictFilters(
  items: readonly Property[] = properties,
): readonly FilterOption[] {
  return Array.from(new Set(items.map((property) => property.district)))
    .sort((a, b) => a.localeCompare(b, "tr-TR"))
    .map((district) => ({
      value: district,
      label: district,
      count: items.filter((property) => property.district === district).length,
    }));
}

/** Demo diziden türetilmiş varsayılan filtre seçenekleri. */
export const categoryFilters: readonly FilterOption<PropertyCategory>[] =
  buildCategoryFilters();
export const listingTypeFilters: readonly FilterOption<ListingType>[] =
  buildListingTypeFilters();
export const districtFilters: readonly FilterOption[] = buildDistrictFilters();

export const categoryLabels = CATEGORY_LABELS;
export const listingTypeLabels = LISTING_TYPE_LABELS;

/** Rota üretimi ve statik sayfa oluşturma için tüm ilan slug'ları. */
export const propertySlugs: readonly string[] = properties.map(
  (property) => property.slug,
);
