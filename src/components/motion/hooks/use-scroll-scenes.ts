"use client";

import { useGSAP } from "@gsap/react";

import { exposeMotionDebug } from "../lib/debug";
import { gsap, registerGsap, ScrollTrigger } from "../lib/gsap-setup";
import { BREAKPOINT_MD } from "../lib/motion-config";
import { watchLayoutShifts } from "../lib/refresh";
import {
  responsiveScenes,
  staticScenes,
  type SceneCleanup,
  type SceneFlags,
} from "../scenes";

const DESKTOP_QUERY = `(min-width: ${BREAKPOINT_MD}px)`;
const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

type MediaConditions = {
  isDesktop: boolean;
  isMobile: boolean;
  isFinePointer: boolean;
};

/** Kurulum anındaki cihaz koşulları, kırılımdan bağımsız sahneler için. */
function readSceneFlags(): SceneFlags {
  const isDesktop = window.matchMedia(DESKTOP_QUERY).matches;
  return {
    isDesktop,
    isMobile: !isDesktop,
    isFinePointer: window.matchMedia(FINE_POINTER_QUERY).matches,
  };
}

function runScenes(
  scenes: readonly ((flags: SceneFlags) => SceneCleanup | void)[],
  flags: SceneFlags,
): SceneCleanup[] {
  return scenes
    .map((scene) => scene(flags))
    .filter((cleanup): cleanup is SceneCleanup => Boolean(cleanup));
}

/**
 * Tüm sahneleri kurar ve rota değişiminde baştan kurar.
 *
 * Kurulum iki aşamalıdır:
 *
 * 1. Kırılımdan bağımsız sahneler doğrudan `useGSAP` bağlamında, rota başına
 *    bir kez kurulur. Böylece pencere yeniden boyutlandığında ya da telefon
 *    döndürüldüğünde ekranda duran içerik yeniden gizlenip animasyona girmez,
 *    sayaçlar sıfırdan başlamaz.
 * 2. Yalnızca cihaz koşuluna duyarlı sahneler `gsap.matchMedia` içinde durur;
 *    koşul değişince sadece onlar sökülüp yeniden kurulur.
 *
 * Her iki grup da aynı GSAP bağlamında oluşturulduğu için rota değişiminde
 * `revertOnUpdate` hepsini geri alır; ScrollTrigger'lar birikmez.
 *
 * Hareket azaltma tercihinde (`enabled` false) hiçbir sahne çalışmaz; hiçbir
 * eleman `opacity: 0` ile başlatılmaz, içerik son hâliyle görünür kalır.
 */
export function useScrollScenes(pathname: string, enabled: boolean): void {
  useGSAP(
    () => {
      if (!enabled) return;

      registerGsap();

      const staticCleanups = runScenes(staticScenes, readSceneFlags());

      const mediaQuery = gsap.matchMedia();

      // `isDesktop` ve `isMobile` birlikte verilir: ikisinden biri her zaman
      // eşleştiği için grup her cihazda etkinleşir. Tek başına `isFinePointer`
      // bırakılsaydı dokunmatik bir tablette hiçbir koşul eşleşmez, hero
      // parallax'ı sessizce kurulmazdı.
      mediaQuery.add(
        {
          isDesktop: DESKTOP_QUERY,
          isMobile: `(max-width: ${BREAKPOINT_MD - 0.02}px)`,
          isFinePointer: FINE_POINTER_QUERY,
        },
        (context) => {
          const conditions = context.conditions as MediaConditions | undefined;
          if (!conditions) return;

          const flags: SceneFlags = {
            isDesktop: conditions.isDesktop,
            isMobile: conditions.isMobile,
            isFinePointer: conditions.isFinePointer,
          };

          const cleanups = runScenes(responsiveScenes, flags);
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
        staticCleanups.forEach((cleanup) => cleanup());
      };
    },
    { dependencies: [pathname, enabled], revertOnUpdate: true },
  );
}
