/**
 * Sahne sözleşmesi.
 *
 * Bir sahne, DOM'da `data-*` kancalarını bulup animasyonunu kuran saf bir
 * fonksiyondur. GSAP nesneleri çağıran taraftaki `gsap.matchMedia` bağlamı
 * tarafından otomatik temizlenir; GSAP dışı kaynaklar (dinleyici, observer)
 * için sahne bir temizleme fonksiyonu döndürür.
 */

export type SceneFlags = {
  /** 768px ve üstü. Ağır efektler yalnızca burada açılır. */
  readonly isDesktop: boolean;
  /** 768px altı. Parallax ve ken-burns sadeleştirilir. */
  readonly isMobile: boolean;
  /** İmleç hassasiyeti yüksek cihaz, hover efektleri için ön koşul. */
  readonly isFinePointer: boolean;
};

export type SceneCleanup = () => void;

export type Scene = (flags: SceneFlags) => SceneCleanup | void;
