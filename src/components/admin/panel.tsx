import type { ComponentPropsWithRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Panelin tüm kart yüzeyleri bu sınıfı paylaşır. */
export const panelClass = "border border-border bg-surface";

/**
 * `title` burada bir düğüm (ReactNode) olarak kullanılır, oysa `section`
 * elemanının yerel `title` özniteliği yalnızca metin kabul eder. Yerel
 * öznitelik dışarıda bırakılır, aksi halde iki anlam çakışır.
 */
export interface PanelProps
  extends Omit<ComponentPropsWithRef<"section">, "title"> {
  /** Başlık verilirse bölüm otomatik olarak `aria-labelledby` ile adlandırılır. */
  title?: ReactNode;
  titleId?: string;
  description?: ReactNode;
  /** Başlığın sağındaki eylem alanı. */
  actions?: ReactNode;
  headingLevel?: "h2" | "h3";
}

/**
 * Panel kartı: kenarlıklı yüzey, isteğe bağlı başlık ve eylem alanı.
 * Sayfa düzeni bu bileşen üzerinden kurulur, kart stilleri tekrarlanmaz.
 */
export function Panel({
  title,
  titleId,
  description,
  actions,
  headingLevel: Heading = "h2",
  className,
  children,
  ...props
}: PanelProps) {
  return (
    <section
      aria-labelledby={title && titleId ? titleId : undefined}
      className={cn(panelClass, "flex flex-col gap-6 p-6", className)}
      {...props}
    >
      {title ? (
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Heading
              id={titleId}
              className="font-display text-heading-lg text-text-primary"
            >
              {title}
            </Heading>
            {description ? (
              <p className="font-sans text-body-sm text-text-muted">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
        </div>
      ) : null}

      {children}
    </section>
  );
}
