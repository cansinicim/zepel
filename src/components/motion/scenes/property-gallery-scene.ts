import { query } from "../lib/dom";
import { gsap } from "../lib/gsap-setup";
import { EASE } from "../lib/motion-config";
import type { Scene } from "./types";

/**
 * İlan galerisinde ana görsel değişimi.
 *
 * Galeri istemci bileşeni, seçilen görsel değiştiğinde `img` düğümünü
 * yenisiyle değiştirir. Yeni düğüm eklendiği anda yakalanıp yumuşak bir
 * açılışla girer. Küçük görsellerin aktif durumu CSS tarafında yönetilir.
 */
export const propertyGalleryScene: Scene = () => {
  const main = query("[data-property-gallery-main]");
  if (!main) return;

  const observer = new MutationObserver((records) => {
    records.forEach((record) => {
      record.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLImageElement)) return;
        gsap.fromTo(
          node,
          { opacity: 0, scale: 1.04 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.55,
            ease: EASE.outExpo,
            clearProps: "opacity,transform",
          },
        );
      });
    });
  });

  observer.observe(main, { childList: true });

  return () => observer.disconnect();
};
