import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Tailwind v4 CSS-first kurulumunda tokenlar `@theme` içinde tanımlandığı için
 * tailwind-merge varsayılan ölçekleri projenin özel token adlarını tanımaz.
 * Örneğin `text-display-lg` varsayılan yapılandırmada bir metin RENGİ sanılır
 * ve `text-accent` ile çakışıp yanlış sınıf elenir.
 *
 * Aşağıdaki kayıt defteri, `src/app/globals.css` içindeki token adlarının
 * birebir karşılığıdır. globals.css'e yeni bir token eklendiğinde buraya da
 * eklenmelidir.
 */
const themeTokens = {
  text: [
    "display-xl",
    "display-lg",
    "display-md",
    "display-sm",
    "heading-lg",
    "heading-md",
    "heading-sm",
    "body-lg",
    "body-md",
    "body-sm",
    "eyebrow",
  ],
  tracking: ["display", "eyebrow", "wide-caps"],
  leading: ["display", "prose"],
  spacing: ["gutter", "section", "section-sm", "block", "stack"],
  container: ["narrow", "content", "wide", "page"],
  radius: ["pill"],
  shadow: ["subtle", "soft", "lifted", "accent-glow"],
  ease: ["out-expo", "out-quart", "in-out-quart", "in-out-circ", "out-soft"],
} as const;

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [...themeTokens.text],
      tracking: [...themeTokens.tracking],
      leading: [...themeTokens.leading],
      spacing: [...themeTokens.spacing],
      container: [...themeTokens.container],
      radius: [...themeTokens.radius],
      shadow: [...themeTokens.shadow],
      ease: [...themeTokens.ease],
    },
  },
});

/** Koşullu sınıfları birleştirir ve Tailwind çakışmalarını çözer. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
