/**
 * Zepel Gayrimenkul, sayfa bölümlerinin metin içeriği.
 *
 * NOT: `testimonials` altındaki isim, ünvan ve yorumlar TEMSİLİ ÖRNEKTİR.
 * Gerçek bir kişiyi ya da müşteriyi temsil etmez. Yayına almadan önce
 * gerçek referanslarla değiştirilmelidir.
 */

/* -------------------------------------------------------------------------- */
/* Ortak tipler                                                               */
/* -------------------------------------------------------------------------- */

export type CallToAction = {
  readonly label: string;
  readonly href: string;
};

export type SectionIntro = {
  readonly eyebrow: string;
  readonly title: string;
};

export type SectionMedia = {
  readonly src: string;
  readonly alt: string;
};

/** Unsplash görsel URL'i üretir, portföy ve anlatı görselleriyle aynı parametreler. */
const img = (photoId: string): string =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=2400&q=80`;

/* -------------------------------------------------------------------------- */
/* Hero                                                                       */
/* -------------------------------------------------------------------------- */

export type HeroContent = {
  readonly eyebrow: string;
  readonly titleLines: readonly string[];
  readonly description: string;
  readonly primaryCta: CallToAction;
  readonly secondaryCta: CallToAction;
  readonly scrollHint: string;
  readonly media: SectionMedia;
};

export const hero: HeroContent = {
  eyebrow: "İstanbul ve Ege kıyısı, 2008'den beri",
  titleLines: ["Doğru mülkü", "bulmak değil,", "doğru kararı vermek."],
  media: {
    src: img("photo-1512917774080-9991f1c4c750"),
    alt: "Akşam ışığında, geniş cam cepheli lüks bir konutun dış görünümü",
  },
  description:
    "Zepel, sınırlı sayıda konut ve yatırım portföyünü uçtan uca yönetir. Değerlemeden tapuya kadar süreci tek bir danışman yürütür, siz yalnızca kararı verirsiniz.",
  primaryCta: { label: "Portföyü görüntüle", href: "/portfoy" },
  secondaryCta: { label: "Danışmanla görüşün", href: "/iletisim" },
  scrollHint: "Kaydırın",
} as const;

/* -------------------------------------------------------------------------- */
/* Hakkımızda                                                                 */
/* -------------------------------------------------------------------------- */

export type AboutHighlight = {
  readonly title: string;
  readonly description: string;
};

export type AboutContent = SectionIntro & {
  readonly paragraphs: readonly string[];
  readonly highlights: readonly AboutHighlight[];
  readonly cta: CallToAction;
};

export const about: AboutContent = {
  eyebrow: "Hakkımızda",
  title: "Portföyümüz küçük, çünkü seçiciyiz.",
  paragraphs: [
    "Zepel Gayrimenkul, 2008'de tek bir ofisle İstanbul'da kuruldu. Bugün Boğaz hattı, kuzey ormanları ve Ege kıyısında sınırlı sayıda mülkle çalışıyoruz. Her yıl incelediğimiz taşınmazların yalnızca küçük bir bölümü portföyümüze giriyor; konum, yapı kalitesi ve hukuki durum aynı anda karşılanmıyorsa mülkü listelemiyoruz.",
    "Çalışma biçimimiz danışmanlık üzerine kurulu. Bir mülkü sunmadan önce imar durumunu, tapu kaydını, kat mülkiyetini ve bölgedeki gerçekleşmiş satış verilerini inceliyoruz. Alıcıya sunduğumuz her rakamın arkasında bir kaynak var. Satıcı tarafında ise fiyatı piyasaya değil, veriye göre konumlandırıyoruz.",
  ],
  highlights: [
    {
      title: "Tek danışman, tek muhatap",
      description:
        "İlk görüşmeden tapu devrine kadar süreci aynı kıdemli danışman yürütür. Dosyanız el değiştirmez.",
    },
    {
      title: "Sunum öncesi hukuki kontrol",
      description:
        "Tapu, imar, iskân ve ipotek kayıtları portföye alma aşamasında incelenir. Sürpriz, satıştan sonra değil öncesinde çıkar.",
    },
    {
      title: "Gerçekleşmiş satışa dayalı fiyat",
      description:
        "Değerleme, ilan fiyatlarına değil bölgede son 12 ayda kapanan işlemlere dayanır.",
    },
  ],
  cta: { label: "Ekibimizle tanışın", href: "/hakkimizda" },
} as const;

/* -------------------------------------------------------------------------- */
/* Hizmetler                                                                  */
/* -------------------------------------------------------------------------- */

export type ServiceSlug =
  | "satis-ve-kiralama"
  | "proje-pazarlama"
  | "yatirim-danismanligi"
  | "ekspertiz-ve-degerleme"
  | "portfoy-yonetimi"
  | "yabanci-yatirimci";

export type Service = {
  readonly slug: ServiceSlug;
  readonly title: string;
  readonly description: string;
  readonly details: readonly string[];
  /** lucide-react ikon adı */
  readonly icon: string;
};

export type ServicesContent = SectionIntro & {
  readonly description: string;
  readonly items: readonly Service[];
  readonly cta: CallToAction;
};

export const services: ServicesContent = {
  eyebrow: "Hizmetler",
  title: "Altı alanda, aynı standartla.",
  description:
    "Hizmetlerimiz birbirini besler. Bir mülkü değerleyen ekip, onu pazarlayan ve devrini tamamlayan ekiple aynıdır.",
  items: [
    {
      slug: "satis-ve-kiralama",
      title: "Satış ve Kiralama",
      description:
        "Konut ve ticari taşınmazların alım, satım ve kiralama süreçlerini baştan sona yürütürüz. Pazarlıktan tapuya kadar tek muhatap.",
      details: [
        "Mülke özel fiyat konumlandırma ve sunum dosyası",
        "Nitelikli alıcı ve kiracı ön eleme görüşmeleri",
        "Pazarlık yönetimi ve sözleşme hazırlığı",
        "Tapu randevusu, devir ve teslim koordinasyonu",
      ],
      icon: "KeyRound",
    },
    {
      slug: "proje-pazarlama",
      title: "Proje Pazarlama",
      description:
        "Butik konut projelerinin lansman öncesi konumlandırmasını ve satış sürecini üstleniriz. Doğru fiyatla doğru hızda satış.",
      details: [
        "Hedef kitle ve rakip proje analizi",
        "Blok, kat ve cephe bazlı fiyat listesi kurgusu",
        "Satış ofisi ekibinin eğitimi ve süreç kurulumu",
        "Haftalık satış raporu ve fiyat revizyon önerisi",
      ],
      icon: "Building2",
    },
    {
      slug: "yatirim-danismanligi",
      title: "Yatırım Danışmanlığı",
      description:
        "Sermayenizi hangi bölgeye ve hangi ürüne yönlendireceğinizi rakamlarla belirleriz. Duygusal karar değil, getiri hesabı.",
      details: [
        "Bölge bazlı getiri, kira çarpanı ve likidite analizi",
        "Bütçeye göre alternatif senaryo karşılaştırması",
        "Giriş ve çıkış zamanlaması önerisi",
        "Satın alma sonrası portföy performans takibi",
      ],
      icon: "LineChart",
    },
    {
      slug: "ekspertiz-ve-degerleme",
      title: "Ekspertiz ve Değerleme",
      description:
        "Taşınmazın gerçek piyasa değerini bağımsız yöntemlerle tespit ederiz. Rapor, banka ve mahkeme süreçlerinde kullanılabilir nitelikte hazırlanır.",
      details: [
        "Emsal karşılaştırma ve gelir indirgeme yöntemleri",
        "Yapı durumu, yaş ve yıpranma payı incelemesi",
        "İmar, iskân ve tapu kaydı kontrolü",
        "Yazılı değerleme raporu ve fiyat aralığı önerisi",
      ],
      icon: "ScrollText",
    },
    {
      slug: "portfoy-yonetimi",
      title: "Portföy Yönetimi",
      description:
        "Birden fazla taşınmazı olan mal sahipleri için kira, bakım ve doluluk yönetimini üstleniriz. Siz sadece geliri takip edersiniz.",
      details: [
        "Kira tahsilatı, artış takibi ve sözleşme yenileme",
        "Bakım, onarım ve tadilat işlerinin koordinasyonu",
        "Aidat, vergi ve sigorta yükümlülüklerinin izlenmesi",
        "Üç aylık portföy değeri ve gelir raporu",
      ],
      icon: "Landmark",
    },
    {
      slug: "yabanci-yatirimci",
      title: "Yabancı Yatırımcı ve Oturum Süreçleri",
      description:
        "Yurt dışından gelen alıcılar için mülk seçiminden oturum iznine kadar tüm adımları yönetiriz. Süreç Türkçe bilmeden de tamamlanır.",
      details: [
        "Vergi numarası, banka hesabı ve döviz alım belgesi",
        "Yeminli tercüman ve noter süreçlerinin koordinasyonu",
        "Vatandaşlık ve oturum izni başvuru dosyası hazırlığı",
        "İngilizce, Arapça ve Rusça danışmanlık desteği",
      ],
      icon: "Globe2",
    },
  ],
  cta: { label: "Tüm hizmet detayları", href: "/hizmetler" },
} as const;

/* -------------------------------------------------------------------------- */
/* İstatistikler                                                              */
/* -------------------------------------------------------------------------- */

export type Stat = {
  readonly id: string;
  readonly value: number;
  readonly label: string;
  readonly prefix?: string;
  readonly suffix?: string;
  readonly note?: string;
};

export type StatsContent = SectionIntro & {
  readonly items: readonly Stat[];
};

export const stats: StatsContent = {
  eyebrow: "Rakamlarla Zepel",
  title: "On yedi yıllık kayıt.",
  items: [
    {
      id: "deneyim",
      value: 17,
      label: "Yıllık saha deneyimi",
      suffix: " yıl",
      note: "2008'den bugüne kesintisiz",
    },
    {
      id: "portfoy-degeri",
      value: 12.4,
      label: "Yönetilen portföy değeri",
      prefix: "₺ ",
      suffix: " milyar",
    },
    {
      id: "islem",
      value: 1240,
      label: "Tamamlanan işlem",
      suffix: "+",
      note: "Satış, kiralama ve devir",
    },
    {
      id: "ilce",
      value: 28,
      label: "Hizmet verilen ilçe",
      note: "İstanbul, Muğla, İzmir, Sakarya, Antalya",
    },
  ],
} as const;

/* -------------------------------------------------------------------------- */
/* Süreç                                                                      */
/* -------------------------------------------------------------------------- */

export type ProcessStep = {
  readonly number: string;
  readonly title: string;
  readonly description: string;
};

export type ProcessContent = SectionIntro & {
  readonly description: string;
  readonly steps: readonly ProcessStep[];
};

export const process: ProcessContent = {
  eyebrow: "Çalışma süreci",
  title: "Dört adım, sürpriz yok.",
  description:
    "Her dosya aynı sırayla ilerler. Hangi aşamada olduğunuzu ve bir sonraki adımda ne olacağını her zaman bilirsiniz.",
  steps: [
    {
      number: "01",
      title: "Keşif",
      description:
        "Bütçenizi, kullanım amacınızı ve zaman planınızı konuşuruz. Yatırım mı, oturum mu, ikisi birden mi? Bu görüşme olmadan mülk göstermeyiz.",
    },
    {
      number: "02",
      title: "Strateji",
      description:
        "Bölge ve ürün tipini rakamlarla daraltırız. Kısa listeye giren her mülkün hukuki durumu ve fiyat gerekçesi önceden incelenir.",
    },
    {
      number: "03",
      title: "Sunum",
      description:
        "Yerinde gezer, farkları yan yana koyarız. Her mülk için değer aralığı, olası bakım maliyeti ve tahmini kira getirisi yazılı sunulur.",
    },
    {
      number: "04",
      title: "Kapanış",
      description:
        "Pazarlığı biz yürütürüz. Sözleşme, ödeme planı, tapu randevusu ve teslim tek takvimde toplanır. Devirden sonra da ulaşılabiliriz.",
    },
  ],
} as const;

/* -------------------------------------------------------------------------- */
/* Referanslar (TEMSİLİ)                                                      */
/* -------------------------------------------------------------------------- */

export type Testimonial = {
  readonly id: string;
  readonly quote: string;
  readonly name: string;
  readonly title: string;
  readonly city: string;
};

export type TestimonialsContent = SectionIntro & {
  readonly items: readonly Testimonial[];
};

/** Aşağıdaki referanslar temsili örnektir, gerçek kişileri temsil etmez. */
export const testimonials: TestimonialsContent = {
  eyebrow: "Referanslar",
  title: "Çalıştığımız kişiler ne diyor?",
  items: [
    {
      id: "referans-1",
      quote:
        "Üç ayda dört farklı ofisle görüştük. Zepel, gösterdiği ilk mülkte imar sorununu kendisi söyleyen tek taraftı. Sonunda aldığımız daireyi de aynı dürüstlükle anlattılar.",
      name: "Elif Karaduman",
      title: "Finans yöneticisi",
      city: "İstanbul",
    },
    {
      id: "referans-2",
      quote:
        "Bodrum'daki villayı satarken beklediğimden yüksek bir fiyat söylediler ve gerekçesini rakamla gösterdiler. Yedi haftada, söyledikleri bandın içinde kapandı.",
      name: "Murat Şensoy",
      title: "Sanayici",
      city: "Bodrum",
    },
    {
      id: "referans-3",
      quote:
        "Yurt dışında yaşıyorum, süreci uzaktan yürütmek zorundaydım. Vergi numarasından tapu randevusuna kadar her adımı takip ettiler, tek bir kez uçağa binmek yetti.",
      name: "Deniz Alpaslan",
      title: "Yazılım girişimcisi",
      city: "Londra",
    },
  ],
} as const;

/* -------------------------------------------------------------------------- */
/* İletişim bölümü ve form                                                    */
/* -------------------------------------------------------------------------- */

export type FormFieldName =
  | "fullName"
  | "phone"
  | "email"
  | "service"
  | "message";

export type FormField = {
  readonly name: FormFieldName;
  readonly label: string;
  readonly placeholder: string;
  readonly required: boolean;
  readonly type: "text" | "tel" | "email" | "select" | "textarea";
  readonly helpText?: string;
};

export type FormStatusMessages = {
  readonly idle: string;
  readonly submitting: string;
  readonly success: string;
  readonly successDetail: string;
  readonly error: string;
  readonly errorDetail: string;
  readonly validation: string;
  /** Alan bazlı doğrulama uyarıları, sunucu tarafı doğrulama bunları döndürür. */
  readonly requiredField: string;
  readonly invalidName: string;
  readonly invalidEmail: string;
  readonly invalidPhone: string;
  readonly invalidService: string;
  readonly shortMessage: string;
  readonly longMessage: string;
};

export type ContactSectionContent = SectionIntro & {
  readonly description: string;
  readonly formTitle: string;
  readonly fields: readonly FormField[];
  readonly serviceOptions: readonly { readonly value: ServiceSlug | "diger"; readonly label: string }[];
  readonly submitLabel: string;
  readonly consentText: string;
  readonly status: FormStatusMessages;
  readonly directContactTitle: string;
  readonly directContactDescription: string;
};

export const contactSection: ContactSectionContent = {
  eyebrow: "İletişim",
  title: "Bir mülkü konuşmadan önce, planınızı konuşalım.",
  description:
    "Formu doldurun, aynı iş günü içinde kıdemli bir danışman size dönsün. Acele bir dosya varsa doğrudan arayabilirsiniz.",
  formTitle: "Görüşme talebi",
  fields: [
    {
      name: "fullName",
      label: "Ad soyad",
      placeholder: "Adınız ve soyadınız",
      required: true,
      type: "text",
    },
    {
      name: "phone",
      label: "Telefon",
      placeholder: "+90 5__ ___ __ __",
      required: true,
      type: "tel",
      helpText: "Yalnızca bu görüşme için kullanılır.",
    },
    {
      name: "email",
      label: "E-posta",
      placeholder: "ornek@sirket.com",
      required: true,
      type: "email",
    },
    {
      name: "service",
      label: "İlgilendiğiniz hizmet",
      placeholder: "Bir hizmet seçin",
      required: true,
      type: "select",
    },
    {
      name: "message",
      label: "Mesajınız",
      placeholder: "Bütçeniz, aradığınız bölge ve zaman planınız hakkında kısa bir not bırakın.",
      required: false,
      type: "textarea",
    },
  ],
  serviceOptions: [
    { value: "satis-ve-kiralama", label: "Satış ve kiralama" },
    { value: "proje-pazarlama", label: "Proje pazarlama" },
    { value: "yatirim-danismanligi", label: "Yatırım danışmanlığı" },
    { value: "ekspertiz-ve-degerleme", label: "Ekspertiz ve değerleme" },
    { value: "portfoy-yonetimi", label: "Portföy yönetimi" },
    { value: "yabanci-yatirimci", label: "Yabancı yatırımcı ve oturum süreçleri" },
    { value: "diger", label: "Diğer" },
  ],
  submitLabel: "Görüşme talebi gönder",
  consentText:
    "Formu göndererek KVKK Aydınlatma Metni kapsamında iletişim bilgilerinizin işlenmesine izin vermiş olursunuz.",
  status: {
    idle: "Aynı iş günü içinde dönüş yapıyoruz.",
    submitting: "Gönderiliyor, lütfen bekleyin",
    success: "Talebiniz bize ulaştı.",
    successDetail: "Bir danışmanımız aynı iş günü içinde sizi arayacak.",
    error: "Talep gönderilemedi.",
    errorDetail:
      "Bağlantı sırasında bir sorun oluştu. Tekrar deneyin ya da bizi doğrudan arayın.",
    validation: "Lütfen zorunlu alanları eksiksiz doldurun.",
    requiredField: "Bu alan zorunludur.",
    invalidName: "Ad ve soyadınızı en az iki karakterle yazın.",
    invalidEmail: "Geçerli bir e-posta adresi girin, örnek: ad@sirket.com",
    invalidPhone: "Telefon numarasını en az 10 rakamla girin.",
    invalidService: "Listeden bir hizmet seçin.",
    shortMessage: "Mesajınızı yazacaksanız en az 20 karakter olsun.",
    longMessage: "Mesajınız en fazla 1500 karakter olabilir.",
  },
  directContactTitle: "Doğrudan ulaşın",
  directContactDescription:
    "Portföyde göremediğiniz bir mülk arıyorsanız bizi arayın. Listelenmemiş taşınmazlarımız da var.",
} as const;

/* -------------------------------------------------------------------------- */
/* Footer                                                                     */
/* -------------------------------------------------------------------------- */

export type FooterColumn = {
  readonly title: string;
  readonly links: readonly CallToAction[];
};

export type FooterContent = {
  readonly statement: string;
  readonly newsletterTitle: string;
  readonly newsletterDescription: string;
  readonly newsletterPlaceholder: string;
  readonly newsletterCta: string;
  readonly newsletterSuccess: string;
  readonly newsletterError: string;
  readonly columns: readonly FooterColumn[];
  readonly backToTop: string;
};

export const footer: FooterContent = {
  statement:
    "Seçili konut ve yatırım portföyü. İstanbul Boğazı, kuzey ormanları ve Ege kıyısı.",
  newsletterTitle: "Portföy bülteni",
  newsletterDescription:
    "Yeni mülkler yayına girmeden önce bültene çıkar. Ayda bir gönderilir, listeden tek tıkla çıkabilirsiniz.",
  newsletterPlaceholder: "E-posta adresiniz",
  newsletterCta: "Bültene katıl",
  newsletterSuccess: "Kaydınız alındı, bir sonraki bültende görüşürüz.",
  newsletterError: "Geçerli bir e-posta adresi girin.",
  columns: [
    {
      title: "Portföy",
      links: [
        { label: "Satılık konut", href: "/portfoy?tip=satilik" },
        { label: "Kiralık konut", href: "/portfoy?tip=kiralik" },
        { label: "Villa ve yalı", href: "/portfoy?kategori=villa" },
        { label: "Arsa ve ofis", href: "/portfoy?kategori=arsa" },
      ],
    },
    {
      title: "Hizmetler",
      links: [
        { label: "Satış ve kiralama", href: "/hizmetler#satis-ve-kiralama" },
        { label: "Yatırım danışmanlığı", href: "/hizmetler#yatirim-danismanligi" },
        { label: "Ekspertiz ve değerleme", href: "/hizmetler#ekspertiz-ve-degerleme" },
        { label: "Yabancı yatırımcı", href: "/hizmetler#yabanci-yatirimci" },
      ],
    },
    {
      title: "Kurumsal",
      links: [
        { label: "Hakkımızda", href: "/hakkimizda" },
        { label: "Çalışma sürecimiz", href: "/hakkimizda#surec" },
        { label: "Referanslar", href: "/hakkimizda#referanslar" },
        { label: "İletişim", href: "/iletisim" },
      ],
    },
  ],
  backToTop: "Yukarı dön",
} as const;
