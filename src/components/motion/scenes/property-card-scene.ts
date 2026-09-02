import { gsap } from "../lib/gsap-setup";
import { CARD, EASE } from "../lib/motion-config";
import type { Scene } from "./types";

const CARD_SELECTOR = "[data-property-card]";
const BADGE_SELECTOR = ":scope > div > span";

/**
 * Mülk kartı hover'ı.
 *
 * Görseldeki yumuşak zoom CSS tarafında `group-hover` ile yapılır; burada
 * yalnızca kartın yükselmesi ve üst katmandaki ilan tipi rozetinin kayması
 * eklenir. Dinleyiciler belge düzeyinde temsilcidir: portföy filtresi kart
 * listesini yeniden ürettiğinde yeniden bağlanma gerekmez.
 */
export const propertyCardScene: Scene = ({ isFinePointer }) => {
  if (!isFinePointer) return;

  const animate = (card: HTMLElement, isActive: boolean) => {
    gsap.to(card, {
      y: isActive ? CARD.lift : 0,
      duration: CARD.duration,
      ease: EASE.outExpo,
      overwrite: "auto",
    });

    const badge = card.querySelector<HTMLElement>(BADGE_SELECTOR);
    if (!badge) return;

    gsap.to(badge, {
      y: isActive ? -4 : 0,
      duration: CARD.duration,
      ease: EASE.outExpo,
      overwrite: "auto",
    });
  };

  const resolveCard = (event: Event): HTMLElement | null => {
    const target = event.target;
    if (!(target instanceof Element)) return null;
    return target.closest<HTMLElement>(CARD_SELECTOR);
  };

  const onOver = (event: MouseEvent) => {
    const card = resolveCard(event);
    if (!card) return;
    const from = event.relatedTarget;
    if (from instanceof Node && card.contains(from)) return;
    animate(card, true);
  };

  const onOut = (event: MouseEvent) => {
    const card = resolveCard(event);
    if (!card) return;
    const to = event.relatedTarget;
    if (to instanceof Node && card.contains(to)) return;
    animate(card, false);
  };

  document.addEventListener("mouseover", onOver);
  document.addEventListener("mouseout", onOut);

  return () => {
    document.removeEventListener("mouseover", onOver);
    document.removeEventListener("mouseout", onOut);
  };
};
