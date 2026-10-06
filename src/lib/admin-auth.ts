/**
 * Admin oturumu, tek parola ile.
 *
 * Tasarım kararları ve gerekçeleri:
 *
 * 1. Parola ortam değişkeninde (`ADMIN_PASSWORD`) tutulur, kodda veya
 *    veritabanında durmaz. Cloudflare tarafında `wrangler secret put` ile
 *    yazılır, dolayısıyla derleme çıktısına gömülmez.
 * 2. Karşılaştırma sabit zamanlıdır. Basit `===` karşılaştırması, ilk farklı
 *    karakterde döndüğü için ölçülebilir zaman farkı yaratır ve parolanın
 *    karakter karakter tahmin edilmesine kapı aralar.
 * 3. Çerezde parola veya kullanıcı adı taşınmaz. İmzalı ve son kullanma
 *    tarihli bir oturum belirteci taşınır; imza HMAC-SHA256 ile
 *    `ADMIN_SESSION_SECRET` üzerinden üretilir.
 * 4. Çerez `httpOnly`, `secure` ve `sameSite: "lax"` işaretlidir. `lax`,
 *    formların normal gezinme akışında çalışmasına izin verirken siteler
 *    arası istek sahteciliğini (CSRF) büyük ölçüde engeller.
 * 5. Kriptografi Web Crypto API ile yapılır; Node'a özgü `crypto` modülü
 *    Workers çalışma zamanında güvenilir biçimde bulunmaz.
 */

import { cookies } from "next/headers";

const COOKIE_NAME = "zepel_admin";
/** Oturum süresi: 12 saat. Ofis günü boyunca yeter, gece açık kalmaz. */
const SESSION_TTL_SECONDS = 12 * 60 * 60;

const encoder = new TextEncoder();

/** Ortam değişkenini okur, eksikse anlaşılır bir hata verir. */
function requireEnv(name: "ADMIN_PASSWORD" | "ADMIN_SESSION_SECRET"): string {
  const value = process.env[name];
  if (!value || value.length === 0) {
    throw new Error(
      `${name} tanımlı değil. Cloudflare'de "wrangler secret put ${name}", yerelde .dev.vars içine ekleyin.`,
    );
  }
  return value;
}

/** Baytları base64url metnine çevirir; çerez değerinde güvenle taşınır. */
function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return toBase64Url(new Uint8Array(signature));
}

/**
 * Sabit zamanlı karşılaştırma.
 *
 * Girdiler önce HMAC'ten geçirilir; böylece uzunlukları her zaman eşit olur ve
 * uzunluk farkından bilgi sızmaz. Karşılaştırma tüm baytlar üzerinde döner,
 * erken çıkış yapmaz.
 */
async function safeEqual(a: string, b: string): Promise<boolean> {
  const salt = crypto.randomUUID();
  const [da, db] = await Promise.all([hmac(a, salt), hmac(b, salt)]);
  if (da.length !== db.length) return false;

  let diff = 0;
  for (let i = 0; i < da.length; i += 1) {
    diff |= da.charCodeAt(i) ^ db.charCodeAt(i);
  }
  return diff === 0;
}

/** Çerez değeri: "sonKullanma.imza". Kimlik bilgisi taşımaz. */
async function createToken(): Promise<string> {
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload = String(expiresAt);
  const signature = await hmac(payload, requireEnv("ADMIN_SESSION_SECRET"));
  return `${payload}.${signature}`;
}

async function isTokenValid(token: string | undefined): Promise<boolean> {
  if (!token) return false;

  const separator = token.lastIndexOf(".");
  if (separator <= 0) return false;

  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  const expected = await hmac(payload, requireEnv("ADMIN_SESSION_SECRET"));
  return safeEqual(signature, expected);
}

/** Parolayı doğrular. Doğruysa oturum çerezini yazar. */
export async function signIn(password: string): Promise<boolean> {
  const matches = await safeEqual(password, requireEnv("ADMIN_PASSWORD"));
  if (!matches) return false;

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, await createToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return true;
}

export async function signOut(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/** Oturum geçerli mi. Sayfa ve eylemlerin başında çağrılır. */
export async function isSignedIn(): Promise<boolean> {
  const cookieStore = await cookies();
  return isTokenValid(cookieStore.get(COOKIE_NAME)?.value);
}

/**
 * Yetki kapısı. Oturum yoksa hata fırlatır.
 *
 * Her sunucu eylemi (server action) bunu ilk satırında çağırmalıdır: sunucu
 * eylemleri kendi uç noktalarıdır, sayfanın korunuyor olması eylemi korumaz.
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isSignedIn())) {
    throw new Error("Bu işlem için yönetici oturumu gerekir.");
  }
}
