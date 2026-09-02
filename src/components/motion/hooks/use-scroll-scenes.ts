"use client";

import { useGSAP } from "@gsap/react";

import { exposeMotionDebug } from "../lib/debug";
import { gsap, registerGsap, ScrollTrigger } from "../lib/gsap-setup";
import { BREAKPOINT_MD } from "../lib/motion-config";
import { watchLayoutShifts } from "../lib/refresh";
import { scenes, type SceneCleanup, type SceneFlags } from "../scenes";

type MediaConditions = {
  isDesktop: boolean;
  isMobile: boolean;
  isFinePointer: boolean;
  prefersReducedMotion: boolean;
};

/**
 * Tüm sahneleri kurar ve rota değişiminde baştan kurar.
 *
 * - `useGSAP` + `revertOnUpdate`, rota değişiminde önceki bağlamı geri alır;
 *   ScrollTrigger'lar birikmez, orphan tetikleyici kalmaz.
 * - `gsap.matchMedia` kırılım noktası ve hareket tercihi değişimlerinde
 *   sahneleri kendiliğinden söküp yeniden kurar.
 * - Hareket azaltma tercihinde hiçbir sahne çalışmaz; hiçbir eleman
 *   `opacity: 0` ile başlatılmaz, içerik son hâliyle görünür kalır.
 */
export function useScrollScenes(pathname: string, enabled: boolean): void {
  useGSAP(
    () => {
      if (!enabled) return;

      registerGsap();

      const mediaQuery = gsap.matchMedia();

      mediaQuery.add(
        {
          isDesktop: `(min-width: ${BREAKPOINT_MD}px)`,
          isMobile: `(max-width: ${BREAKPOINT_MD - 0.02}px)`,
          isFinePointer: "(hover: hover) and (pointer: fine)",
          prefersReducedMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const conditions = context.conditions as MediaConditions | undefined;
          if (!conditions || conditions.prefersReducedMotion) return;

          const flags: SceneFlags = {
            isDesktop: conditions.isDesktop,
            isMobile: conditions.isMobile,
            isFinePointer: conditions.isFinePointer,
          };

          const cleanups = scenes
            .map((scene) => scene(flags))
            .filter((cleanup): cleanup is SceneCleanup => Boolean(cleanup));

          return () => cleanups.forEach((cleanup) => cleanup());
        },
      );

      const stopWatching = watchLayoutShifts();
      const hideDebug = exposeMotionDebug();
      const refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());

      return () => {
        cancelAnimationFrame(refreshFrame);
        stopWatching();
        hideDebug();
        mediaQuery.revert();
      };
    },
    { dependencies: [pathname, enabled], revertOnUpdate: true },
  );
}
