/**
 * Zepel Gayrimenkul, yasal metinler.
 *
 * UYARI: Bu dosyadaki metinler sektör uygulamasına ve yürürlükteki mevzuata
 * (6698 sayılı KVKK, 6563 sayılı e-Ticaret Kanunu, 6502 sayılı Tüketicinin
 * Korunması Hakkında Kanun, Taşınmaz Ticareti Hakkında Yönetmelik) uygun genel
 * bir ŞABLONDUR. Yayına almadan önce şirketin fiili veri işleme süreçleriyle
 * karşılaştırılmalı ve bir hukuk danışmanı tarafından gözden geçirilmelidir.
 * `[doldurulacak]` işaretli alanlar şirketin resmi kayıtlarından tamamlanmalıdır.
 *
 * `site.ts` marka ve iletişim verisinin tek kaynağıdır; buradaki metinler
 * şirket adı, adres ve iletişim kanallarını oradan okur, tekrar yazmaz.
 */

import type { CallToAction } from "@/content/sections";
import { contactInfo, siteConfig } from "@/content/site";

/** Alt bilgideki `legalNavItems` ile aynı rota kümesi. */
export type LegalSlug =
  | "gizlilik-politikasi"
  | "kvkk-aydinlatma-metni"
  | "cerez-politikasi"
  | "kullanim-kosullari";

export type LegalSection = {
  readonly heading: string;
  readonly paragraphs: readonly string[];
  readonly bullets?: readonly string[];
};

export type LegalDocument = {
  readonly slug: LegalSlug;
  readonly title: string;
  /** Meta açıklaması ve sayfa girişindeki özet. */
  readonly description: string;
  /** ISO 8601 tarih, `<time dateTime>` ve görünen etikette kullanılır. */
  readonly lastUpdated: string;
  /** Bölümlerden önceki açılış paragrafları. */
  readonly intro: readonly string[];
  readonly sections: readonly LegalSection[];
};

/** Yasal sayfalarda tekrarlanan arayüz etiketleri. */
export type LegalPageLabels = {
  readonly eyebrow: string;
  readonly lastUpdatedLabel: string;
  readonly noticeTitle: string;
  readonly noticeBody: string;
  readonly noticeCta: CallToAction;
};

export const legalPageLabels: LegalPageLabels = {
  eyebrow: "Yasal bilgilendirme",
  lastUpdatedLabel: "Son güncelleme",
  noticeTitle: "Bu metin bilgilendirme amaçlıdır",
  noticeBody:
    "Yasal metinlerimiz mevzuattaki ve iş süreçlerimizdeki değişikliklere göre güncellenir. Yayındaki sürümün sizin durumunuza etkisini öğrenmek ya da metnin güncel hali hakkında bilgi almak için bize ulaşın.",
  noticeCta: { label: "Bize ulaşın", href: "/iletisim" },
} as const;

/** Tüm yasal metinlerin ortak son güncelleme tarihi. */
const LAST_UPDATED = "2026-09-02";

/* -------------------------------------------------------------------------- */
/* KVKK Aydınlatma Metni                                                      */
/* -------------------------------------------------------------------------- */

