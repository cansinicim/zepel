import type { ReactNode } from "react";

import { Eyebrow } from "@/components/ui";

export interface AdminPageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Başlığın sağındaki eylem alanı. */
  actions?: ReactNode;
}

/**
 * Sayfa başlığı. Her panel sayfasında tek `h1` bu bileşenden gelir.
 */
export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: AdminPageHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-6">
      <div className="flex flex-col gap-3">
        {eyebrow ? <Eyebrow withRule>{eyebrow}</Eyebrow> : null}
        <h1 className="font-display text-display-sm text-text-primary">{title}</h1>
        {description ? (
          <p className="max-w-narrow font-sans text-body-md text-text-secondary">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </header>
  );
}
