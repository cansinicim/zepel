/**
 * Zepel Gayrimenkul, sayfa seviyesi metinler ve arayüz etiketleri.
 *
 * `sections.ts` bölüm içeriğini, bu dosya ise sayfa başlıklarını, filtre ve
 * galeri gibi arayüz parçalarının etiketlerini taşır. Bileşenler metni
 * buradan okur, kendi içinde yazmaz.
 */

import type { CallToAction, SectionMedia } from "@/content/sections";

/** Alt sayfaların üst bloğu: etiket, h1 başlık ve giriş metni. */
export type PageIntro = {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
};

/* -------------------------------------------------------------------------- */
/* Gezinme ve iskelet                                                         */
/* -------------------------------------------------------------------------- */

export type NavigationContent = {
  readonly skipToContent: string;
  readonly brandLabel: string;
  readonly brandWordmark: string;
  readonly homeLinkLabel: string;
  readonly primaryNavLabel: string;
  readonly mobileNavLabel: string;
  readonly footerNavLabel: string;
  readonly legalNavLabel: string;
  readonly socialNavLabel: string;
  readonly openMenuLabel: string;
  readonly closeMenuLabel: string;
  readonly callLabel: string;
  readonly cta: CallToAction;
};

export const navigation: NavigationContent = {
  skipToContent: "İçeriğe geç",
  brandLabel: "Zepel Gayrimenkul",
  brandWordmark: "Zepel",
  homeLinkLabel: "Zepel Gayrimenkul anasayfası",
  primaryNavLabel: "Ana menü",
  mobileNavLabel: "Mobil menü",
  footerNavLabel: "Alt bilgi menüsü",
  legalNavLabel: "Yasal bilgiler",
  socialNavLabel: "Sosyal medya hesaplarımız",
  openMenuLabel: "Menüyü aç",
  closeMenuLabel: "Menüyü kapat",
  callLabel: "Bizi arayın",
  cta: { label: "Görüşme talebi", href: "/iletisim" },
} as const;

/* -------------------------------------------------------------------------- */
/* Anasayfa, kapanış çağrısı                                                  */
/* -------------------------------------------------------------------------- */

export type ContactCtaContent = {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly primaryCta: CallToAction;
  readonly secondaryCtaPrefix: string;
  readonly media: SectionMedia;
};

export const contactCta: ContactCtaContent = {
  eyebrow: "Bir sonraki adım",
  title: "Aradığınız mülkü konuşalım.",
  description:
    "Portföyümüzün tamamı sitede yayınlanmaz. Ne aradığınızı anlattığınızda, listelenmemiş seçenekleri de masaya koyarız.",
  primaryCta: { label: "Görüşme talebi bırakın", href: "/iletisim" },
  secondaryCtaPrefix: "Ya da doğrudan arayın",
  media: {
    src: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=2400&q=80",
    alt: "Gün batımında denize bakan bir terasın gölgelikleri",
  },
} as const;

/* -------------------------------------------------------------------------- */
/* Anasayfa, öne çıkan portföy                                                */
/* -------------------------------------------------------------------------- */

export type FeaturedPortfolioContent = {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly cta: CallToAction;
};

export const featuredPortfolio: FeaturedPortfolioContent = {
  eyebrow: "Öne çıkan portföy",
  title: "Şu anda masamızda olanlar.",
  description:
    "Portföyün tamamı değil, bu ay öne çıkardığımız mülkler. Her biri yerinde incelendi ve tapu kaydı kontrol edildi.",
  cta: { label: "Tüm portföyü görüntüle", href: "/portfoy" },
} as const;

/* -------------------------------------------------------------------------- */
/* Portföy sayfası                                                            */
/* -------------------------------------------------------------------------- */

export type PortfolioFilterLabels = {
  readonly groupLabel: string;
  readonly listingType: string;
  readonly category: string;
  readonly district: string;
  readonly all: string;
  readonly reset: string;
};

export type PortfolioPageContent = {
  readonly intro: PageIntro;
  readonly filters: PortfolioFilterLabels;
  readonly resultsLabel: string;
  /** Sonuç sayısından sonra gelen metin, örn "12 ilan listeleniyor". */
  readonly resultsSuffix: string;
  readonly emptyTitle: string;
  readonly emptyDescription: string;
};

