/**
 * İlan sayfasını sunucudan çeken katman.
 *
 * Tasarım kararları ve gerekçeleri:
 *
 * 1. SSRF koruması zorunludur. Adres kullanıcıdan (yöneticiden) gelir; hedef
 *    doğrulanmazsa iç ağdaki bir servis veya bulut meta veri uç noktası
 *    çağrılabilir. Bu yüzden şema, kullanıcı bilgisi, port ve ana makine adı
 *    beyaz liste mantığıyla denetlenir ve AYNI denetim her yönlendirme
 *    adımında yeniden uygulanır (`redirect: "manual"`).
 * 2. Hatalar istisna olarak fırlatılmaz; panelin doğru mesajı gösterebilmesi
 *    için ayrık birlik sonuç tipiyle döner. Özellikle `BLOCKED`, "bu site
 *    otomatik erişimi engelledi, sayfa içeriğini kopyalayıp yapıştırın"
 *    akışını tetikler.
 * 3. Yanıt akış halinde ve boyut sınırıyla okunur; dev bir sayfa Workers
 *    bellek ve süre bütçesini yakmaz.
 *
 * BİLİNEN SINIR: Workers çalışma zamanında DNS çözümlemesi yapılamadığı için
 * ana makine adının hangi IP'ye düştüğü görülemez (DNS rebinding). Kenar
 * ağından iç ağa erişim zaten mümkün olmadığından risk kabul edilmiştir;
 * doğrudan IP ve bilinen iç adres kalıpları burada reddedilir.
 */

import type { FetchListingResult } from "@/lib/import/types";

const REQUEST_TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 3;
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
const MAX_URL_LENGTH = 2048;
/** Bot koruma imzası aranırken taranan ilk karakter sayısı. */
const PROTECTION_SCAN_LENGTH = 8_000;

/**
 * Gerçekçi bir tarayıcı kimliği. Çoğu ilan sitesi boş veya betik görünümlü
 * `User-Agent` değerlerini doğrudan reddeder.
 */
const REQUEST_HEADERS: Readonly<Record<string, string>> = {
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "accept-language": "tr-TR,tr;q=0.9,en;q=0.6",
  "cache-control": "no-cache",
};

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

const HTML_CONTENT_TYPES = ["text/html", "application/xhtml+xml", "text/plain"];

/** Bot koruma sayfalarının gövdesinde geçen imzalar (küçük harfe indirgenmiş). */
const BOT_PROTECTION_MARKERS = [
  "just a moment",
  "checking your browser",
  "cf-browser-verification",
  "cf_chl_opt",
  "__cf_chl",
  "attention required! | cloudflare",
  "enable javascript and cookies to continue",
  "datadome",
  "captcha-delivery.com",
  "perimeterx",
  "px-captcha",
  "_incapsula_resource",
  "incident id:",
  "access denied",
  "erisim engellendi",
  "guvenlik dogrulamasi",
  "robot olmadiginizi",
];

const BLOCKED_HOST_SUFFIXES = [
  ".local",
  ".localhost",
  ".internal",
  ".intranet",
  ".lan",
  ".home.arpa",
];

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "0.0.0.0",
  "127.0.0.1",
  "[::1]",
  "[::]",
  "metadata.google.internal",
]);

type UrlCheck = { ok: true; url: URL } | { ok: false; message: string };

const IPV4_PATTERN = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

/** Özel, geri döngü ve ayrılmış IPv4 aralıkları. */
function isPrivateIpv4(host: string): boolean {
  const match = IPV4_PATTERN.exec(host);
  if (!match) return false;

  const octets = match.slice(1, 5).map((part) => Number(part));
  if (octets.some((value) => !Number.isInteger(value) || value < 0 || value > 255)) {
    return true;
  }
  const [first = 0, second = 0, third = 0] = octets;

  if (first === 0 || first === 10 || first === 127) return true;
  if (first === 169 && second === 254) return true;
  if (first === 172 && second >= 16 && second <= 31) return true;
  if (first === 192 && second === 168) return true;
  if (first === 192 && second === 0 && (third === 0 || third === 2)) return true;
  if (first === 198 && (second === 18 || second === 19)) return true;
  if (first === 198 && second === 51 && third === 100) return true;
  if (first === 203 && second === 0 && third === 113) return true;
  if (first === 100 && second >= 64 && second <= 127) return true;
  if (first >= 224) return true;

  return false;
}

