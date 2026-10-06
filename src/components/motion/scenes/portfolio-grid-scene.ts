import { query, queryAll } from "../lib/dom";
import { gsap, ScrollTrigger } from "../lib/gsap-setup";
import { CARD, EASE } from "../lib/motion-config";
import type { Scene } from "./types";

const ROOT_SELECTOR = "[data-portfolio-browser]";
const GRID_SELECTOR = "ul";
const CARD_SELECTOR = "[data-property-card]";

/**
 * Portföy listesi girişi.
 *
 * Bu ızgara istemci tarafındaki filtreyle yeniden üretildiği için kaydırmaya
 * bağlı tek seferlik bir reveal yeterli olmaz; liste her değiştiğinde kartlar
 * kısa bir stagger ile yeniden girer.
 *
 * Gözlemci bilinçli olarak `<ul>`'a değil, her zaman DOM'da kalan bölüm köküne
 * bağlanır: filtre sonucu boşaldığında React `<ul>`'u tamamen kaldırıp yerine
 * boş durum bloğunu koyar. Izgaraya bağlı bir gözlemci o anda kopuk bir düğümü
 * izlemeye devam eder ve sonuç yeniden dolduğunda oluşan yeni `<ul>`'u hiç
 * görmezdi, animasyon o oturum boyunca sessizce ölürdü.
 */
export const portfolioGridScene: Scene = () => {
  const root = query(ROOT_SELECTOR);
  if (!root) return;

  /** Son görülen ızgara düğümü ve kart sayısı, gereksiz tekrarları eler. */
  let lastGrid: HTMLElement | null = null;
  let lastCount = -1;

  const sync = () => {
    const grid = query<HTMLElement>(GRID_SELECTOR, root);
    const cards = grid ? queryAll(CARD_SELECTOR, grid) : [];

    const gridChanged = grid !== lastGrid;
    const countChanged = cards.length !== lastCount;

    lastGrid = grid;
    lastCount = cards.length;

    // Boş sonuç durumunda animasyona girecek bir şey yok; yine de yukarıdaki
    // durum güncellendiği için liste geri geldiğinde değişim yakalanır.
    if (cards.length === 0) return;
    if (!gridChanged && !countChanged) return;

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

    ScrollTrigger.refresh();
  };

  sync();

  // `childList` yalnızca düğüm ekleme/çıkarmada tetiklenir; GSAP'in yazdığı
  // satır içi stiller gözlemciyi uyandırmaz, dolayısıyla döngü oluşmaz.
  const observer = new MutationObserver(sync);
  observer.observe(root, { childList: true, subtree: true });

  return () => observer.disconnect();
};