export const kvkkNotice: LegalDocument = {
  slug: "kvkk-aydinlatma-metni",
  title: "KVKK Aydınlatma Metni",
  description:
    "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında, Zepel Gayrimenkul olarak hangi kişisel verilerinizi hangi amaçla işlediğimizi ve haklarınızı açıklıyoruz.",
  lastUpdated: LAST_UPDATED,
  intro: [
    `Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu'nun ("KVKK") 10. maddesi ile Aydınlatma Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ uyarınca, ${siteConfig.legalName} tarafından hazırlanmıştır.`,
    "Amacımız; kişisel verilerinizi hangi yollarla topladığımızı, hangi amaçlarla ve hangi hukuki sebeplere dayanarak işlediğimizi, kimlere aktardığımızı ve bu süreçte sahip olduğunuz hakları açık biçimde ortaya koymaktır.",
  ],
  sections: [
    {
      heading: "Veri sorumlusunun kimliği",
      paragraphs: [
        `Kişisel verileriniz, veri sorumlusu sıfatıyla ${siteConfig.legalName} tarafından aşağıda açıklanan kapsamda işlenmektedir.`,
      ],
      bullets: [
        `Unvan: ${siteConfig.legalName}`,
        `Adres: ${contactInfo.addressSingleLine}`,
        `Telefon: ${contactInfo.phoneLabel}`,
        `E-posta: ${contactInfo.email}`,
        "MERSİS numarası: [doldurulacak]",
        "Ticaret sicil numarası: [doldurulacak]",
        "Vergi dairesi ve numarası: [doldurulacak]",
      ],
    },
    {
      heading: "İşlenen kişisel veri kategorileri",
      paragraphs: [
        "Sitemiz üzerinden ilettiğiniz talepler, telefon ve e-posta yazışmaları ile ofisimizde yürütülen görüşmeler kapsamında aşağıdaki veri kategorileri işlenebilir.",
      ],
      bullets: [
        "Kimlik verisi: ad, soyad; sözleşme aşamasına gelinmesi halinde ilgili mevzuatın zorunlu kıldığı kimlik bilgileri.",
        "İletişim verisi: telefon numarası, e-posta adresi, iletişim tercihi ve gerektiğinde adres bilgisi.",
        "Müşteri işlem verisi: talep ve şikayet kayıtları, ilgilenilen mülkler, görüşme notları, randevu ve portföy sunum kayıtları.",
        "İşlem güvenliği verisi: IP adresi, tarayıcı ve cihaz bilgisi, sitede gezinme kayıtları ve çerez kayıtları.",
        "Pazarlama verisi: açık rızanız bulunması halinde bülten aboneliği ve iletişim izni kayıtları.",
      ],
    },
    {
      heading: "Kişisel verilerin işlenme amaçları",
      paragraphs: [
        "Kişisel verileriniz, KVKK'nın 4. maddesindeki genel ilkelere uygun olarak, yalnızca aşağıdaki amaçlarla ve bu amaçlarla sınırlı biçimde işlenir.",
      ],
      bullets: [
        "Gayrimenkul alım, satım, kiralama ve danışmanlık taleplerinizin karşılanması.",
        "Portföyümüzden size uygun mülklerin belirlenmesi ve sunulması.",
        "Randevu, yerinde inceleme ve görüşme süreçlerinin planlanması.",
        "Sözleşme öncesi görüşmelerin yürütülmesi ve sözleşmenin kurulması ile ifası.",
        "Talep, öneri ve şikayetlerinizin değerlendirilmesi ve sonuçlandırılması.",
        "Hizmet kalitesinin ölçülmesi, sitenin güvenliğinin ve sürekliliğinin sağlanması.",
        "Taşınmaz ticareti mevzuatı, vergi mevzuatı ve suç gelirlerinin aklanmasının önlenmesine ilişkin yükümlülüklerin yerine getirilmesi.",
        "Yetkili kamu kurum ve kuruluşlarına karşı bilgi verme yükümlülüklerimizin yerine getirilmesi.",
      ],
    },
    {
      heading: "Kişisel verilerin toplanma yöntemi",
      paragraphs: [
        "Kişisel verileriniz; sitemizdeki iletişim formu, e-posta, telefon, WhatsApp ve benzeri iletişim kanalları, ofisimizde yapılan yüz yüze görüşmeler ile sitenin kullanımı sırasında çerezler aracılığıyla, kısmen otomatik ve otomatik olmayan yollarla toplanır.",
      ],
    },
    {
      heading: "İşlemenin hukuki sebepleri",
      paragraphs: [
        "Yukarıdaki amaçlarla yürütülen işleme faaliyetleri, KVKK'nın 5. maddesinde sayılan aşağıdaki hukuki sebeplere dayanır.",
      ],
      bullets: [
        "Bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması (md. 5/2-c).",
        "Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi için zorunlu olması (md. 5/2-ç).",
        "Bir hakkın tesisi, kullanılması veya korunması için veri işlemenin zorunlu olması (md. 5/2-e).",
        "İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla, veri sorumlusunun meşru menfaatleri için veri işlenmesinin zorunlu olması (md. 5/2-f).",
        "Bu sebeplerin bulunmadığı hallerde, örneğin ticari elektronik ileti gönderiminde, açık rızanızın bulunması (md. 5/1).",
      ],
    },
    {
      heading: "Kişisel verilerin aktarılması",
      paragraphs: [
        "Kişisel verileriniz, işleme amaçlarıyla sınırlı olmak üzere ve KVKK'nın 8. ve 9. maddelerindeki şartlara uygun biçimde aktarılabilir. Verilerinizi pazarlama amacıyla üçüncü kişilere satmayız.",
      ],
      bullets: [
        "Hizmet aldığımız barındırma, altyapı, e-posta, çağrı ve arşivleme sağlayıcılarına.",
        "Mali müşavir, bağımsız denetçi ve avukat gibi sır saklama yükümlülüğü altındaki danışmanlarımıza.",
        "İşlemin gerektirdiği ölçüde tapu müdürlükleri, noterler, bankalar ve sigorta şirketlerine.",
        "Kanunen yetkili kamu kurum ve kuruluşları ile adli mercilere.",
        "Yurt dışında yerleşik hizmet sağlayıcıların kullanıldığı hallerde, KVKK'nın 9. maddesindeki şartlara uygun olarak yurt dışına.",
      ],
    },
    {
      heading: "Saklama süresi",
      paragraphs: [
        "Kişisel verileriniz, işlendikleri amaç için gerekli olan süre boyunca ve ilgili mevzuatta öngörülen zamanaşımı süreleri dikkate alınarak saklanır.",
        "Sözleşme ilişkisine dönüşen kayıtlar, ilgili mevzuattaki saklama yükümlülükleri (ticari defter ve belgeler için on yıl, vergi mevzuatı için beş yıl) sona erene kadar; sözleşmeye dönüşmeyen talep kayıtları ise en fazla iki yıl süreyle saklanır. Sürelerin sona ermesi halinde verileriniz silinir, yok edilir veya anonim hale getirilir.",
      ],
    },
    {
      heading: "Veri güvenliğine ilişkin tedbirler",
      paragraphs: [
        "Kişisel verilerin hukuka aykırı olarak işlenmesini ve verilere hukuka aykırı erişimi önlemek amacıyla; erişim yetkisi sınırlaması, şifreleme, güncel yazılım ve güvenlik duvarı kullanımı, personel farkındalık eğitimleri ve tedarikçilerle gizlilik taahhütleri gibi idari ve teknik tedbirler uygulanır.",
      ],
    },
    {
      heading: "İlgili kişi olarak haklarınız",
      paragraphs: [
        "KVKK'nın 11. maddesi uyarınca veri sorumlusuna başvurarak aşağıdaki haklarınızı kullanabilirsiniz.",
      ],
      bullets: [
        "Kişisel verinizin işlenip işlenmediğini öğrenme.",
        "Kişisel veriniz işlenmişse buna ilişkin bilgi talep etme.",
        "İşlenme amacını ve verilerin amacına uygun kullanılıp kullanılmadığını öğrenme.",
        "Yurt içinde veya yurt dışında verilerin aktarıldığı üçüncü kişileri bilme.",
        "Eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme.",
        "KVKK'nın 7. maddesindeki şartlar çerçevesinde verilerin silinmesini veya yok edilmesini isteme.",
        "Düzeltme, silme ve yok etme işlemlerinin verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme.",
        "İşlenen verilerin münhasıran otomatik sistemlerle analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme.",
        "Kişisel verilerin kanuna aykırı işlenmesi sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme.",
      ],
    },
    {
      heading: "Başvuru yolu",
      paragraphs: [
        `Haklarınıza ilişkin taleplerinizi, Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ'de belirtilen şartlara uygun olarak, ${contactInfo.addressSingleLine} adresine ıslak imzalı yazılı dilekçeyle ya da sistemimizde kayıtlı e-posta adresinizden ${contactInfo.email} adresine iletebilirsiniz.`,
        "Başvurunuzda ad, soyad, imza, Türkiye Cumhuriyeti kimlik numarası, tebligata esas adres, varsa bildirime esas e-posta adresi ile telefon numarası ve talep konusu yer almalıdır. Talepleriniz, niteliğine göre en kısa sürede ve en geç otuz gün içinde sonuçlandırılır. İşlemin ayrıca bir maliyet gerektirmesi halinde Kurul tarafından belirlenen tarifedeki ücret talep edilebilir.",
      ],
    },
  ],
} as const;

