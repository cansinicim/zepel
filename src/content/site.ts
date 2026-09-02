/**
 * Zepel Gayrimenkul, site geneli marka ve iletişim verisi.
 * Tek doğruluk kaynağı: marka adı, navigasyon, iletişim, sosyal medya, yasal metinler.
 * UI katmanı bu dosyadan okur, metni bileşen içinde tekrar yazmaz.
 */

export type NavItem = {
  readonly label: string;
  readonly href: string;
};

export type SocialPlatform = "instagram" | "linkedin" | "youtube";

export type SocialLink = {
  readonly platform: SocialPlatform;
  readonly label: string;
  readonly href: string;
  /** lucide-react ikon adı */
  readonly icon: string;
};

export type OfficeHours = {
  readonly label: string;
  readonly value: string;
};

export type ContactInfo = {
  readonly officeName: string;
  readonly addressLines: readonly string[];
  readonly addressSingleLine: string;
  readonly mapsUrl: string;
  readonly phoneLabel: string;
  readonly phoneHref: string;
  readonly whatsappLabel: string;
  readonly whatsappHref: string;
  readonly email: string;
  readonly emailHref: string;
  readonly hours: readonly OfficeHours[];
};

export type SiteConfig = {
  readonly name: string;
  readonly legalName: string;
  readonly shortName: string;
  readonly tagline: string;
  readonly description: string;
  readonly locale: string;
  readonly url: string;
  readonly foundedYear: number;
  readonly keywords: readonly string[];
};

export const siteConfig: SiteConfig = {
  name: "Zepel Gayrimenkul",
  legalName: "Zepel Gayrimenkul Danışmanlık A.Ş.",
  shortName: "Zepel",
  tagline: "Az sayıda mülk, tek bir standart.",
  // Meta description, yaklaşık 155 karakter.
  description:
    "Zepel Gayrimenkul, İstanbul ve Ege kıyısında seçili lüks konut ve yatırım portföyünü yönetir. Değerleme, satış ve danışmanlık tek elden yürütülür.",
  locale: "tr-TR",
  url: "https://zepelgayrimenkul.com",
  foundedYear: 2008,
  keywords: [
    "lüks konut",
    "gayrimenkul danışmanlığı",
    "İstanbul villa",
    "Boğaz yalısı",
    "yatırım danışmanlığı",
    "Bodrum villa",
    "gayrimenkul değerleme",
    "yabancı yatırımcı",
  ],
} as const;

export const navItems: readonly NavItem[] = [
  { label: "Anasayfa", href: "/" },
  { label: "Portföy", href: "/portfoy" },
  { label: "Hizmetler", href: "/hizmetler" },
  { label: "Hakkımızda", href: "/hakkimizda" },
  { label: "İletişim", href: "/iletisim" },
] as const;

export const contactInfo: ContactInfo = {
  officeName: "Zepel Gayrimenkul, Nişantaşı Ofisi",
  addressLines: [
    "Teşvikiye Mahallesi, Hakkı Yeten Caddesi",
    "Selenium Plaza No: 10, Kat 7",
    "34365 Şişli, İstanbul",
  ],
  addressSingleLine:
    "Teşvikiye Mahallesi, Hakkı Yeten Caddesi, Selenium Plaza No: 10, Kat 7, 34365 Şişli, İstanbul",
  mapsUrl: "https://maps.google.com/?q=Selenium+Plaza+Hakki+Yeten+Caddesi+Sisli+Istanbul",
  phoneLabel: "+90 212 373 40 80",
  phoneHref: "tel:+902123734080",
  whatsappLabel: "+90 532 417 60 20",
  whatsappHref: "https://wa.me/905324176020",
  email: "portfoy@zepelgayrimenkul.com",
  emailHref: "mailto:portfoy@zepelgayrimenkul.com",
  hours: [
    { label: "Pazartesi, Cuma", value: "09.00, 19.00" },
    { label: "Cumartesi", value: "10.00, 17.00" },
    { label: "Pazar", value: "Randevu ile" },
  ],
} as const;

export const socialLinks: readonly SocialLink[] = [
  {
    platform: "instagram",
    label: "Instagram",
    href: "https://instagram.com/zepelgayrimenkul",
    icon: "Instagram",
  },
  {
    platform: "linkedin",
    label: "LinkedIn",
    href: "https://linkedin.com/company/zepelgayrimenkul",
    icon: "Linkedin",
  },
  {
    platform: "youtube",
    label: "YouTube",
    href: "https://youtube.com/@zepelgayrimenkul",
    icon: "Youtube",
  },
] as const;

export const legalNavItems: readonly NavItem[] = [
  { label: "Gizlilik Politikası", href: "/gizlilik-politikasi" },
  { label: "KVKK Aydınlatma Metni", href: "/kvkk-aydinlatma-metni" },
  { label: "Çerez Politikası", href: "/cerez-politikasi" },
  { label: "Kullanım Koşulları", href: "/kullanim-kosullari" },
] as const;

export type LegalContent = {
  readonly copyright: string;
  readonly licenceNote: string;
  readonly disclaimer: string;
  readonly credit: string;
};

export const legalContent: LegalContent = {
  copyright: `© ${siteConfig.foundedYear}, ${new Date().getFullYear()} ${siteConfig.legalName}. Tüm hakları saklıdır.`,
  licenceNote: "Taşınmaz Ticareti Yetki Belgesi No: 3435101 / 34 Şişli",
  disclaimer:
    "Sitede yer alan fiyat, alan ve nitelik bilgileri bilgilendirme amaçlıdır, sözleşme hükmü doğurmaz. Güncel durum için ofisimizle teyit ediniz.",
  credit: "İstanbul, Bodrum, Çeşme, Göcek, Kaş ve Sapanca bölgelerinde hizmet verilmektedir.",
} as const;
