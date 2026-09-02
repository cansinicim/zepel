"use client";

import { useEffect, useRef, type RefObject } from "react";
import Lenis from "lenis";

import { gsap, registerGsap, ScrollTrigger } from "../lib/gsap-setup";
import { SMOOTH_SCROLL } from "../lib/motion-config";

/**
 * Lenis yumuşak kaydırma ve GSAP senkronizasyonu.
 *
 * - Lenis kendi rAF döngüsünü kurmaz; kare üretimi GSAP ticker'ına devredilir,
 *   böylece kaydırma ve animasyonlar aynı karede ilerler.
 * - `lagSmoothing(0)`, sekme arka plana alınıp geri gelindiğinde scrub'lı
 *   animasyonların sıçramasını engeller.
 * - Dokunmatik cihazlarda `syncTouch` kapalıdır: parmakla kaydırma doğal
 *   kalır, ivme tarayıcıya bırakılır.
 *
 * Devre dışıyken (hareket azaltma tercihi) hiçbir örnek oluşturulmaz.
 */
export function useSmoothScroll(enabled: boolean): RefObject<Lenis | null> {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!enabled) return;

    registerGsap();

    const lenis = new Lenis({
      lerp: SMOOTH_SCROLL.lerp,
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: SMOOTH_SCROLL.touchMultiplier,
      wheelMultiplier: SMOOTH_SCROLL.wheelMultiplier,
      autoRaf: false,
      // Çıpa bağlantıları üst bar yüksekliğine göre ayrıca ele alınır.
      anchors: false,
    });

    lenisRef.current = lenis;

    const update = () => ScrollTrigger.update();
    lenis.on("scroll", update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.off("scroll", update);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [enabled]);

  return lenisRef;
}
