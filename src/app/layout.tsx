import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import "./globals.css";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { MotionProvider } from "@/components/motion/motion-provider";
import { navigation } from "@/content/pages";
import { siteConfig } from "@/content/site";
import { defaultSeoImage, openGraphLocale, siteUrl } from "@/lib/seo";
import {
  realEstateAgentSchema,
  safeJsonLd,
  websiteSchema,
} from "@/lib/structured-data";

/**
 * Gövde metni: temiz, nötr grotesk.
 * latin-ext alt kümesi Türkçe karakterler (ç, ş, ğ, ı, İ) için zorunludur.
 */
const sans = Geist({
  variable: "--font-zepel-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

/** Display tipografisi: yüksek kontrastlı, editoryal serif. */
const display = Instrument_Serif({
  variable: "--font-zepel-display",
  subsets: ["latin", "latin-ext"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteConfig.name}, ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: openGraphLocale,
    siteName: siteConfig.name,
    url: siteConfig.url,
    title: `${siteConfig.name}, ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [{ url: defaultSeoImage.url, alt: defaultSeoImage.alt }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name}, ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [defaultSeoImage.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#162424",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${sans.variable} ${display.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-ink font-sans text-text-primary">
        <a
          href="#icerik"
          className="sr-only rounded-xs bg-accent px-4 py-2 font-sans text-body-sm font-medium text-ink focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60]"
        >
          {navigation.skipToContent}
        </a>

        <SiteHeader />

        <main id="icerik" className="flex-1">
          {children}
        </main>

        <SiteFooter />

        {/* Hareket katmanı: yumuşak kaydırma, scroll sahneleri, sayfa geçişi.
            Görünür içerik üretmez, DOM'u data-* kancaları üzerinden okur. */}
        <MotionProvider />

        {/* Site geneli yapısal veri: emlak ofisi kimliği ve site tanımı. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd(realEstateAgentSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteSchema()) }}
        />
      </body>
    </html>
  );
}
