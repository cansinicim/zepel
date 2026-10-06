import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * OpenNext, Next.js çıktısını Cloudflare Workers'a uyarlar.
 *
 * Artımlı önbellek şimdilik kapalı: R2 hesapta etkinleştirilmedi. R2 açıldığında
 * `r2IncrementalCache` devreye alınır ve ilan sayfaları istek başına yeniden
 * render edilmek yerine önbellekten servis edilir.
 */
export default defineCloudflareConfig();
