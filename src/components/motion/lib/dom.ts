/**
 * DOM seçim yardımcıları.
 *
 * Sahneler bölümleri `data-*` kancaları üzerinden bulur; böylece bölümler
 * server component olarak kalır ve hareket katmanı yalnızca okunan bir
 * sözleşmeye bağlanır.
 */

export function query<T extends HTMLElement = HTMLElement>(
  selector: string,
  root: ParentNode = document,
): T | null {
  return root.querySelector<T>(selector);
}

export function queryAll<T extends HTMLElement = HTMLElement>(
  selector: string,
  root: ParentNode = document,
): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

/**
 * `#kimlik` biçimindeki karma değerinden hedef elemanı çözer.
 * Hem tıklama yakalayıcısı hem rota geçişi aynı çözümlemeyi kullanır.
 */
export function resolveHashElement(hash: string): HTMLElement | null {
  if (!hash.startsWith("#") || hash.length < 2) return null;

  let id = hash.slice(1);
  try {
    id = decodeURIComponent(id);
  } catch {
    // Bozuk kodlamada ham değerle devam edilir.
  }
  return document.getElementById(id);
}

/** Sabit üst barın o anki yüksekliği, çıpa kaydırmasında ofset olarak kullanılır. */
export function getHeaderHeight(): number {
  const header = query("[data-site-header]");
  return header ? header.getBoundingClientRect().height : 0;
}

/**
 * Çıpa hedefinin üstünde bırakılacak boşluk.
 * Önce elemanın kendi `scroll-margin-top` değeri okunur (tasarım katmanı
 * bunu `scroll-mt-*` ile veriyor), yoksa üst bar yüksekliğine düşülür.
 */
export function getAnchorOffset(target: HTMLElement): number {
  const scrollMargin = Number.parseFloat(
    window.getComputedStyle(target).scrollMarginTop,
  );
  if (Number.isFinite(scrollMargin) && scrollMargin > 0) return scrollMargin;
  return getHeaderHeight();
}

/**
 * Kaydırma sonrası odağı hedefe taşır. Atlama bağlantılarının klavye
 * erişilebilirliği yumuşak kaydırma yüzünden kaybolmamalıdır.
 */
export function focusAnchorTarget(target: HTMLElement): void {
  if (!target.hasAttribute("tabindex")) {
    target.setAttribute("tabindex", "-1");
    target.addEventListener(
      "blur",
      () => target.removeAttribute("tabindex"),
      { once: true },
    );
  }
  target.focus({ preventScroll: true });
}
