import { query, queryAll } from "../lib/dom";
import { gsap, ScrollTrigger } from "../lib/gsap-setup";
import { CARD, EASE } from "../lib/motion-config";
import type { Scene } from "./types";

const GRID_SELECTOR = "[data-portfolio-browser] ul";

/**
 * Portföy listesi girişi.
 *
 * Bu ızgara istemci tarafındaki filtreyle yeniden üretildiği için kaydırmaya
 * bağlı tek seferlik bir reveal yeterli olmaz. Liste her değiştiğinde kartlar
 * kısa bir stagger ile yeniden girer; boş sonuç durumunda hiçbir şey yapılmaz.
 */
export const portfolioGridScene: Scene = () => {
  const grid = query(GRID_SELECTOR);
  if (!grid) return;

  const playIntro = () => {
    const cards = queryAll("[data-property-card]", grid);
    if (cards.length === 0) return;

    gsap.fromTo(
      cards,
      { opacity: 0, y: CARD.gridDistance },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: EASE.outExpo,
        stagger: CARD.gridStagger,
        overwrite: "auto",
        clearProps: "opacity,transform",
      },
    );
  };

  playIntro();

  const observer = new MutationObserver(() => {
    playIntro();
    ScrollTrigger.refresh();
  });

  observer.observe(grid, { childList: true });

  return () => observer.disconnect();
};
