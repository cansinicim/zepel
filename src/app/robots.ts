/**
 * Zepel Gayrimenkul, robots.txt.
 *
 * Tüm botlara tam tarama izni verilir. Yalnızca teknik yollar kapatılır;
 * portföy, hizmet, kurumsal ve yasal sayfaların tamamı dizine açıktır.
 *
 * Portföy sayfasındaki filtre sorguları (`?tip=`, `?kategori=`, `?ilce=`)
 * bilinçli olarak engellenmez: kopya içerik, `/portfoy` üzerindeki canonical
 * ile yönetilir. Sorguyu robots ile kapatmak canonical'ın okunmasını da
 * engelleyeceği için zararlı olur.
 */

import type { MetadataRoute } from "next";

import { absoluteUrl, siteUrl } from "@/lib/seo";

/**
 * Taramaya kapalı teknik yollar.
 * `/_next/` kapatılmaz, aksi halde Google sayfayı CSS ve JS olmadan işler.
 */
const DISALLOWED_PATHS: readonly string[] = ["/api/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...DISALLOWED_PATHS],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteUrl,
  };
}
