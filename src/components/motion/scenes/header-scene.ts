import { query, queryAll } from "../lib/dom";
import { gsap, ScrollTrigger } from "../lib/gsap-setup";
import { EASE, HEADER } from "../lib/motion-config";
import type { Scene } from "./types";

/**
 * Sabit üst bar.
 *
 * Kaydırma yönü aşağıysa bar gizlenir, yukarıysa geri gelir. Sayfanın en
 * üstünde ve mobil menü açıkken her zaman görünür kalır. Zemin bulanıklığı
 * ve opaklık geçişi CSS tarafında `data-scrolled` ile zaten yapılır; burada
 * yalnızca konum animasyonu ve `data-hidden` durumu yönetilir.
 */
export const headerScene: Scene = () => {
  const header = query("[data-site-header]");
  if (!header) return;

  let isHidden = false;

  const show = () => {
    if (!isHidden) return;
    isHidden = false;
    header.dataset.hidden = "false";
    gsap.to(header, {
      yPercent: 0,
      duration: HEADER.showDuration,
      ease: EASE.outExpo,
      overwrite: true,
    });
  };

  const hide = () => {
    if (isHidden) return;
    isHidden = true;
    header.dataset.hidden = "true";
    gsap.to(header, {
      yPercent: -100,
      duration: HEADER.hideDuration,
      ease: EASE.in,
      overwrite: true,
    });
  };

  header.dataset.hidden = "false";

  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      if (header.dataset.menuOpen === "true") {
        show();
        return;
      }
      if (self.scroll() < HEADER.revealThreshold) {
        show();
        return;
      }
      if (self.direction === 1) hide();
      else show();
    },
  });

  // Mobil menü panelinin açılışı. Panel React tarafından `hidden` özniteliği
  // ile yönetildiği için açılış anı `data-menu-open` değişimiyle yakalanır.
  const observer = new MutationObserver(() => {
    if (header.dataset.menuOpen !== "true") return;

    const panel = query("[data-site-menu-panel]", header);
    if (!panel) return;

    gsap.fromTo(
      panel,
      { opacity: 0, y: -12 },
      {
        opacity: 1,
        y: 0,
        duration: HEADER.hideDuration,
        ease: EASE.outSoft,
        clearProps: "opacity,transform",
      },
    );

    const items = queryAll("[data-site-menu-item]", panel);
    if (items.length === 0) return;

    gsap.fromTo(
      items,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: EASE.outExpo,
        stagger: HEADER.menuItemStagger,
        clearProps: "opacity,transform",
      },
    );
  });

  observer.observe(header, {
    attributes: true,
    attributeFilter: ["data-menu-open"],
  });

  return () => {
    observer.disconnect();
    delete header.dataset.hidden;
  };
};
