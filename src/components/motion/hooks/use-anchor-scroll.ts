"use client";

import { useEffect, type RefObject } from "react";
import type Lenis from "lenis";

import { scrollToAnchor } from "../lib/anchor-scroll";
import { focusAnchorTarget, resolveHashElement } from "../lib/dom";

/** Değiştirici tuşla veya orta tuşla yapılan tıklamalar tarayıcıya bırakılır. */
function isPlainClick(event: MouseEvent): boolean {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

/**
 * Bağlantının hedefi bu sayfa içindeyse ilgili elemanı döndürür.
 *
 * Yalnızca `#kimlik` kısayolu değil, aynı sayfayı tam yolla gösteren
 * (`/hizmetler#slug` gibi) bağlantılar da yakalanır: kullanıcı zaten o
 * sayfadayken bunlar da sayfa içi çıpadır ve yumuşak kaydırılmalıdır.
 */
function resolveSamePageTarget(anchor: HTMLAnchorElement): HTMLElement | null {
  const href = anchor.getAttribute("href");
  if (!href) return null;

  if (href.startsWith("#")) return resolveHashElement(href);

  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return null;
  if (url.pathname !== window.location.pathname) return null;

  return resolveHashElement(url.hash);
}

/**
 * Sayfa içi çıpa bağlantıları.
 *
 * Kaydırma Lenis üzerinden yumuşak yapılır ve hedefin `scroll-margin-top`
 * değeri (yoksa üst bar yüksekliği) kadar boşluk bırakılır. Odak da hedefe
 * taşınır; yumuşak kaydırma yüzünden atlama bağlantısının klavye davranışı
 * kaybolmaz.
 *
 * Yalnızca bulunulan sayfanın içindeki hedefler yakalanır. Başka bir sayfaya
 * giden çıpalar (örn. anasayfadan /hizmetler#slug) yönlendiriciye bırakılır;
 * yeni sayfa kurulduktan sonra hedefe kaydırmayı `MotionProvider` üstlenir.
 */
export function useAnchorScroll(
  lenisRef: RefObject<Lenis | null>,
  enabled: boolean,
): void {
  useEffect(() => {
    if (!enabled) return;

    const onClick = (event: MouseEvent) => {
      if (!isPlainClick(event)) return;

      const element = event.target;
      if (!(element instanceof Element)) return;

      const anchor = element.closest<HTMLAnchorElement>('a[href*="#"]');
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;

      const target = resolveSamePageTarget(anchor);
      if (!target) return;

      const lenis = lenisRef.current;
      if (!lenis) return;

      event.preventDefault();
      scrollToAnchor(lenis, target);
      focusAnchorTarget(target);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [enabled, lenisRef]);
}
