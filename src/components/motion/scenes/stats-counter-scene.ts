import { queryAll } from "../lib/dom";
import { gsap } from "../lib/gsap-setup";
import { runWhenInView } from "../lib/in-view";
import { COUNTER, EASE } from "../lib/motion-config";
import {
  createCounterFormatter,
  resolveFractionDigits,
} from "../lib/number-format";
import type { Scene } from "./types";

/**
 * Rakam şeridi sayaçları.
 *
 * Ham değer `data-stat-target` içinde durur, ekrandaki metin ise sunucuda
 * Türkçe biçimlendirilmiştir. Sayaç, biçimlenmiş hedefi metinde bulup önek
 * ve soneki ayırır; böylece "₺ 12,4 milyar" gibi bileşik değerlerde yalnızca
 * sayı kısmı animasyona girer ve bitiş metni sunucunun bastığıyla birebir
 * aynı olur.
 */
export const statsCounterScene: Scene = () => {
  const values = queryAll("[data-stat-value]");
  if (values.length === 0) return;

  const restorers: Array<() => void> = [];

  values.forEach((element) => {
    const target = Number(element.dataset.statTarget);
    if (!Number.isFinite(target)) return;

    const originalText = element.textContent ?? "";
    const format = createCounterFormatter(resolveFractionDigits(target));
    const formattedTarget = format(target);
    const splitAt = originalText.indexOf(formattedTarget);
    if (splitAt < 0) return;

    const prefix = originalText.slice(0, splitAt);
    const suffix = originalText.slice(splitAt + formattedTarget.length);
    const state = { value: 0 };

    const render = () => {
      element.textContent = `${prefix}${format(state.value)}${suffix}`;
    };

    restorers.push(() => {
      element.textContent = originalText;
    });

    render();

    runWhenInView(element, COUNTER.startRatio, () => {
      gsap.to(state, {
        value: target,
        duration: COUNTER.duration,
        ease: EASE.out,
        onUpdate: render,
        onComplete: () => {
          element.textContent = originalText;
        },
      });
    });
  });

  return () => restorers.forEach((restore) => restore());
};