/**
 * Hedef adresi doğrular. Yalnızca herkese açık http/https adreslerine izin
 * verilir; doğrulama yönlendirmelerde de tekrar çağrılır.
 */
export function validateTargetUrl(rawUrl: string): UrlCheck {
  const trimmed = typeof rawUrl === "string" ? rawUrl.trim() : "";
  if (trimmed.length === 0) return { ok: false, message: "Adres boş." };
  if (trimmed.length > MAX_URL_LENGTH) {
    return { ok: false, message: "Adres çok uzun." };
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { ok: false, message: "Adres geçerli bir URL değil." };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return {
      ok: false,
      message: `Yalnızca http ve https adresleri desteklenir (${url.protocol} verildi).`,
    };
  }
  if (url.username.length > 0 || url.password.length > 0) {
    return { ok: false, message: "Adres kullanıcı adı veya parola taşıyamaz." };
  }
  if (url.port.length > 0 && url.port !== "80" && url.port !== "443") {
    return {
      ok: false,
      message: `Yalnızca 80 ve 443 portlarına istek yapılır (${url.port} verildi).`,
    };
  }

  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (host.length === 0) return { ok: false, message: "Adreste alan adı yok." };
  if (BLOCKED_HOSTNAMES.has(host)) {
    return { ok: false, message: "Yerel adreslere istek yapılamaz." };
  }
  if (host.startsWith("[")) {
    return { ok: false, message: "IPv6 adresine doğrudan istek yapılamaz." };
  }
  if (BLOCKED_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix))) {
    return { ok: false, message: "İç ağ adreslerine istek yapılamaz." };
  }
  if (!host.includes(".")) {
    return { ok: false, message: "Alan adı geçersiz görünüyor." };
  }
  if (isPrivateIpv4(host)) {
    return { ok: false, message: "Özel veya ayrılmış IP adreslerine istek yapılamaz." };
  }

  return { ok: true, url };
}

function isHtmlContentType(contentType: string): boolean {
  const value = contentType.toLowerCase();
  return HTML_CONTENT_TYPES.some((type) => value.includes(type));
}

/** Gövdede bot koruma imzası var mı? */
function looksLikeBotProtection(html: string): boolean {
  const sample = html.slice(0, PROTECTION_SCAN_LENGTH).toLowerCase();
  return BOT_PROTECTION_MARKERS.some((marker) => sample.includes(marker));
}

/**
 * `content-type` başlığındaki karakter kümesini kullanır. Türkiye'deki bazı
 * eski siteler hâlâ windows-1254 ile yayın yapıyor; etiket desteklenmiyorsa
 * utf-8'e düşülür.
 */
function createDecoder(contentType: string): TextDecoder {
  const label = /charset\s*=\s*"?([\w-]+)"?/i.exec(contentType)?.[1];
  if (label) {
    try {
      return new TextDecoder(label);
    } catch {
      // Desteklenmeyen etiket: utf-8 ile devam edilir.
    }
  }
  return new TextDecoder("utf-8");
}

/** Yanıtı boyut sınırıyla okur, sınıra takılırsa akışı iptal eder. */
async function readLimitedText(
  response: Response,
  contentType: string,
): Promise<{ text: string; truncated: boolean }> {
  const decoder = createDecoder(contentType);
  const body = response.body;

  if (!body) {
    const buffer = await response.arrayBuffer();
    const truncated = buffer.byteLength > MAX_RESPONSE_BYTES;
    const view = new Uint8Array(buffer, 0, Math.min(buffer.byteLength, MAX_RESPONSE_BYTES));
    return { text: decoder.decode(view), truncated };
  }

  const reader = body.getReader();
  let received = 0;
  let text = "";
  let truncated = false;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      let chunk = value;
      if (received + chunk.byteLength > MAX_RESPONSE_BYTES) {
        chunk = chunk.subarray(0, MAX_RESPONSE_BYTES - received);
        truncated = true;
      }
      received += chunk.byteLength;
      text += decoder.decode(chunk, { stream: true });
      if (truncated) break;
    }
    text += decoder.decode();
  } finally {
    await reader.cancel().catch(() => undefined);
  }

  return { text, truncated };
}

