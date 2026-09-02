import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * GSAP çekirdeği ve eklenti kaydı, tek giriş noktası.
 *
 * Tüm motion modülleri gsap'i buradan alır; böylece eklenti kaydı bir kez
 * yapılır, çift kayıt ve sürüm çakışması oluşmaz. Kayıt bilinçli olarak
 * modül gövdesinde değil bir fonksiyonda yapılır: bu dosya SSR sırasında da
 * değerlendirilir, kayıt ise yalnızca istemcide çağrılır.
 */
let isRegistered = false;

export function registerGsap(): void {
  if (isRegistered) return;
  isRegistered = true;
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

export { gsap, ScrollTrigger };
