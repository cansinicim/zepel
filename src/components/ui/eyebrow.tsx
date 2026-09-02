import type { ComponentPropsWithRef } from "react";

import { cn } from "@/lib/utils";

/** Bulunduğu yüzeye göre renk ailesi. */
export type SurfaceTone = "dark" | "light";

export type EyebrowTone = SurfaceTone | "accent";

const eyebrowTones: Record<EyebrowTone, string> = {
  accent: "text-accent",
  dark: "text-text-muted", // koyu zemin üzerinde nötr
  light: "text-ink-text-muted", // kemik zemin üzerinde nötr
};

const ruleTones: Record<EyebrowTone, string> = {
  accent: "bg-accent",
  dark: "bg-border-strong",
  light: "bg-bone-border",
};

export interface EyebrowProps extends ComponentPropsWithRef<"span"> {
  tone?: EyebrowTone;
  /** Metnin önünde dekoratif 1px çizgi gösterir. */
  withRule?: boolean;
}

/**
 * Bölüm üstü küçük etiket. Büyük harf dönüşümü CSS ile yapılır;
 * kök `lang="tr"` sayesinde tarayıcı Türkçe büyük harf kurallarını uygular
 * (i harfi İ olur).
 */
export function Eyebrow({
  tone = "accent",
  withRule = false,
  className,
  children,
  ...props
}: EyebrowProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-3 font-sans text-eyebrow font-medium tracking-eyebrow uppercase",
        eyebrowTones[tone],
        className,
      )}
      {...props}
    >
      {withRule ? (
        <span
          aria-hidden="true"
          className={cn("h-px w-8 shrink-0", ruleTones[tone])}
        />
      ) : null}
      {children}
    </span>
  );
}
