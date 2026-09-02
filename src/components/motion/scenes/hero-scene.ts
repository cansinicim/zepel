import { query, queryAll } from "../lib/dom";
import { gsap } from "../lib/gsap-setup";
import { EASE, HERO } from "../lib/motion-config";
import type { Scene } from "./types";

/**
 * Tam ekran açılış.
 *
 * - Başlık satırları `overflow: clip` taşıyan maske kutusunun altından yukarı
 *   kayar (satır başına stagger).
 * - Eyebrow, gövde, çağrı butonları ve kaydırma ipucu gecikmeli girer.
 * - Masaüstünde medya katmanı yavaş ken-burns yapar ve kaydırmada parallax
 *   olarak geri kalır; içerik yukarı kayarak solar.
 *
 * Medya katmanına verilen taban ölçek, parallax kayması sırasında kenarda
 * boşluk açılmasını engeller: ölçek s için taşma payı (s - 1) / 2'dir ve
 * kayma yüzdesi bu payın altında tutulur.
 */
export const heroScene: Scene = ({ isMobile }) => {
  const hero = query("[data-hero]");
  if (!hero) return;

  const media = query("[data-hero-media]", hero);
  const lines = queryAll("[data-hero-line]", hero);
  const eyebrow = query("[data-hero-eyebrow]", hero);
  const body = query("[data-hero-body]", hero);
  const actions = query("[data-hero-actions]", hero);
  const hint = query("[data-hero-scroll-hint]", hero);
  const content = query(":scope > div:not([data-hero-media])", hero);

  const intro = gsap.timeline({
    defaults: { ease: EASE.outExpo },
    delay: 0.1,
  });

  if (lines.length > 0) {
    intro.fromTo(
      lines,
      { yPercent: HERO.lineOffsetPercent },
      {
        yPercent: 0,
        duration: HERO.lineDuration,
        stagger: HERO.lineStagger,
      },
      0,
    );
  }

  if (eyebrow) {
    intro.fromTo(
      eyebrow,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.8 },
      0.15,
    );
  }

  if (body) {
    intro.fromTo(
      body,
      { opacity: 0, y: 22 },
      { opacity: 1, y: 0, duration: 0.9 },
      0.45,
    );
  }

  if (actions) {
    intro.fromTo(
      actions,
      { opacity: 0, y: 22 },
      { opacity: 1, y: 0, duration: 0.9 },
      0.58,
    );
  }

  if (hint) {
    intro.fromTo(
      hint,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.8 },
      0.72,
    );

    // Kaydırma ipucundaki dikey çizgi sonsuz döngüde nefes alır.
    const rule = query("span", hint);
    if (rule) {
      gsap.fromTo(
        rule,
        { scaleY: 0.2, transformOrigin: "top center" },
        {
          scaleY: 1,
          duration: 1.4,
          ease: EASE.inOut,
          repeat: -1,
          yoyo: true,
          delay: 1.2,
        },
      );
    }
  }

  if (content) {
    gsap.to(content, {
      opacity: 0,
      yPercent: -12,
      ease: EASE.linear,
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: HERO.contentFadeEnd,
        scrub: true,
      },
    });
  }

  if (media && !isMobile) {
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
  }
};
