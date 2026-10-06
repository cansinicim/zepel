import { queryAll } from "../lib/dom";
import { gsap, ScrollTrigger } from "../lib/gsap-setup";
import { EASE, REVEAL } from "../lib/motion-config";
import type { Scene } from "./types";

const REVEAL_SELECTOR = "[data-reveal]";
/** Girişini tamamlamış bloklar işaretlenir, bir daha gizlenmezler. */
const REVEALED_ATTRIBUTE = "data-revealed";

/**
 * Genel giriş animasyonu.
 *
 * `data-reveal` taşıyan tüm bloklar tek bir `ScrollTrigger.batch` ile ele
 * alınır; her eleman için ayrı tetikleyici kurulmaz. Başlangıç durumu CSS'e
 * gömülmez, burada `gsap.set` ile verilir: JavaScript çalışmazsa içerik
 * olduğu gibi görünür kalır.
 */
export const revealScene: Scene = ({ isMobile }) => {
  const targets = queryAll(REVEAL_SELECTOR);
  if (targets.length === 0) return;

  const distance = isMobile ? REVEAL.distanceCompact : REVEAL.distance;

  // Kurulum anında ekranın üstünde kalmış bloklara hiç dokunulmaz; varsayılan
  // hâlleriyle görünür kalırlar. Girişini bir kez tamamlamış bloklar da
  // atlanır: sahne herhangi bir nedenle yeniden kurulursa ekranda duran
  // içerik tekrar gizlenip animasyona sokulmaz.
  const pending = targets.filter(
    (element) =>
      !element.hasAttribute(REVEALED_ATTRIBUTE) &&
      element.getBoundingClientRect().bottom > 0,
  );

  if (pending.length === 0) return;

  gsap.set(pending, { opacity: 0, y: distance, willChange: "transform, opacity" });

  ScrollTrigger.batch(pending, {
    start: REVEAL.start,
    once: true,
    onEnter: (batch) => {
      batch.forEach((element) => element.setAttribute(REVEALED_ATTRIBUTE, ""));
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: REVEAL.duration,
        ease: EASE.outExpo,
        stagger: REVEAL.stagger,
        overwrite: "auto",
        clearProps: "willChange",
      });
    },
  });
};
