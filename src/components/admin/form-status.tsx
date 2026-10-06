import { CircleAlert, CircleCheck } from "lucide-react";

import { cn } from "@/lib/utils";

import type { AdminFormStatus } from "./form-state";

export interface FormStatusMessageProps {
  /** Kontrollere `aria-describedby` ile bağlanabilmesi için sabit kimlik. */
  id: string;
  status: AdminFormStatus;
  message: string;
  pending?: boolean;
  pendingLabel?: string;
  className?: string;
}

/**
 * Form durum bildirimi.
 *
 * `aria-live="polite"` sayesinde ekran okuyucu, sayfa yeniden yüklenmeden
 * oluşan sonucu duyurur. Anlam yalnızca renkle taşınmaz, metin de değişir.
 */
export function FormStatusMessage({
  id,
  status,
  message,
  pending = false,
  pendingLabel,
  className,
}: FormStatusMessageProps) {
  const isSuccess = !pending && status === "success";
  const isError = !pending && status === "error";

  return (
    <p
      id={id}
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-start gap-3 font-sans text-body-sm",
        isSuccess && "text-success",
        isError && "text-danger",
        !isSuccess && !isError && "text-text-muted",
        className,
      )}
    >
      {isSuccess ? (
        <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      ) : null}
      {isError ? (
        <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      ) : null}
      <span>{pending ? (pendingLabel ?? message) : message}</span>
    </p>
  );
}
