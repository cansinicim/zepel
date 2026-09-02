/**
 * Zepel Gayrimenkul, sinematik kaydırma bölümü içeriği.
 *
 * Anlatı yayı: konum keşfi, mimari, yaşam, yatırım ve Zepel ile kapanış.
 * Her adım tam ekran bir arka plan görseline ve üzerine gelen kısa metne karşılık gelir.
 * Adım sırası dizideki sıradır, UI katmanı bunu yeniden sıralamamalıdır.
 */

export type ScrollStoryStat = {
  readonly value: string;
  readonly label: string;
};

export type ScrollStoryStep = {
  readonly id: string;
  /** Tam ekran arka plan görseli */
  readonly image: string;
  readonly imageAlt: string;
  /** Üst etiket, örn "01 / Keşif" */
  readonly eyebrow: string;
  /** Büyük başlık, 3 ile 5 kelime */
  readonly title: string;
  readonly body: string;
  readonly stat?: ScrollStoryStat;
};

export type ScrollStoryContent = {
  readonly sectionEyebrow: string;
  readonly sectionTitle: string;
  readonly steps: readonly ScrollStoryStep[];
  readonly outroCtaLabel: string;
  readonly outroCtaHref: string;
};

const img = (photoId: string): string =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=2400&q=80`;

export const scrollStorySteps: readonly ScrollStoryStep[] = [
  {
    id: "kesif",
    image: img("photo-1541432901042-2d8bd64b4a9b"),
    imageAlt: "Akşam ışığında İstanbul'un tarihi silueti",
    eyebrow: "01 / Keşif",
    title: "Önce konum konuşur",
    body: "Bir mülkün değerini binadan önce sokak belirler. Ulaşım, komşuluk ve gelişim yönü, on yıl sonrasını bugünden yazar.",
    stat: {
      value: "28",
      label: "Düzenli takip ettiğimiz ilçe",
    },
  },
  {
    id: "mimari",
    image: img("photo-1600585154340-be6161a56a0c"),
    imageAlt: "Modern bir konutun geniş camlı cephesi",
    eyebrow: "02 / Mimari",
    title: "Yapı, zamana dayanmalı",
    body: "Cephe değil, taşıyıcı sistem ve malzeme kalıcıdır. Portföye aldığımız her yapının teknik dosyasını yerinde inceleriz.",
    stat: {
      value: "%18",
      label: "İncelenen mülklerin portföye giriş oranı",
    },
  },
  {
    id: "yasam",
    image: img("photo-1600607687939-ce8a6c25118c"),
    imageAlt: "Doğal ışıkla aydınlanan geniş bir oturma alanı",
    eyebrow: "03 / Yaşam",
    title: "Plan, günlük hayatı taşır",
    body: "Metrekare tek başına bir şey söylemez. Işığın yönü, sirkülasyon ve sessizlik, evde geçen her günü belirler.",
  },
  {
    id: "yatirim",
    image: img("photo-1580587771525-78b9dba3b914"),
    imageAlt: "Havuzu ve geniş cam yüzeyleriyle modern bir konut",
    eyebrow: "04 / Yatırım",
    title: "Getiri, veriyle hesaplanır",
    body: "Kira çarpanı, likidite ve çıkış süresi baştan konuşulur. Beklentiyi rakamla kurarız, sonradan düzeltmeye çalışmayız.",
    stat: {
      value: "₺ 12,4 milyar",
      label: "Yönetilen portföy değeri",
    },
  },
  {
    id: "zepel",
    image: img("photo-1613490493576-7fde63acd811"),
    imageAlt: "Havuzu ve peyzajlı bahçesiyle bir lüks villa",
    eyebrow: "05 / Zepel",
    title: "Kararı birlikte veririz",
    body: "Sunumdan tapuya kadar tek danışman, tek takvim. Doğru mülk çıkmadıysa bekleriz, satmak için acele etmeyiz.",
    stat: {
      value: "17 yıl",
      label: "Kesintisiz saha deneyimi",
    },
  },
] as const;

export const scrollStory: ScrollStoryContent = {
  sectionEyebrow: "Zepel yaklaşımı",
  sectionTitle: "Bir mülkü değerlendirirken izlediğimiz beş kademe.",
  steps: scrollStorySteps,
  outroCtaLabel: "Portföyü görüntüle",
  outroCtaHref: "/portfoy",
} as const;
