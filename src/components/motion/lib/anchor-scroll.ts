import type Lenis from "lenis";

import { getAnchorOffset } from "./dom";
import { ANCHOR } from "./motion-config";

/**
 * Çıpa kaydırması, tek uygulama noktası.
 *
 * Hem sayfa içi tıklamalar hem rota geçişleri buradan geçer; hedefin üstünde
 * bırakılacak boşluk her iki yolda da aynı kuralla hesaplanır.
 */

/** Hedefin belge içindeki mutlak üst konumu, kaydırma konumundan bağımsızdır. */
function absoluteTop(target: HTMLElement): number {
  return target.getBoundingClientRect().top + window.scrollY;
}

/** Hedefin üst bar altına oturduğu kaydırma konumu. */
function desiredScroll(target: HTMLElement): number {
  return Math.max(0, absoluteTop(target) - getAnchorOffset(target));
}

/** Sayfa içi çıpa: yumuşak, süreli kaydırma. */
export function scrollToAnchor(lenis: Lenis, target: HTMLElement): void {
  lenis.scrollTo(desiredScroll(target), { duration: ANCHOR.duration });
}

/**
 * Rota geçişi sonrası çıpa hedefine oturma.
 *
 * Yeni sayfanın düzeni ilk karede kesinleşmemiştir: üstteki görseller ve yazı
 * tipleri yerleştikçe hedefin konumu kayar, tek seferlik bir kaydırma yanlış
 * noktada kalır. Bu yüzden hedef her karede yeniden ölçülür ve konumu arka
 * arkaya sabit kalana (ya da bütçe dolana) kadar kaydırma tazelenir.
 * Kaydırma `immediate` olduğu için ara düzeltmeler görünmez.
 *
 * Dönen fonksiyon döngüyü iptal eder.
 */
export function settleToAnchor(lenis: Lenis, target: HTMLElement): () => void {
  let raf = 0;
  let frames = 0;
  let stable = 0;
  let previousTop = Number.NaN;

  const step = () => {
    // Rota değişiminde belge yüksekliği değiştiği için Lenis'in önbelleklediği
    // sınır tazelenmeli, yoksa hedef eski sınıra göre kırpılabilir.
    lenis.resize();

    const top = absoluteTop(target);
    lenis.scrollTo(desiredScroll(target), { immediate: true, force: true });

    stable = top === previousTop ? stable + 1 : 0;
    previousTop = top;
    frames += 1;

    if (stable >= ANCHOR.stableFrames || frames >= ANCHOR.maxFrames) return;
    raf = requestAnimationFrame(step);
  };

  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}