/* -------------------------------------------------------------------------- */
/* Gizlilik Politikası                                                        */
/* -------------------------------------------------------------------------- */

export const privacyPolicy: LegalDocument = {
  slug: "gizlilik-politikasi",
  title: "Gizlilik Politikası",
  description:
    "Zepel Gayrimenkul olarak sitemizde hangi verileri topladığımızı, bu verileri nasıl kullandığımızı, kimlerle paylaştığımızı ve nasıl koruduğumuzu açıklıyoruz.",
  lastUpdated: LAST_UPDATED,
  intro: [
    `Bu gizlilik politikası, ${siteConfig.url} adresinde yayınlanan web sitesinin ziyaretçilerine ait verilerin ${siteConfig.legalName} tarafından nasıl işlendiğini açıklar.`,
    "Kişisel verilerin işlenmesine ilişkin ayrıntılı hukuki bilgilendirme KVKK Aydınlatma Metni'nde, çerez kullanımına ilişkin ayrıntılar ise Çerez Politikası'nda yer alır. Bu politika, iki metni tamamlayıcı niteliktedir.",
  ],
  sections: [
    {
      heading: "Kapsam",
      paragraphs: [
        "Politika; sitemizi ziyaret eden, iletişim formunu dolduran, telefon, e-posta veya WhatsApp üzerinden bize ulaşan ve ofisimizde görüşme yapan kişileri kapsar.",
        "Sitemizden bağlantı verilen üçüncü taraf siteler bu politikanın kapsamı dışındadır; bu sitelerin kendi gizlilik uygulamalarını incelemenizi öneririz.",
      ],
    },
    {
      heading: "Topladığımız veriler",
      paragraphs: [
        "Verileri iki kaynaktan elde ederiz: doğrudan sizin paylaştıklarınız ve siteyi kullanırken otomatik olarak oluşan teknik kayıtlar.",
      ],
      bullets: [
        "Sizin paylaştıklarınız: ad soyad, telefon, e-posta adresi, talebinizin içeriği ve görüşme sırasında ilettiğiniz mülk tercihleri.",
        "Otomatik oluşanlar: IP adresi, tarayıcı ve işletim sistemi bilgisi, ziyaret edilen sayfalar, ziyaret süresi ve siteye hangi bağlantı üzerinden geldiğiniz.",
        "Çerez kayıtları: tercihlerinizi hatırlamak ve site kullanımını ölçmek için kullanılan çerezlerden gelen veriler.",
      ],
    },
    {
      heading: "İletişim formu verileri",
      paragraphs: [
        `İletişim formu üzerinden ilettiğiniz bilgiler yalnızca talebinizi değerlendirmek, size dönüş yapmak ve portföyümüzden uygun seçenekleri sunmak için kullanılır. Formu doldurmanız, size ticari elektronik ileti gönderileceği anlamına gelmez; bülten ve tanıtım gönderimleri yalnızca ayrıca vereceğiniz açık rıza ile yapılır. Talebiniz ${contactInfo.email} adresine iletilir ve ilgili danışman tarafından ele alınır.`,
      ],
    },
    {
      heading: "Çerezler ve analitik",
      paragraphs: [
        "Bu sitede şu an yalnızca işleyiş için zorunlu çerezler kullanılmaktadır; analitik veya pazarlama amaçlı bir izleme aracı çalıştırılmamaktadır. İleride analitik ya da pazarlama çerezleri devreye alınırsa, bunlar çalıştırılmadan önce site üzerinde bir çerez bildirimi ile açık rızanız alınacaktır.",
        "Çerez kategorileri, saklama süreleri ve tarayıcı üzerinden yönetim adımları Çerez Politikası sayfasında ayrıntılı olarak açıklanmıştır.",
      ],
    },
    {
      heading: "Üçüncü taraf hizmet sağlayıcılar",
      paragraphs: [
        "Siteyi işletirken bazı teknik hizmetleri dışarıdan alırız. Bu sağlayıcılar, verilere yalnızca hizmeti sunmak için gereken ölçüde erişir ve sözleşmesel gizlilik yükümlülüğü altındadır.",
      ],
      bullets: [
        "Barındırma ve içerik dağıtım hizmeti: sitenin yayınlanması ve erişilebilirliği.",
        "Analitik hizmeti: ziyaretçi sayısı ve sayfa performansının ölçülmesi.",
        "E-posta ve mesajlaşma altyapısı: form taleplerinin ve yazışmaların iletilmesi.",
        "Görsel ve harita servisleri: sayfa görselleri ve ofis konumunun gösterilmesi.",
      ],
    },
    {
      heading: "Verilerin saklanması ve güvenliği",
      paragraphs: [
        "Veriler yalnızca işleme amacının gerektirdiği süre boyunca saklanır. Saklama sürelerine ilişkin ayrıntı KVKK Aydınlatma Metni'nde yer alır.",
        "Aktarım sırasında verilerin korunması için site trafiği şifreli bağlantı (HTTPS) üzerinden taşınır. Sistemlere erişim yetkilendirmeyle sınırlandırılır, yetkiler düzenli olarak gözden geçirilir. Buna karşın internet üzerinden yapılan hiçbir aktarımın mutlak güvenlik garantisi veremeyeceğini hatırlatmak isteriz.",
      ],
    },
    {
      heading: "Haklarınız ve tercihleriniz",
      paragraphs: [
        "Verilerinize erişme, düzeltme, silinmesini isteme ve işlemeye itiraz etme haklarınız bulunur. Bu hakların tamamı ve başvuru usulü KVKK Aydınlatma Metni'nde açıklanmıştır.",
        `Tercihlerinizi değiştirmek veya taleplerinizi iletmek için ${contactInfo.email} adresine yazabilir ya da ${contactInfo.phoneLabel} numaralı telefondan ofisimize ulaşabilirsiniz.`,
      ],
    },
    {
      heading: "Çocuklara ilişkin veriler",
      paragraphs: [
        "Sitemiz ve hizmetlerimiz on sekiz yaşından küçük kişilere yönelik değildir. Bir çocuğa ait verinin rızası olmaksızın tarafımıza iletildiğini fark etmeniz halinde bizimle iletişime geçmenizi rica ederiz; bu veriler gecikmeksizin silinir.",
      ],
    },
    {
      heading: "Politikadaki değişiklikler",
      paragraphs: [
        "Bu politika, mevzuattaki ve iş süreçlerimizdeki değişikliklere göre güncellenebilir. Güncel sürüm her zaman bu sayfada yayınlanır ve sayfa başında son güncelleme tarihi belirtilir. Esaslı değişikliklerde ayrıca bilgilendirme yapılır.",
      ],
    },
  ],
} as const;

