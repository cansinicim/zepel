import { ScrollTrigger } from "./gsap-setup";
import { REFRESH_DEBOUNCE } from "./motion-config";

/**
 * Sayfa yüksekliğini değiştiren geç olayları izleyip ScrollTrigger'ı tazeler.
 *
 * Next/Image tembel yüklemesi ve web font yüklemesi düzeni kurulumdan sonra
 * değiştirir; tazeleme yapılmazsa tetikleyici konumları kayar.
 * Dönen fonksiyon tüm dinleyicileri söker.
 */
export function watchLayoutShifts(): () => void {
  let disposed = false;
  let timer: number | undefined;

  const refresh = () => {
    if (disposed) return;
    ScrollTrigger.refresh();
  };

  const refreshSoon = () => {
    if (disposed) return;
    window.clearTimeout(timer);
    timer = window.setTimeout(refresh, REFRESH_DEBOUNCE);
  };

  const pendingImages = Array.from(document.images).filter(
    (image) => !image.complete,
  );

  pendingImages.forEach((image) => {
    image.addEventListener("load", refreshSoon);
    image.addEventListener("error", refreshSoon);
  });

  window.addEventListener("load", refreshSoon);
  document.fonts?.ready.then(refreshSoon).catch(() => undefined);

  return () => {
    disposed = true;
    window.clearTimeout(timer);
    window.removeEventListener("load", refreshSoon);
    pendingImages.forEach((image) => {
      image.removeEventListener("load", refreshSoon);
      image.removeEventListener("error", refreshSoon);
    });
  };
}
