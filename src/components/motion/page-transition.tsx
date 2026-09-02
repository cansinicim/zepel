"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";

import { gsap, registerGsap } from "./lib/gsap-setup";
import { EASE, PAGE_TRANSITION } from "./lib/motion-config";

export interface PageTransitionProps {
  /** Rota anahtarı. Değiştiğinde perde kalkar. */
  routeKey: string;
  enabled: boolean;
}

/**
 * Rota geçişi perdesi.
 *
 * Yeni sayfa boyandığı ilk karede perde kapalıdır, ardından yumuşakça
 * kalkar. Perde `useLayoutEffect` içinde kapatıldığı için ara kare
 * (yeni içeriğin çıplak görünmesi) oluşmaz.
 *
 * View Transitions API bilinçli olarak kullanılmadı: App Router tarafında
 * hâlâ deneysel bir bayrağa bağlı ve üretim yapılandırmasına deneysel bayrak
 * eklemek istemedik.
 */
export function PageTransition({ routeKey, enabled }: PageTransitionProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const isFirstRoute = useRef(true);

  useGSAP(
    () => {
      const overlay = overlayRef.current;
      if (!overlay) return;

      registerGsap();

      if (isFirstRoute.current) {
        isFirstRoute.current = false;
        return;
      }

      if (!enabled) return;

      gsap.fromTo(
        overlay,
        { autoAlpha: 1 },
        {
          autoAlpha: 0,
          duration: PAGE_TRANSITION.duration,
          ease: EASE.outSoft,
        },
      );
    },
    { dependencies: [routeKey, enabled], revertOnUpdate: true },
  );

  return (
    <div
      ref={overlayRef}
      data-page-transition
      aria-hidden="true"
      className="pointer-events-none invisible fixed inset-0 z-[70] bg-ink opacity-0"
    />
  );
}
