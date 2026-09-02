import type { ComponentPropsWithRef } from "react";

import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "outline" | "ghost" | "link";
export type ButtonSize = "sm" | "md" | "lg";

const buttonBase = [
  "inline-flex items-center justify-center gap-2",
  "font-sans font-medium whitespace-nowrap select-none",
  "rounded-xs",
  "transition-[background-color,border-color,color,opacity,box-shadow]",
  "duration-[var(--duration-fast)] ease-out-expo",
  "disabled:pointer-events-none disabled:opacity-45",
].join(" ");

const buttonSizes: Record<ButtonSize, string> = {
  // h-9 = 36px, yoğun arayüzler için
  sm: "h-9 px-4 text-body-sm",
  // h-11 = 44px, önerilen minimum dokunma hedefi
  md: "h-11 px-6 text-body-sm",
  // h-13 = 52px, hero ve birincil çağrılar
  lg: "h-13 px-8 text-body-md",
};

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-ink hover:bg-accent-hover active:bg-accent",
  outline:
    "border border-border-strong bg-transparent text-text-primary hover:border-accent hover:text-accent",
  ghost:
    "bg-transparent text-text-secondary hover:bg-elevated hover:text-text-primary",
  link: "h-auto bg-transparent p-0 text-accent underline decoration-border-strong underline-offset-4 hover:decoration-accent",
};

export interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

/**
 * Buton görsel stilini sınıf dizesi olarak üretir.
 * `next/link` gibi buton olmayan elemanlara aynı stili vermek için kullanılır.
 */
export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: ButtonStyleOptions = {}): string {
  // Varyant, boyuttan sonra gelir; böylece `link` varyantı dolgu/yükseklik
  // sınıflarını tailwind-merge üzerinden geçersiz kılabilir.
  return cn(buttonBase, buttonSizes[size], buttonVariants[variant], className);
}

export interface ButtonProps extends ComponentPropsWithRef<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonStyles({ variant, size, className })}
      {...props}
    />
  );
}
