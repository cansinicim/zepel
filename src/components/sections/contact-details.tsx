import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { contactPage } from "@/content/pages";
import { contactSection } from "@/content/sections";
import { contactInfo } from "@/content/site";

const linkClass =
  "font-sans text-body-md text-text-primary transition-colors duration-[var(--duration-fast)] hover:text-accent";

/** İletişim kanalları bloğu. Form ile aynı satırda, ikinci sütunda durur. */
export function ContactDetails() {
  const { labels } = contactPage;

  return (
    <section
      data-contact-details
      aria-labelledby="iletisim-kanallari-basligi"
      className="flex flex-col gap-block"
    >
      <div className="flex flex-col gap-stack">
        <h2
          id="iletisim-kanallari-basligi"
          className="font-display text-display-sm text-text-primary"
        >
          {contactSection.directContactTitle}
        </h2>
        <p className="font-sans text-body-md text-text-secondary">
          {contactSection.directContactDescription}
        </p>
      </div>

      <dl className="flex flex-col">
        <div className="flex flex-col gap-2 border-t border-border py-5">
          <dt className="inline-flex items-center gap-2 font-sans text-eyebrow tracking-eyebrow text-text-muted uppercase">
            <MapPin aria-hidden="true" className="size-4 shrink-0" />
            {labels.addressTitle}
          </dt>
          <dd className="flex flex-col gap-2">
            <address className="font-sans text-body-md text-text-primary not-italic">
              {contactInfo.officeName}
              <br />
              {contactInfo.addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
            <a
              href={contactInfo.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="w-fit font-sans text-body-sm text-accent underline decoration-border-strong underline-offset-4 transition-colors duration-[var(--duration-fast)] hover:decoration-accent"
            >
              {labels.mapsLinkLabel}
            </a>
          </dd>
        </div>

        <div className="flex flex-col gap-2 border-t border-border py-5">
          <dt className="inline-flex items-center gap-2 font-sans text-eyebrow tracking-eyebrow text-text-muted uppercase">
            <Phone aria-hidden="true" className="size-4 shrink-0" />
            {labels.phoneTitle}
          </dt>
          <dd>
            <a href={contactInfo.phoneHref} className={linkClass}>
              {contactInfo.phoneLabel}
            </a>
          </dd>
        </div>

        <div className="flex flex-col gap-2 border-t border-border py-5">
          <dt className="inline-flex items-center gap-2 font-sans text-eyebrow tracking-eyebrow text-text-muted uppercase">
            <MessageCircle aria-hidden="true" className="size-4 shrink-0" />
            {labels.whatsappTitle}
          </dt>
          <dd>
            <a
              href={contactInfo.whatsappHref}
              target="_blank"
              rel="noreferrer"
              className={linkClass}
            >
              {contactInfo.whatsappLabel}
            </a>
          </dd>
        </div>

        <div className="flex flex-col gap-2 border-t border-border py-5">
          <dt className="inline-flex items-center gap-2 font-sans text-eyebrow tracking-eyebrow text-text-muted uppercase">
            <Mail aria-hidden="true" className="size-4 shrink-0" />
            {labels.emailTitle}
          </dt>
          <dd>
            <a href={contactInfo.emailHref} className={linkClass}>
              {contactInfo.email}
            </a>
          </dd>
        </div>

        <div className="flex flex-col gap-2 border-t border-b border-border py-5">
          <dt className="inline-flex items-center gap-2 font-sans text-eyebrow tracking-eyebrow text-text-muted uppercase">
            <Clock aria-hidden="true" className="size-4 shrink-0" />
            {labels.hoursTitle}
          </dt>
          <dd>
            <ul className="flex flex-col gap-1">
              {contactInfo.hours.map((entry) => (
                <li
                  key={entry.label}
                  className="flex items-baseline justify-between gap-6 font-sans text-body-md"
                >
                  <span className="text-text-secondary">{entry.label}</span>
                  <span className="text-text-primary tabular-nums">
                    {entry.value}
                  </span>
                </li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>
    </section>
  );
}
