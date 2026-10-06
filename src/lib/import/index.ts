/**
 * İlan içe aktarma modülünün genel yüzü.
 *
 * Yönetici panelinde tek bir kutu vardır: içine ya ilan bağlantısı ya da ilan
 * sayfasının kopyalanmış içeriği yapıştırılır. Panel bu iki durumu buradaki
 * iki fonksiyona bağlar; ayrıştırma mantığı ve ağ erişimi ayrı dosyalarda
 * durur, panel yalnızca bu modülü tanır.
 */

import { fetchListingHtml } from "@/lib/import/fetch-listing";
import { parseListingHtml } from "@/lib/import/parse-listing";
import type { ImportOutcome, ParseResult } from "@/lib/import/types";

export type {
  FetchFailureReason,
  FetchListingFailure,
  FetchListingResult,
  FetchListingSuccess,
  ImportOutcome,
  ListingCategory,
  ListingType,
  ParseResult,
  ParsedListing,
  ParsedListingField,
  ProvenanceSource,
} from "@/lib/import/types";

export { fetchListingHtml, validateTargetUrl } from "@/lib/import/fetch-listing";
export { parseListingHtml } from "@/lib/import/parse-listing";

/**
 * Bağlantıdan içe aktarır: sayfayı çeker, sonra ayrıştırır.
 *
 * Sayfaya hiç ulaşılamadıysa ayrıştırılacak bir şey yoktur; bu durumda
 * `ok: false` dalı döner ve `failure.reason === "BLOCKED"` ise panel
 * kullanıcıyı "içeriği kopyalayıp yapıştırın" akışına yönlendirir.
 */
export async function importFromUrl(url: string): Promise<ImportOutcome> {
  const fetched = await fetchListingHtml(url);
  if (!fetched.ok) return { ok: false, failure: fetched };

  const parsed = parseListingHtml(fetched.html, fetched.finalUrl);
  const warnings = fetched.truncated
    ? [
        ...parsed.warnings,
        "Sayfa 2 MB sınırında kesildi, bazı alanlar eksik kalmış olabilir.",
      ]
    : parsed.warnings;

  return {
    ok: true,
    result: { ...parsed, warnings },
    finalUrl: fetched.finalUrl,
    truncated: fetched.truncated,
  };
}

/**
 * Yapıştırılan HTML veya düz metinden içe aktarır.
 * Ağ erişimi yoktur, bu yüzden her zaman bir `ParseResult` üretir.
 */
export function importFromHtml(html: string, sourceUrl?: string): ParseResult {
  return parseListingHtml(html, sourceUrl);
}
