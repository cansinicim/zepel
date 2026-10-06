"use client";

import type { MouseEvent, ReactNode } from "react";
import { useFormStatus } from "react-dom";

import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui";

export interface SubmitButtonProps {
  children: ReactNode;
  /** Gönderim sürerken gösterilecek metin. */
  pendingLabel: string;
  /**
   * Verilirse tıklamada onay istenir. Yayınlama ve arşivleme gibi etkili
   * işlemler için zorunlu tutulur; kullanıcı vazgeçerse gönderim yapılmaz.
   */
  confirmMessage?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  name?: string;
  value?: string;
  className?: string;
  describedBy?: string;
  disabled?: boolean;
}

/**
 * Form gönderim düğmesi.
 *
 * Bekleme durumunu `useFormStatus` ile kendi formundan okur, böylece her form
 * kendi durumunu ayrı ayrı taşımak zorunda kalmaz.
 */
export function SubmitButton({
  children,
  pendingLabel,
  confirmMessage,
  variant,
  size,
  name,
  value,
  className,
  describedBy,
  disabled = false,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
    if (confirmMessage !== undefined && !window.confirm(confirmMessage)) {
      event.preventDefault();
    }
  };

  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      name={name}
      value={value}
      className={className}
      disabled={disabled || pending}
      aria-describedby={describedBy}
      onClick={confirmMessage === undefined ? undefined : handleClick}
    >
      {pending ? pendingLabel : children}
    </Button>
  );
}
