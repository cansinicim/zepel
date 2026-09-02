"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { settleToAnchor } from "./lib/anchor-scroll";
import { resolveHashElement } from "./lib/dom";
import { useAnchorScroll } from "./hooks/use-anchor-scroll";
import { usePrefersReducedMotion } from "./hooks/use-prefers-reduced-motion";
import { useScrollScenes } from "./hooks/use-scroll-scenes";
import { useSmoothScroll } from "./hooks/use-smooth-scroll";
import { PageTransition } from "./page-transition";

/**
 * Hareket katmanının tek giriş noktası.
 *
 * Bölümler server component olarak kalır; bu istemci sınırı DOM'u yalnızca
 * `data-*` kancaları üzerinden okur ve animasyonu bağlar. Kök düzene bir kez
 * eklenir, kendi başına görünür içerik üretmez (yalnızca geçiş perdesi).
 *
 * Rota değişiminde:
 * - sahneler `useScrollScenes` içinde geri alınıp yeniden kurulur,
 * - kaydırma başa döner, çıpalı gezinmede hedefe gider,
 * - perde kalkar.
 */
export function MotionProvider() {
  const pathname = usePathname();
  const prefersReducedMotion = usePrefersReducedMotion();
  const isEnabled = !prefersReducedMotion;

  const lenisRef = useSmoothScroll(isEnabled);

  useScrollScenes(pathname, isEnabled);
  useAnchorScroll(lenisRef, isEnabled);

  const isFirstRoute = useRef(true);

  useEffect(() => {
    if (isFirstRoute.current) {
      isFirstRoute.current = false;
      return;
    }

    const lenis = lenisRef.current;
    if (!lenis) return;

    const target = resolveHashElement(window.location.hash);

    if (!target) {
      lenis.scrollTo(0, { immediate: true, force: true });
      return;
    }

    // Çıpalı gezinme. Lenis her karede kendi konumunu yazdığı için
    // yönlendiricinin karma kaydırması geçersiz kalır; hedefe götürmeyi
    // hareket katmanı üstlenir.
    return settleToAnchor(lenis, target);
  }, [pathname, lenisRef]);

  return <PageTransition routeKey={pathname} enabled={isEnabled} />;
}