/* -------------------------------------------------------------------------- */
/* Çerez Politikası                                                           */
/* -------------------------------------------------------------------------- */

export const cookiePolicy: LegalDocument = {
  slug: "cerez-politikasi",
  title: "Çerez Politikası",
  description:
    "Zepel Gayrimenkul sitesinde kullanılan çerez türleri, kullanım amaçları, saklama süreleri ve çerez tercihlerinizi nasıl yönetebileceğiniz.",
  lastUpdated: LAST_UPDATED,
  intro: [
    `Bu politika, ${siteConfig.url} adresinde kullanılan çerezleri ve benzeri izleme teknolojilerini açıklar.`,
    "Amacımız, hangi verilerin çerezler aracılığıyla toplandığını ve bu konudaki tercihlerinizi nasıl kullanabileceğinizi şeffaf biçimde göstermektir.",
  ],
  sections: [
    {
      heading: "Çerez nedir",
      paragraphs: [
        "Çerez (cookie), bir web sitesini ziyaret ettiğinizde tarayıcınız aracılığıyla cihazınıza kaydedilen küçük bir metin dosyasıdır. Çerezler siteyi kullanılabilir kılmak, tercihlerinizi hatırlamak ve site kullanımına ilişkin istatistik üretmek için kullanılır.",
        "Yerel depolama (local storage) ve oturum depolaması gibi benzer teknolojiler de bu politika kapsamındadır.",
      ],
    },
    {
      heading: "Çerezleri neden kullanıyoruz",
      paragraphs: [
        "Çerezleri; sitenin teknik olarak çalışmasını sağlamak, güvenliği korumak, tercihlerinizi hatırlamak ve hangi içeriklerin ilgi çektiğini anlayarak portföy sunumumuzu iyileştirmek için kullanırız.",
      ],
    },
    {
      heading: "Kullanılan çerez kategorileri",
      paragraphs: [
        "Çerezler kullanım amaçlarına göre dört kategoride toplanır. Bugün sitede yalnızca zorunlu çerezler çalışmaktadır; aşağıdaki diğer kategoriler ileride kullanılmaya başlanırsa, çalıştırılmadan önce açık rızanız alınacaktır.",
      ],
      bullets: [
        "Zorunlu çerezler: sayfa yönlendirme, oturum bütünlüğü, form gönderimi ve güvenlik için gereklidir. Devre dışı bırakılamaz, rıza gerektirmez.",
        "İşlevsel çerezler: dil, görüntüleme ve portföy filtresi gibi tercihlerinizi hatırlar. Kapatılması halinde site çalışmaya devam eder, ancak tercihleriniz her ziyarette sıfırlanır.",
        "Analitik çerezler: sayfa görüntüleme sayısı, ziyaret süresi ve gezinme akışı gibi toplu istatistikleri üretir. Bu veriler kişiyi doğrudan tanımlamayacak şekilde değerlendirilir.",
        "Pazarlama çerezleri: reklam ve yeniden hedefleme çalışmalarının ölçülmesi için kullanılabilir. Yalnızca açık rıza verilmesi halinde etkinleştirilir.",
      ],
    },
    {
      heading: "Çerezlerin saklama süreleri",
      paragraphs: [
        "Çerezler saklama sürelerine göre iki gruba ayrılır.",
      ],
      bullets: [
        "Oturum çerezleri: tarayıcı penceresini kapattığınızda cihazınızdan otomatik olarak silinir.",
        "Kalıcı çerezler: belirlenen süre boyunca cihazınızda kalır. Sitemizde kullanılan kalıcı çerezlerin süresi çerezin amacına göre değişir ve azami on iki ayı aşmaz.",
        "Rıza kaydı: çerez tercihinize ilişkin kayıt, tercihinizi tekrar sormamak için azami on iki ay saklanır.",
      ],
    },
    {
      heading: "Üçüncü taraf çerezleri",
      paragraphs: [
        "Analitik ölçüm, gömülü harita ve benzeri hizmetler nedeniyle üçüncü taraflara ait çerezler cihazınıza yerleştirilebilir. Bu çerezlerin işleyişi ilgili sağlayıcının kendi politikasına tabidir; sağlayıcı listesi ve kullanım amaçları Gizlilik Politikası sayfasında yer alır.",
      ],
    },
    {
      heading: "Çerez tercihlerinizi yönetme",
      paragraphs: [
        "Sitede şu an zorunlu olmayan çerez çalıştırılmadığı için ayrıca bir rıza bildirimi gösterilmemektedir. Zorunlu olmayan çerezler devreye alındığında, rızanızı site üzerindeki çerez bildirimi aracılığıyla verebilir veya dilediğiniz zaman geri alabilirsiniz. Rızanızı geri almanız, geri alma anına kadar yapılan işlemlerin hukuka uygunluğunu etkilemez.",
        "Ayrıca tarayıcınızın ayarlarından mevcut çerezleri silebilir ve yeni çerezleri engelleyebilirsiniz. Zorunlu çerezlerin engellenmesi halinde sitenin bazı bölümleri düzgün çalışmayabilir.",
      ],
      bullets: [
        "Chrome: Ayarlar, Gizlilik ve güvenlik, Üçüncü taraf çerezleri.",
        "Safari: Ayarlar, Gizlilik, Çerezleri ve site verilerini yönet.",
        "Firefox: Ayarlar, Gizlilik ve Güvenlik, Çerezler ve Site Verileri.",
        "Edge: Ayarlar, Çerezler ve site izinleri, Çerezleri ve site verilerini yönet.",
      ],
    },
    {
      heading: "Politikadaki değişiklikler",
      paragraphs: [
        "Kullanılan çerezlerde değişiklik olması halinde bu politika güncellenir ve güncel sürüm bu sayfada yayınlanır. Değişikliklerden haberdar olmak için sayfa başındaki son güncelleme tarihini kontrol edebilirsiniz.",
      ],
    },
  ],
} as const;

