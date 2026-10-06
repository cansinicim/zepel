import { query } from "../lib/dom";
import { gsap } from "../lib/gsap-setup";
import { EASE, HERO } from "../lib/motion-config";
import type { Scene } from "./types";

/**
 * Açılış görselinin hareketi: yavaş ken-burns ve kaydırmada parallax.
 *
 * Cihaz koşuluna duyarlıdır, mobilde tamamen kapalıdır; bu yüzden giriş
 * hareketinden ayrı bir sahnedir ve koşul değiştiğinde tek başına yeniden
 * kurulabilir. Görünür bir "giriş" üretmediği için yeniden kurulum ekranda
 * sıçrama yaratmaz.
 *
 * Medya katmanına verilen taban ölçek, parallax kayması sırasında kenarda
 * boşluk açılmasını engeller: ölçek s için taşma payı (s - 1) / 2'dir ve
 * kayma yüzdesi bu payın altında tutulur.
 */
export const heroMediaScene: Scene = ({ isMobile }) => {
  if (isMobile) return;

  const hero = query("[data-hero]");
  if (!hero) return;

  const media = query("[data-hero-media]", hero);
  if (!media) return;

  gsap.fromTo(
    media,
    { scale: HERO.mediaScale },
    {
      scale: HERO.mediaScaleDrift,
      duration: HERO.kenBurnsDuration,
      ease: EASE.linear,
      repeat: -1,
      yoyo: true,
      // Hero ekrandan çıkınca döngü durur, boşa kare üretilmez.
      scrollTrigger: {
        trigger: hero,
        start: "top bottom",
        end: "bottom top",
        toggleActions: "play pause resume pause",
      },
    },
  );

  gsap.to(media, {
    yPercent: HERO.parallaxPercent,
    ease: EASE.linear,
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });
};
