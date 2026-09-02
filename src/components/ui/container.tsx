import type { ComponentPropsWithRef } from "react";

import { cn } from "@/lib/utils";

export type ContainerWidth = "narrow" | "content" | "wide" | "page" | "full";

const containerWidths: Record<ContainerWidth, string> = {
  narrow: "max-w-narrow", // uzun metin, tek sütun okuma
  content: "max-w-content", // standart içerik gridi
  wide: "max-w-wide", // geniş editoryal grid
  page: "max-w-page", // full-bleed öncesi sayfa üst sınırı
  full: "max-w-none", // kenardan kenara bölümler
};

export interface ContainerProps extends ComponentPropsWithRef<"div"> {
  width?: ContainerWidth;
  /** Yan boşluğu kaldırır, kenardan kenara medya blokları için. */
  bleed?: boolean;
}

export function Container({
  width = "content",
  bleed = false,
  className,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full",
        bleed ? "px-0" : "px-gutter",
        containerWidths[width],
        className,
      )}
      {...props}
    />
  );
}
