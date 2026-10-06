"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { ADMIN_NAV_ITEMS, type AdminNavItem } from "./labels";

export interface AdminNavProps {
  /** Okunmamış talep sayısı. Veri okunamadıysa rozet gösterilmez. */
  newSubmissionCount: number | null;
  /** Rozetin ekran okuyucudaki açıklaması. */
  badgeLabel: string;
  ariaLabel: string;
}

function isActive(item: AdminNavItem, pathname: string): boolean {
  if (item.exact) {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/**
 * Panel kenar menüsü.
 *
 * Etkin bağlantı `aria-current="page"` taşır; vurgunun tek taşıyıcısı renk
 * değildir, sol kenardaki çizgi ve kalınlık da değişir.
 */
export function AdminNav({
  newSubmissionCount,
  badgeLabel,
  ariaLabel,
}: AdminNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label={ariaLabel}>
      <ul className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
        {ADMIN_NAV_ITEMS.map((item) => {
          const active = isActive(item, pathname);
          const showBadge =
            item.badge && newSubmissionCount !== null && newSubmissionCount > 0;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center justify-between gap-3 whitespace-nowrap",
                  "border-l-2 px-4 py-3 font-sans text-body-sm",
                  "transition-colors duration-[var(--duration-fast)] ease-out-expo",
                  active
                    ? "border-accent bg-elevated font-medium text-text-primary"
                    : "border-transparent text-text-secondary hover:bg-elevated hover:text-text-primary",
                )}
              >
                <span>{item.label}</span>

                {showBadge ? (
                  <span className="inline-flex min-w-6 items-center justify-center border border-accent px-2 py-0.5 font-sans text-eyebrow text-accent">
                    <span aria-hidden="true">{newSubmissionCount}</span>
                    <span className="sr-only">
                      {newSubmissionCount} {badgeLabel}
                    </span>
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
