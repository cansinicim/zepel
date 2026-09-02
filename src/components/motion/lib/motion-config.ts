/**
 * Hareket katmanının tek yapılandırma kaynağı.
 *
 * Süre, easing, mesafe ve eşik değerleri yalnızca burada tanımlanır;
 * sahne dosyalarında sabit (magic) sayı kullanılmaz. Değerler
 * `src/app/globals.css` içindeki hareket tokenlarıyla aynı ritmi izler.
 */

/** Saniye cinsinden süreler, globals.css içindeki --duration-* ile hizalıdır. */
export const DURATION = {
  fast: 0.22,
  base: 0.4,
  slow: 0.7,
  cinematic: 1.2,
} as const;

/** GSAP easing adları. CSS tarafındaki cubic-bezier eğrilerinin karşılığı. */
export const EASE = {
  out: "power3.out",
  outExpo: "expo.out",
  outSoft: "power2.out",
  in: "power2.in",
  inOut: "power2.inOut",
  linear: "none",
} as const;

/** Genel `data-reveal` giriş animasyonu. */
export const REVEAL = {
  distance: 36,
  distanceCompact: 22,
  duration: 0.9,
  stagger: 0.09,
  /** ScrollTrigger start dizesi, elemanın üstü ekranın bu noktasına gelince. */
  start: "top 88%",
} as const;

/** Sinematik kaydırma bölümü zamanlaması, adım birimi cinsinden. */
export const STORY = {
  /** Çapraz geçişin adım sınırına göre başlangıç kayması. */
  crossfadeOffset: 0.2,
  /** Çapraz geçiş uzunluğu, 1 birim = bir adım. */
  crossfadeDuration: 0.6,
  /** Ken-burns yakınlaşma uzunluğu. */
  kenBurnsDuration: 1.4,
  kenBurnsScale: 1.08,
  /** Scrub gecikmesi, saniye. Sert kesme yerine yumuşak takip verir. */
  scrub: 0.6,
  /** Adım metninin giriş ve çıkış pencereleri, 0-1 arası ilerleme. */
  textIn: { at: 0.15, duration: 0.23 },
  textOut: { at: 0.68, duration: 0.24 },
  textDistance: 52,
} as const;

/** Hero bölümü. */
export const HERO = {
  /** Medya katmanının taban ölçeği, parallax kaymasında boşluk kalmaması için. */
  mediaScale: 1.24,
  mediaScaleDrift: 1.32,
  kenBurnsDuration: 22,
  parallaxPercent: 10,
  lineDuration: 1.15,
  lineStagger: 0.1,
  /** Maskeleme kutusunun altında beklemek üzere satırın başlangıç kayması. */
  lineOffsetPercent: 120,
  contentFadeEnd: "60% top",
} as const;

/** Üst bar davranışı. */
export const HEADER = {
  /** Bu piksel değerinin altında bar her zaman görünür kalır. */
  revealThreshold: 120,
  hideDuration: 0.45,
  showDuration: 0.5,
  menuItemStagger: 0.06,
} as const;

/** Kart etkileşimleri. */
export const CARD = {
  lift: -6,
  duration: 0.45,
  gridStagger: 0.05,
  gridDistance: 18,
} as const;

/** Mıknatıs efekti, imleç hassasiyeti yüksek cihazlarda. */
export const MAGNETIC = {
  strength: 0.24,
  duration: 0.5,
} as const;

/** Sayaç animasyonu. */
export const COUNTER = {
  duration: 1.8,
  startRatio: 0.85,
} as const;

/** Sayfa geçiş perdesi. */
export const PAGE_TRANSITION = {
  duration: 0.55,
} as const;

/** Lenis yumuşak kaydırma. Dokunmatikte doğal kaydırma korunur. */
export const SMOOTH_SCROLL = {
  lerp: 0.1,
  wheelMultiplier: 1,
  touchMultiplier: 1.6,
} as const;

/** Çıpa kaydırması. */
export const ANCHOR = {
  /** Sayfa içi çıpanın yumuşak kaydırma süresi, saniye. */
  duration: 1.1,
  /**
   * Rota geçişinde hedef konumunun kaç kare üst üste sabit kalması
   * "düzen oturdu" sayılır.
   */
  stableFrames: 3,
  /** Oturma döngüsünün kare bütçesi, düzen hiç durulmazsa çıkış sınırı. */
  maxFrames: 45,
} as const;

/** Kırılım noktası, Tailwind `md` ile aynı. */
export const BREAKPOINT_MD = 768;

/** Görsel yüklemesi sonrası ScrollTrigger tazeleme gecikmesi, ms. */
export const REFRESH_DEBOUNCE = 180;
