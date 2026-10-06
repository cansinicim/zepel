import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import type { BadgeTone } from "./labels";

const toneStyles: Record<BadgeTone, string> = {
  neutral: "border-border-strong text-text-muted",
  accent: "border-accent text-accent",
  success: "border-success/60 text-success",
  warning: "border-warning/60 text-warning",
  danger: "border-danger/60 text-danger",
};

export interface StatusBadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}

/** Durum rozeti. Anlam yalnızca renkle değil metinle de taşınır. */
export function StatusBadge({
  tone = "neutral",
  children,
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 border px-3 py-1",
        "font-sans text-eyebrow tracking-wide-caps uppercase",
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
