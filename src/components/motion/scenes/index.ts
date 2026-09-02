import { headerScene } from "./header-scene";
import { heroScene } from "./hero-scene";
import { magneticScene } from "./magnetic-scene";
import { portfolioGridScene } from "./portfolio-grid-scene";
import { propertyCardScene } from "./property-card-scene";
import { propertyGalleryScene } from "./property-gallery-scene";
import { revealScene } from "./reveal-scene";
import { scrollStoryScene } from "./scroll-story-scene";
import { statsCounterScene } from "./stats-counter-scene";
import type { Scene } from "./types";

/**
 * Sahne kaydı.
 *
 * Her sahne kendi `data-*` kancasını arar ve bulamazsa sessizce çıkar;
 * bu yüzden liste tüm rotalar için ortaktır. Yeni bir animasyon eklemek
 * yeni bir sahne dosyası ve buraya tek satır demektir.
 */
export const scenes: readonly Scene[] = [
  headerScene,
  heroScene,
  scrollStoryScene,
  revealScene,
  statsCounterScene,
  propertyCardScene,
  portfolioGridScene,
  propertyGalleryScene,
  magneticScene,
];

export type { Scene, SceneCleanup, SceneFlags } from "./types";
