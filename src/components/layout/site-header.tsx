"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone, X } from "lucide-react";

import { ZepelLogo } from "@/components/brand/zepel-logo";
import { buttonStyles, Container } from "@/components/ui";
import { navigation } from "@/content/pages";
import { contactInfo, navItems } from "@/content/site";
import { cn } from "@/lib/utils";

const MOBILE_PANEL_ID = "zepel-mobil-menu";
const SCROLL_THRESHOLD = 8;

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled])';

/** Aktif rota tespiti: anasayfa tam eşleşme, diğerleri önek eşleşmesi. */
function isActivePath(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/**
 * Sabit üst bar.
 *
 * JS mantığı bilinçli olarak asgari tutulmuştur: kaydırma durumu React state'i
 * yerine doğrudan `data-scrolled` özniteliğine yazılır, böylece her scroll
 * olayında yeniden render olmaz ve motion katmanı aynı özniteliği devralabilir.
 */
export function SiteHeader() {
  const headerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  /**
   * Menü durumu, açıldığı rota ile birlikte tutulur. Böylece gezinme sonrası
   * menünün kapanması bir efektten değil, türetilmiş değerden gelir.
   */
  const [menuState, setMenuState] = useState({ isOpen: false, path: pathname });
  const isMenuOpen = menuState.isOpen && menuState.path === pathname;

  const closeMenu = () => setMenuState({ isOpen: false, path: pathname });
  const toggleMenu = () =>
    setMenuState((previous) => ({
      isOpen: !(previous.isOpen && previous.path === pathname),
      path: pathname,
    }));

  // Kaydırma durumu, sadece öznitelik güncellemesi.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const update = () => {
      header.dataset.scrolled = String(window.scrollY > SCROLL_THRESHOLD);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  // Menü açıkken: gövde kaydırması kilitli, ESC kapatır, odak panel içinde döner.
  useEffect(() => {
    const panel = panelRef.current;
    if (!isMenuOpen || !panel) return;

    const currentPath = pathname;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const getFocusable = () =>
      Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));

    getFocusable()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuState({ isOpen: false, path: currentPath });
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = getFocusable();
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [isMenuOpen, pathname]);

  return (
    <header
      ref={headerRef}
      data-site-header
      data-scrolled="false"
      data-menu-open={isMenuOpen}
      className={cn(
        "fixed inset-x-0 top-0 z-50",
        "border-b border-transparent",
        "transition-[background-color,border-color,backdrop-filter]",
        "duration-[var(--duration-base)] ease-out-expo",
        "data-[scrolled=true]:border-border data-[scrolled=true]:bg-ink/85 data-[scrolled=true]:backdrop-blur-md",
        "data-[menu-open=true]:border-border data-[menu-open=true]:bg-ink",
      )}
    >
      <Container
        width="page"
        className="flex h-16 items-center justify-between gap-4 md:h-20"
      >
        <Link
          href="/"
          className="text-text-primary transition-colors duration-[var(--duration-fast)] hover:text-accent"
        >
          <ZepelLogo variant="horizontal" className="text-[15px] md:text-[17px]" />
          {/* Erişilebilir ad, görünen marka metnini kapsar; ek bağlam
              görünmez metinle verilir. */}
          <span className="sr-only">, {navigation.homeLinkSuffix}</span>
        </Link>

        <nav
          aria-label={navigation.primaryNavLabel}
          className="hidden lg:flex lg:items-center lg:gap-8"
        >
          {navItems.map((item) => {
            const isActive = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "font-sans text-body-sm transition-colors duration-[var(--duration-fast)]",
                  isActive
                    ? "text-accent"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href={contactInfo.phoneHref}
            aria-label={`${navigation.callLabel}, ${contactInfo.phoneLabel}`}
            className="hidden items-center gap-2 font-sans text-body-sm text-text-secondary transition-colors duration-[var(--duration-fast)] hover:text-accent md:inline-flex"
          >
            <Phone aria-hidden="true" className="size-4" />
            {contactInfo.phoneLabel}
          </a>

          <Link
            href={navigation.cta.href}
            className={cn(buttonStyles({ size: "sm" }), "hidden sm:inline-flex")}
          >
            {navigation.cta.label}
          </Link>

          <button
            type="button"
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-controls={MOBILE_PANEL_ID}
            aria-label={
              isMenuOpen ? navigation.closeMenuLabel : navigation.openMenuLabel
            }
            className="inline-flex size-11 items-center justify-center rounded-xs text-text-primary transition-colors duration-[var(--duration-fast)] hover:text-accent lg:hidden"
          >
            {isMenuOpen ? (
              <X aria-hidden="true" className="size-6" />
            ) : (
              <Menu aria-hidden="true" className="size-6" />
            )}
          </button>
        </div>
      </Container>

      <div
        ref={panelRef}
        id={MOBILE_PANEL_ID}
        hidden={!isMenuOpen}
        data-site-menu-panel
        className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-border bg-ink md:top-20 lg:hidden"
      >
        <Container
          width="page"
          className="flex min-h-full flex-col justify-between gap-block py-section-sm"
        >
          <nav aria-label={navigation.mobileNavLabel}>
            <ul className="flex flex-col">
              {navItems.map((item, index) => {
                const isActive = isActivePath(pathname, item.href);
                return (
                  <li key={item.href} className="border-b border-border">
                    <Link
                      href={item.href}
                      onClick={closeMenu}
                      aria-current={isActive ? "page" : undefined}
                      data-site-menu-item
                      data-index={index}
                      className={cn(
                        "flex items-baseline gap-4 py-5 font-display text-display-sm transition-colors duration-[var(--duration-fast)]",
                        isActive
                          ? "text-accent"
                          : "text-text-primary hover:text-accent",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className="font-sans text-eyebrow tracking-eyebrow text-text-muted tabular-nums"
                      >
                        {`0${index + 1}`}
                      </span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex flex-col gap-stack">
            <a
              href={contactInfo.phoneHref}
              className="inline-flex items-center gap-2 font-sans text-body-md text-text-secondary hover:text-accent"
            >
              <Phone aria-hidden="true" className="size-4" />
              {contactInfo.phoneLabel}
            </a>
            <Link
              href={navigation.cta.href}
              onClick={closeMenu}
              className={buttonStyles({ size: "lg", className: "w-full" })}
            >
              {navigation.cta.label}
            </Link>
          </div>
        </Container>
      </div>
    </header>
  );
}
