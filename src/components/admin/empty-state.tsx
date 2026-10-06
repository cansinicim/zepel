import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/** Liste boşken gösterilen açıklayıcı blok. */
export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 border border-dashed border-border px-6 py-10",
        className,
      )}
    >
      <p className="font-display text-heading-md text-text-primary">{title}</p>
      {description ? (
        <p className="max-w-narrow font-sans text-body-sm text-text-secondary">
          {description}
        </p>
      ) : null}
      {action}
    </div>
  );
}
