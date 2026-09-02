import { query, queryAll } from "../lib/dom";
import { gsap } from "../lib/gsap-setup";
import { EASE, STORY } from "../lib/motion-config";
import type { Scene } from "./types";

/**
 * Sinematik kaydırma bölümü, sitenin çekirdek anlatısı.
 *
 * Yapışkanlık CSS `position: sticky` ile kurulur, GSAP pin kullanılmaz;
 * böylece mobilde de aynı düzen bedelsiz çalışır.
 *
 * Zaman ekseni: adım sayısı n ise ana zaman çizelgesinin süresi n - 1
 * birimdir ve 1 birim tam olarak bir ekran yüksekliği kaydırmaya karşılık
 * gelir. Adım i, t = i anında ekranın ortasındadır; çapraz geçişler adım
 * sınırının ortasına (t = i + 0,5) yerleşir.
 *
 * Çapraz geçiş, iki görselin aynı anda soldurulmasıyla değil, üstteki
 * görselin sadece açılmasıyla yapılır: alttaki görsel opak kaldığı için
 * geçişte karartma çukuru oluşmaz.
 */
export const scrollStoryScene: Scene = ({ isMobile }) => {
  const section = query("[data-scroll-story]");
  if (!section) return;

  const track = query("[data-scroll-story-track]", section);
  const images = queryAll("[data-scroll-story-image]", section);
  const steps = queryAll("[data-scroll-story-step]", section);
  const progress = query("[data-scroll-story-progress]", section);

  if (!track || images.length < 2 || steps.length !== images.length) return;

  const lastIndex = images.length - 1;
  /** Zaman çizelgesinin toplam süresi. Hiçbir tween bunu aşmamalıdır. */
  const total = lastIndex;
  const clampDuration = (start: number, duration: number) =>
    Math.max(0.01, Math.min(duration, total - start));

  gsap.set(images, {
    opacity: (index: number) => (index === 0 ? 1 : 0),
    transformOrigin: "center center",
    willChange: "opacity, transform",
  });

  const setActiveStep = (index: number) => {
    section.dataset.activeStep = String(index + 1);
    steps.forEach((step, stepIndex) => {
      step.dataset.active = String(stepIndex === index);
    });
  };

  setActiveStep(0);

  const master = gsap.timeline({
    defaults: { ease: EASE.linear },
    scrollTrigger: {
      trigger: track,
      start: "top top",
      end: "bottom bottom",
      scrub: STORY.scrub,
      onUpdate: (self) => {
        const index = Math.min(
          lastIndex,
          Math.max(0, Math.round(self.progress * lastIndex)),
        );
        if (section.dataset.activeStep === String(index + 1)) return;
        setActiveStep(index);
      },
    },
  });

  // Toplam süreyi n - 1 birimde sabitleyen yer tutucu. Kaydırma eşlemesi
  // bu süreye göre kurulduğu için hiçbir tween eksenini uzatmamalıdır.
  master.to({}, { duration: total }, 0);

  if (progress) {
    gsap.set(progress, {
      scaleX: 1 / images.length,
      transformOrigin: "left center",
    });
    master.to(progress, { scaleX: 1, duration: total }, 0);
  }

  images.forEach((image, index) => {
    const at = index === 0 ? 0 : index - 1 + STORY.crossfadeOffset;

    if (index > 0) {
      master.to(
        image,
        {
          opacity: 1,
          duration: clampDuration(at, STORY.crossfadeDuration),
          ease: EASE.inOut,
        },
        at,
      );
    }

    if (!isMobile) {
      master.fromTo(
        image,
        { scale: STORY.kenBurnsScale },
        { scale: 1, duration: clampDuration(at, STORY.kenBurnsDuration) },
        at,
      );
    }
  });

  // Her adımın metin bloğu kendi ekranında girer ve çıkar.
  steps.forEach((step) => {
    const article = query("article", step);
    if (!article) return;

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: step,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });

    // Süreyi 1 birime sabitleyen boş yer tutucu: ilerleme eşlemesi böylece
    // adımın ekrandaki konumuyla birebir örtüşür.
    timeline.to({}, { duration: 1 }, 0);

    timeline.fromTo(
      article,
      { opacity: 0, y: STORY.textDistance },
      {
        opacity: 1,
        y: 0,
        duration: STORY.textIn.duration,
        ease: EASE.outSoft,
      },
      STORY.textIn.at,
    );

    timeline.to(
      article,
      {
        opacity: 0,
        y: -STORY.textDistance,
        duration: STORY.textOut.duration,
        ease: EASE.in,
      },
      STORY.textOut.at,
    );
  });
};
