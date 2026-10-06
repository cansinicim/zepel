import Link from "next/link";
import { ArrowUp, Mail, MapPin, Phone } from "lucide-react";

import { ZepelLogo } from "@/components/brand/zepel-logo";
import { Container } from "@/components/ui";
import { navigation } from "@/content/pages";
import { footer } from "@/content/sections";
import {
  contactInfo,
  legalContent,
  legalNavItems,
  siteConfig,
  socialLinks,
} from "@/content/site";

const contactChannels = [
  {
    id: "adres",
    icon: MapPin,
    label: contactInfo.addressSingleLine,
    href: contactInfo.mapsUrl,
    external: true,
  },
  {
    id: "telefon",
    icon: Phone,
    label: contactInfo.phoneLabel,
    href: contactInfo.phoneHref,
    external: false,
  },
  {
    id: "eposta",
    icon: Mail,
    label: contactInfo.email,
    href: contactInfo.emailHref,
    external: false,
  },
] as const;

export function SiteFooter() {
  return (
    <footer
      data-site-footer
      className="border-t border-border bg-surface text-text-secondary"
    >
      <Container width="page" className="py-section-sm">
        <div className="flex flex-col gap-block lg:flex-row lg:justify-between">
          <div className="flex max-w-narrow flex-col gap-stack">
            <Link
              href="/"
              className="self-start text-text-primary transition-colors duration-[var(--duration-fast)] hover:text-accent"
            >
              <ZepelLogo variant="horizontal" className="text-[20px]" />
              <span className="sr-only">, {navigation.homeLinkSuffix}</span>
            </Link>
            <p className="font-sans text-body-md text-text-secondary">
              {footer.statement}
            </p>

            <ul className="mt-2 flex flex-col gap-3">
              {contactChannels.map((channel) => {
                const Icon = channel.icon;
                return (
                  <li key={channel.id}>
                    <a
                      href={channel.href}
                      {...(channel.external
                        ? { target: "_blank", rel: "noreferrer" }
                        : {})}
                      className="group inline-flex items-start gap-3 font-sans text-body-sm text-text-secondary transition-colors duration-[var(--duration-fast)] hover:text-accent"
                    >
                      <Icon
                        aria-hidden="true"
                        className="mt-1 size-4 shrink-0 text-text-muted transition-colors duration-[var(--duration-fast)] group-hover:text-accent"
                      />
                      <span>{channel.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <nav
            aria-label={navigation.footerNavLabel}
            className="grid grid-cols-2 gap-x-8 gap-y-block sm:grid-cols-3 lg:gap-x-16"
          >
            {footer.columns.map((column) => (
              <div key={column.title} className="flex flex-col gap-4">
                <h2 className="font-sans text-eyebrow font-medium tracking-eyebrow text-text-muted uppercase">
                  {column.title}
                </h2>
                <ul className="flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="font-sans text-body-sm text-text-secondary transition-colors duration-[var(--duration-fast)] hover:text-accent"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-block flex flex-col gap-6 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <nav aria-label={navigation.socialNavLabel}>
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {socialLinks.map((social) => (
                <li key={social.platform}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="font-sans text-body-sm tracking-wide-caps text-text-secondary uppercase transition-colors duration-[var(--duration-fast)] hover:text-accent"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <a
            href="#icerik"
            className="inline-flex items-center gap-2 self-start font-sans text-body-sm text-text-secondary transition-colors duration-[var(--duration-fast)] hover:text-accent sm:self-auto"
          >
            <ArrowUp aria-hidden="true" className="size-4" />
            {footer.backToTop}
          </a>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-border pt-8">
          <nav aria-label={navigation.legalNavLabel}>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {legalNavItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="font-sans text-body-sm text-text-muted transition-colors duration-[var(--duration-fast)] hover:text-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <p className="font-sans text-body-sm text-text-muted">
            {legalContent.copyright}
          </p>
          <p className="font-sans text-body-sm text-text-muted">
            {legalContent.licenceNote}
          </p>
          <p className="max-w-narrow font-sans text-body-sm text-text-muted">
            {legalContent.disclaimer}
          </p>
          <p className="font-sans text-body-sm text-text-muted">
            {siteConfig.legalName}, {legalContent.credit}
          </p>
        </div>
      </Container>
    </footer>
  );
}