export const portfolioPage: PortfolioPageContent = {
  intro: {
    eyebrow: "Portföy",
    title: "Yayındaki mülkler.",
    description:
      "Her ilan, portföye alınmadan önce yerinde incelenir ve tapu kaydı kontrol edilir. Aradığınızı bulamazsanız listelenmemiş seçenekler için bize yazın.",
  },
  filters: {
    groupLabel: "Portföy filtreleri",
    listingType: "İlan tipi",
    category: "Mülk tipi",
    district: "İlçe",
    all: "Tümü",
    reset: "Filtreleri temizle",
  },
  resultsLabel: "Sonuçlar",
  resultsSuffix: "ilan listeleniyor",
  emptyTitle: "Bu filtrelerle eşleşen ilan yok.",
  emptyDescription:
    "Filtreleri temizleyip yeniden deneyin. Aradığınız mülk portföyde görünmüyorsa bizi arayın, yayınlanmamış dosyalarımızı birlikte gözden geçirelim.",
} as const;

/* -------------------------------------------------------------------------- */
/* İlan detay sayfası                                                         */
/* -------------------------------------------------------------------------- */

export type PropertySpecLabels = {
  readonly beds: string;
  readonly baths: string;
  readonly area: string;
  readonly plotArea: string;
  readonly buildYear: string;
};

export type PropertyDetailContent = {
  readonly backLabel: string;
  readonly galleryLabel: string;
  readonly galleryThumbsLabel: string;
  /** Küçük görsel butonu etiketi, sıra numarası sonuna eklenir. */
  readonly galleryThumbPrefix: string;
  readonly galleryPrevLabel: string;
  readonly galleryNextLabel: string;
  readonly specsTitle: string;
  readonly specLabels: PropertySpecLabels;
  readonly areaUnit: string;
  readonly roomUnit: string;
  readonly descriptionTitle: string;
  readonly featuresTitle: string;
  readonly ctaTitle: string;
  readonly ctaDescription: string;
  readonly ctaPrimary: CallToAction;
  readonly relatedEyebrow: string;
  readonly relatedTitle: string;
};

export const propertyDetail: PropertyDetailContent = {
  backLabel: "Tüm portföy",
  galleryLabel: "Mülk görselleri",
  galleryThumbsLabel: "Görsel seçimi",
  galleryThumbPrefix: "Görsel",
  galleryPrevLabel: "Önceki görsel",
  galleryNextLabel: "Sonraki görsel",
  specsTitle: "Künye",
  specLabels: {
    beds: "Oda",
    baths: "Banyo",
    area: "Brüt alan",
    plotArea: "Arsa alanı",
    buildYear: "Yapım yılı",
  },
  areaUnit: "m²",
  roomUnit: "adet",
  descriptionTitle: "Mülk hakkında",
  featuresTitle: "Öne çıkan nitelikler",
  ctaTitle: "Bu mülkü yerinde görün.",
  ctaDescription:
    "Randevu oluşturalım, mülkü birlikte gezelim. Tapu, imar ve gider dosyasını görüşme öncesinde paylaşırız.",
  ctaPrimary: { label: "Randevu talep edin", href: "/iletisim" },
  relatedEyebrow: "Portföyden",
  relatedTitle: "Benzer ilanlar",
} as const;

/* -------------------------------------------------------------------------- */
/* Hizmetler sayfası                                                          */
/* -------------------------------------------------------------------------- */

export type ServicesPageContent = {
  readonly intro: PageIntro;
  readonly detailsLabel: string;
};

export const servicesPage: ServicesPageContent = {
  intro: {
    eyebrow: "Hizmetler",
    title: "Ne yaptığımız, nasıl yaptığımızla ölçülür.",
    description:
      "Altı hizmet alanının tamamını aynı ekip yürütür. Aşağıda her hizmetin kapsamı ve size ne teslim ettiğimiz maddeler halinde yazılıdır.",
  },
  detailsLabel: "Kapsam",
} as const;

/* -------------------------------------------------------------------------- */
/* İletişim sayfası                                                           */
/* -------------------------------------------------------------------------- */

export type ContactPageLabels = {
  readonly addressTitle: string;
  readonly phoneTitle: string;
  readonly whatsappTitle: string;
  readonly emailTitle: string;
  readonly hoursTitle: string;
  readonly mapsLinkLabel: string;
};

export type ContactPageContent = {
  readonly intro: PageIntro;
  readonly labels: ContactPageLabels;
};

export const contactPage: ContactPageContent = {
  intro: {
    eyebrow: "İletişim",
    title: "Nişantaşı ofisimiz, her iş günü açık.",
    description:
      "Formu doldurabilir, telefonla arayabilir ya da randevu alıp ofise gelebilirsiniz. Hangi kanaldan yazarsanız yazın aynı danışman dönüş yapar.",
  },
  labels: {
    addressTitle: "Adres",
    phoneTitle: "Telefon",
    whatsappTitle: "WhatsApp",
    emailTitle: "E-posta",
    hoursTitle: "Çalışma saatleri",
    mapsLinkLabel: "Haritada aç",
  },
} as const;
