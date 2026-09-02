import { queryAll } from "../lib/dom";
import { gsap } from "../lib/gsap-setup";
import { EASE, MAGNETIC } from "../lib/motion-config";
import type { Scene } from "./types";

/** Mıknatıs etkisi verilecek birincil çağrı butonları. */
const MAGNETIC_SELECTOR = "[data-hero-actions] a, [data-contact-cta] a";

/**
 * İnce mıknatıs etkisi.
 *
 * Buton, imleci kendi merkezine göre sınırlı bir oranda takip eder.
 * Ölçüm yalnızca imleç butona girdiğinde bir kez yapılır; `pointermove`
 * içinde düzen okuması yoktur, dolayısıyla layout thrash oluşmaz.
 * `gsap.quickTo` her karede yeni tween üretmeden aynı tween'i günceller.
 */
export const magneticScene: Scene = ({ isFinePointer }) => {
  if (!isFinePointer) return;

  const targets = queryAll(MAGNETIC_SELECTOR);
  if (targets.length === 0) return;

  const cleanups: Array<() => void> = [];

  targets.forEach((element) => {
    const moveX = gsap.quickTo(element, "x", {
      duration: MAGNETIC.duration,
      ease: EASE.outExpo,
    });
    const moveY = gsap.quickTo(element, "y", {
      duration: MAGNETIC.duration,
      ease: EASE.outExpo,
    });

    let centerX = 0;
    let centerY = 0;

    const onEnter = () => {
      const rect = element.getBoundingClientRect();
      centerX = rect.left + rect.width / 2;
      centerY = rect.top + rect.height / 2;
    };

    const onMove = (event: PointerEvent) => {
      moveX((event.clientX - centerX) * MAGNETIC.strength);
      moveY((event.clientY - centerY) * MAGNETIC.strength);
    };

    const onLeave = () => {
      moveX(0);
      moveY(0);
    };

    element.addEventListener("pointerenter", onEnter);
    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerleave", onLeave);

    cleanups.push(() => {
      element.removeEventListener("pointerenter", onEnter);
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
    });
  });

  return () => cleanups.forEach((cleanup) => cleanup());
};
