import { ScrollTrigger } from "./gsap-setup";

/**
 * Hareket katmanı hata ayıklama köprüsü.
 *
 * Yalnızca `NEXT_PUBLIC_MOTION_DEBUG=1` ile derlenmiş yapılarda etkindir;
 * varsayılan üretim paketine hiçbir şey eklemez. ScrollTrigger sayısını
 * dışarı açar, böylece rota geçişlerinde tetikleyici birikmediği tarayıcıdan
 * ölçülerek doğrulanabilir.
 */
const DEBUG_KEY = "__zepelMotion";

type MotionDebugBridge = {
  scrollTriggerCount: () => number;
  scrollTriggerSummary: () => string[];
};

declare global {
  interface Window {
    [DEBUG_KEY]?: MotionDebugBridge;
  }
}

export function isMotionDebugEnabled(): boolean {
  return process.env.NEXT_PUBLIC_MOTION_DEBUG === "1";
}

export function exposeMotionDebug(): () => void {
  if (!isMotionDebugEnabled()) return () => undefined;

  const describe = (element: Element | undefined): string => {
    if (!element) return "(tetikleyicisiz)";
    const hook = element
      .getAttributeNames()
      .filter((name) => name.startsWith("data-"))
      .join(",");
    return `${element.tagName.toLowerCase()}[${hook || "kancasız"}]`;
  };

  window[DEBUG_KEY] = {
    scrollTriggerCount: () => ScrollTrigger.getAll().length,
    scrollTriggerSummary: () =>
      ScrollTrigger.getAll().map((trigger) => describe(trigger.trigger)),
  };

  return () => {
    delete window[DEBUG_KEY];
  };
}