function isTimeoutError(error: unknown): boolean {
  const name = (error as { name?: unknown } | null)?.name;
  return name === "TimeoutError" || name === "AbortError";
}

function blocked(finalUrl: string, httpStatus?: number): FetchListingResult {
  return {
    ok: false,
    reason: "BLOCKED",
    message:
      "Bu site otomatik erişimi engelledi. İlan sayfasını tarayıcıda açıp içeriğini kopyalayarak yapıştırın.",
    httpStatus,
    finalUrl,
  };
}

/**
 * Verilen adresteki HTML'i getirir.
 * Hiçbir durumda istisna fırlatmaz; sonuç her zaman `FetchListingResult`'tır.
 */
export async function fetchListingHtml(rawUrl: string): Promise<FetchListingResult> {
  const validated = validateTargetUrl(rawUrl);
  if (!validated.ok) {
    return { ok: false, reason: "INVALID_URL", message: validated.message };
  }

  // Zaman aşımı bütçesi yönlendirmeler dahil TOPLAM süre için kurulur.
  const signal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  let current = validated.url;

  try {
    for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
      const response = await fetch(current.toString(), {
        method: "GET",
        redirect: "manual",
        signal,
        headers: { ...REQUEST_HEADERS },
      });
      const finalUrl = current.toString();

      if (REDIRECT_STATUSES.has(response.status)) {
        const location = response.headers.get("location");
        if (!location) {
          return {
            ok: false,
            reason: "HTTP_ERROR",
            message: "Site yönlendirme yaptı ama hedef adresi bildirmedi.",
            httpStatus: response.status,
            finalUrl,
          };
        }
        let next: string;
        try {
          next = new URL(location, current).toString();
        } catch {
          return {
            ok: false,
            reason: "INVALID_URL",
            message: "Yönlendirme adresi çözümlenemedi.",
            finalUrl,
          };
        }
        const nextCheck = validateTargetUrl(next);
        if (!nextCheck.ok) {
          return {
            ok: false,
            reason: "INVALID_URL",
            message: `Yönlendirme güvenli olmayan bir adrese gidiyor: ${nextCheck.message}`,
            finalUrl,
          };
        }
        current = nextCheck.url;
        continue;
      }

      if (response.status === 403 || response.status === 429) {
        return blocked(finalUrl, response.status);
      }

      const contentType = response.headers.get("content-type") ?? "";

      if (response.status >= 400) {
        // 5xx sayfalarının bir kısmı aslında bot koruma ekranıdır.
        if (response.status === 503 && isHtmlContentType(contentType)) {
          const { text } = await readLimitedText(response, contentType);
          if (looksLikeBotProtection(text)) return blocked(finalUrl, response.status);
        }
        return {
          ok: false,
          reason: "HTTP_ERROR",
          message: `Sayfa getirilemedi, site ${response.status} yanıtı verdi.`,
          httpStatus: response.status,
          finalUrl,
        };
      }

      if (contentType.length > 0 && !isHtmlContentType(contentType)) {
        return {
          ok: false,
          reason: "NOT_HTML",
          message: `Adres bir web sayfası değil (${contentType.split(";")[0]}).`,
          httpStatus: response.status,
          finalUrl,
        };
      }

      const { text, truncated } = await readLimitedText(response, contentType);
      if (looksLikeBotProtection(text)) return blocked(finalUrl, response.status);

      return { ok: true, html: text, finalUrl, truncated };
    }

    return {
      ok: false,
      reason: "TOO_MANY_REDIRECTS",
      message: `Site ${MAX_REDIRECTS} adımdan fazla yönlendirme yaptı.`,
      finalUrl: current.toString(),
    };
  } catch (error) {
    if (isTimeoutError(error)) {
      return {
        ok: false,
        reason: "TIMEOUT",
        message: "Sayfa 10 saniye içinde yanıt vermedi.",
        finalUrl: current.toString(),
      };
    }
    return {
      ok: false,
      reason: "NETWORK_ERROR",
      message: "Sayfaya ulaşılamadı, adresi kontrol edin.",
      finalUrl: current.toString(),
    };
  }
}
