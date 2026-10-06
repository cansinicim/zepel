import { query, queryAll } from "../lib/dom";
import { gsap } from "../lib/gsap-setup";
import { EASE, HERO } from "../lib/motion-config";
import type { Scene } from "./types";

/**
 * Tam ekran açılışın giriş hareketi.
 *
 * - Başlık satırları `overflow: clip` taşıyan maske kutusunun altından yukarı
 *   kayar (satır başına stagger).
 * - Eyebrow, gövde, çağrı butonları ve kaydırma ipucu gecikmeli girer.
 * - Aşağı kaydırıldıkça içerik yukarı kayarak solar.
 *
 * Bu sahne kırılım noktasından bağımsızdır ve rota başına yalnızca bir kez
 * kurulur. Medya katmanının parallax ve ken-burns hareketi `heroMediaScene`
 * içinde ayrı durur: orası cihaz koşuluna göre yeniden kurulabilir, buradaki
 * giriş ise asla tekrar oynamamalıdır.
 */
export const heroIntroScene: Scene = () => {
  const hero = query("[data-hero]");
  if (!hero) return;

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
};
