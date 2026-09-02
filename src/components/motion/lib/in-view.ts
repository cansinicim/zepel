import { ScrollTrigger } from "./gsap-setup";

/**
 * Eleman görünüre girdiğinde bir kez çalışır.
 *
 * Kurulum anında eleman zaten eşiği geçmişse (tarayıcı kaydırma konumunu
 * geri yüklediğinde olur) ScrollTrigger beklenmeden doğrudan çalıştırılır.
 * Bu, "sayfa yenilenince içerik gizli kalıyor" hatasını engeller.
 */
export function runWhenInView(
  element: HTMLElement,
  startRatio: number,
  run: () => void,
): void {
  if (element.getBoundingClientRect().top < window.innerHeight * startRatio) {
    run();
    return;
  }

  ScrollTrigger.create({
    trigger: element,
    start: `top ${startRatio * 100}%`,
    once: true,
    onEnter: run,
  });
}
