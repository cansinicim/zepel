import type { ComponentPropsWithRef, ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Eyebrow, type SurfaceTone } from "@/components/ui/eyebrow";

export type SectionHeadingLevel = "h1" | "h2" | "h3";
export type SectionHeadingSize = "xl" | "lg" | "md" | "sm";
export type SectionHeadingAlign = "start" | "center";

const headingSizes: Record<SectionHeadingSize, string> = {
  xl: "text-display-xl",
  lg: "text-display-lg",
  md: "text-display-md",
  sm: "text-display-sm",
};

const alignStyles: Record<SectionHeadingAlign, string> = {
  start: "items-start text-left",
  center: "items-center text-center",
};

const titleTones: Record<SurfaceTone, string> = {
  dark: "text-text-primary",
  light: "text-ink-text",
};

const descriptionTones: Record<SurfaceTone, string> = {
  dark: "text-text-secondary",
  light: "text-ink-text-muted",
};

export interface SectionHeadingProps
  extends Omit<ComponentPropsWithRef<"div">, "title"> {
  /** Bölüm üstü küçük etiket. Metin dışarıdan verilir. */
  eyebrow?: ReactNode;
  title: ReactNode;
  /** Başlık elemanının id'si. Bölümü `aria-labelledby` ile adlandırmak için. */
  titleId?: string;
  description?: ReactNode;
  /** Sayfadaki başlık hiyerarşisine göre seçilir, görsel boyuttan bağımsızdır. */
  as?: SectionHeadingLevel;
  size?: SectionHeadingSize;
  align?: SectionHeadingAlign;
  /** Bulunduğu yüzeyin rengi, metin kontrastını belirler. */
  tone?: SurfaceTone;
}

export function SectionHeading({
  eyebrow,
  title,
  titleId,
  description,
  as: Heading = "h2",
  size = "md",
  align = "start",
  tone = "dark",
  className,
  ...props
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-stack",
        alignStyles[align],
        className,
      )}
      {...props}
    >
      {eyebrow ? (
        <Eyebrow tone={tone === "light" ? "light" : "accent"} withRule>
          {eyebrow}
        </Eyebrow>
      ) : null}

      <Heading
        id={titleId}
        className={cn("font-display", headingSizes[size], titleTones[tone])}
      >
        {title}
      </Heading>

      {description ? (
        <p
          className={cn(
            "max-w-narrow font-sans text-body-lg",
            descriptionTones[tone],
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