/* -------------------------------------------------------------------------- */
/* Kullanım Koşulları                                                         */
/* -------------------------------------------------------------------------- */

export const termsOfUse: LegalDocument = {
  slug: "kullanim-kosullari",
  title: "Kullanım Koşulları",
  description:
    "Zepel Gayrimenkul web sitesinin kullanımına ilişkin koşullar: ilan bilgilerinin niteliği, fikri mülkiyet hakları, sorumluluk sınırı ve uygulanacak hukuk.",
  lastUpdated: LAST_UPDATED,
  intro: [
    `Bu koşullar, ${siteConfig.url} adresinde yayınlanan web sitesinin kullanımına ilişkin kuralları düzenler. Siteyi ziyaret ederek bu koşulları kabul etmiş sayılırsınız.`,
    "Koşulları kabul etmiyorsanız siteyi kullanmamanızı rica ederiz.",
  ],
  sections: [
    {
      heading: "Taraflar ve kapsam",
      paragraphs: [
        `Site, ${siteConfig.legalName} tarafından işletilmektedir. Bu metinde "site" ifadesi ${siteConfig.url} adresindeki tüm sayfaları, "kullanıcı" ifadesi ise siteyi ziyaret eden gerçek veya tüzel kişiyi tanımlar.`,
        `Şirketin iletişim bilgileri: ${contactInfo.addressSingleLine}, ${contactInfo.phoneLabel}, ${contactInfo.email}. MERSİS numarası: [doldurulacak]. Taşınmaz ticareti yetki belgesi bilgisi alt bilgide yer alır.`,
      ],
    },
    {
      heading: "Sitenin amacı",
      paragraphs: [
        "Site, şirketin gayrimenkul danışmanlık hizmetlerini ve portföyünde yer alan taşınmazları tanıtmak amacıyla yayınlanır. Site üzerinden çevrim içi satış, rezervasyon veya ödeme işlemi yapılmaz.",
        "Sitede yer alan içerikler genel bilgilendirme niteliğindedir; yatırım, hukuk, vergi veya değerleme danışmanlığı yerine geçmez.",
      ],
    },
    {
      heading: "İlan bilgileri ve fiyatlar",
      paragraphs: [
        "Sitede yer alan mülk bilgileri, görseller, alan ölçüleri, oda sayıları, yapım yılı ve fiyatlar bilgilendirme amaçlıdır. Bu bilgiler icap veya bağlayıcı bir teklif niteliği taşımaz, sözleşme hükmü doğurmaz.",
        "Fiyatlar ve mülk durumu önceden bildirilmeksizin değişebilir; bir mülk satılmış, kiralanmış veya portföyden çıkarılmış olabilir. Görseller temsili olabilir ve mülkün güncel halini birebir yansıtmayabilir.",
        "Bağlayıcı bilgi yalnızca yazılı teklif ve sözleşmelerle verilir. Karar vermeden önce tapu kaydı, imar durumu ve mülkün fiili durumunun ofisimizden teyit edilmesi gerekir.",
      ],
    },
    {
      heading: "Fikri mülkiyet hakları",
      paragraphs: [
        `Sitede yer alan marka, logo, metin, fotoğraf, video, grafik, tasarım ve yazılım unsurları ${siteConfig.legalName} veya lisans verenlerine aittir ve 5846 sayılı Fikir ve Sanat Eserleri Kanunu ile ilgili mevzuat kapsamında korunur.`,
        "Bu içerikler, şirketin yazılı izni olmaksızın kopyalanamaz, çoğaltılamaz, değiştirilemez, yeniden yayınlanamaz veya ticari amaçla kullanılamaz. Kaynak göstererek yapılan sınırlı alıntılar bu kuralın istisnasıdır.",
      ],
    },
    {
      heading: "Kullanıcı yükümlülükleri",
      paragraphs: [
        "Siteyi kullanırken yürürlükteki mevzuata ve dürüstlük kuralına uygun davranmayı kabul edersiniz.",
      ],
      bullets: [
        "Siteye otomatik araçlarla aşırı istek göndermek, veri kazımak veya sistemin işleyişini bozmak yasaktır.",
        "Güvenlik önlemlerini aşmaya yönelik girişimlerde bulunulamaz.",
        "İletişim formuna gerçeğe aykırı, üçüncü kişilere ait veya hukuka aykırı bilgi girilemez.",
        "Site içeriği, üçüncü kişilerin haklarını ihlal edecek biçimde kullanılamaz.",
      ],
    },
    {
      heading: "Sorumluluğun sınırlandırılması",
      paragraphs: [
        "Site içeriğinin güncel ve doğru olması için makul özen gösterilir; ancak içeriklerin kesintisiz, hatasız ve her an güncel olacağı taahhüt edilmez.",
        "Sitedeki bilgilere dayanılarak alınan kararlardan doğabilecek doğrudan veya dolaylı zararlardan, mevzuatın emredici hükümleri saklı kalmak kaydıyla şirket sorumlu tutulamaz. Şirketin kastından veya ağır ihmalinden kaynaklanan zararlara ilişkin sorumluluğu saklıdır.",
        "Teknik bakım, altyapı arızası veya mücbir sebep hallerinde siteye erişim geçici olarak kesilebilir.",
      ],
    },
    {
      heading: "Üçüncü taraf bağlantılar",
      paragraphs: [
        "Sitede üçüncü taraflara ait sitelere bağlantı verilebilir. Bu sitelerin içeriğinden, gizlilik uygulamalarından ve güvenliğinden ilgili site sahipleri sorumludur; bağlantı verilmesi bu sitelerin onaylandığı anlamına gelmez.",
      ],
    },
    {
      heading: "Kişisel verilerin korunması",
      paragraphs: [
        "Site kullanımı sırasında işlenen kişisel verilere ilişkin bilgilendirme KVKK Aydınlatma Metni ve Gizlilik Politikası'nda, çerez kullanımına ilişkin bilgilendirme ise Çerez Politikası'nda yer alır. Bu metinler kullanım koşullarının ayrılmaz parçasıdır.",
      ],
    },
    {
      heading: "Koşullarda değişiklik",
      paragraphs: [
        "Şirket, bu koşulları önceden bildirimde bulunmaksızın değiştirme hakkını saklı tutar. Değişiklikler bu sayfada yayınlandığı anda yürürlüğe girer; siteyi kullanmaya devam etmeniz güncel koşulları kabul ettiğiniz anlamına gelir.",
      ],
    },
    {
      heading: "Uygulanacak hukuk ve yetkili mahkeme",
      paragraphs: [
        "Bu koşulların yorumlanmasında ve uygulanmasında Türk hukuku uygulanır.",
        "Koşullardan doğabilecek uyuşmazlıkların çözümünde İstanbul Merkez (Çağlayan) mahkemeleri ve icra daireleri yetkilidir. Tüketici sıfatını haiz kullanıcılar bakımından, 6502 sayılı Tüketicinin Korunması Hakkında Kanun uyarınca tüketici hakem heyetleri ve tüketici mahkemelerinin yetkisine ilişkin hükümler saklıdır.",
      ],
    },
  ],
} as const;
