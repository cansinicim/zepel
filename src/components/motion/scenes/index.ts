import { headerScene } from "./header-scene";
import { heroIntroScene } from "./hero-intro-scene";
import { heroMediaScene } from "./hero-media-scene";
import { magneticScene } from "./magnetic-scene";
import { portfolioGridScene } from "./portfolio-grid-scene";
import { propertyCardScene } from "./property-card-scene";
import { propertyGalleryScene } from "./property-gallery-scene";
import { revealScene } from "./reveal-scene";
import { scrollStoryScene } from "./scroll-story-scene";
import { statsCounterScene } from "./stats-counter-scene";
import type { Scene } from "./types";

/**
 * Sahne kaydı, iki gruba ayrılır.
 *
 * Her sahne kendi `data-*` kancasını arar ve bulamazsa sessizce çıkar; bu
 * yüzden listeler tüm rotalar için ortaktır.
 *
 * Ayrım şart: tek bir `matchMedia` grubunda toplandıklarında, koşullardan
 * herhangi biri değişince (telefon döndürmede 768px sınırının aşılması gibi)
 * GSAP bağlamı komple geri alıp her şeyi baştan kurar. O anda ekranda görünen
 * `data-reveal` blokları yeniden `opacity: 0` yapılıp animasyona girer
 * (kaybolup belirme flaşı), sayaçlar sıfırdan başlar.
 */

/**
 * Kırılım noktasından bağımsız sahneler: rota başına bir kez kurulur.
 * Yeniden kurulmaları görünür içeriği bozacağı için `matchMedia` dışındadır.
 */
export const staticScenes: readonly Scene[] = [
  headerScene,
  heroIntroScene,
  scrollStoryScene,
  revealScene,
  statsCounterScene,
  portfolioGridScene,
  propertyGalleryScene,
];

/**
 * Cihaz koşuluna duyarlı sahneler: koşul değiştiğinde sökülüp yeniden kurulur.
 * Hiçbiri görünür bir giriş hareketi üretmez (parallax, hover, mıknatıs),
 * bu yüzden yeniden kurulum ekranda sıçrama yaratmaz.
 */
export const responsiveScenes: readonly Scene[] = [
  heroMediaScene,
  propertyCardScene,
  magneticScene,
];

export type { Scene, SceneCleanup, SceneFlags } from "./types";
