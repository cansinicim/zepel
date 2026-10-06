import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { D1Database } from "./types";

/**
 * D1 bağlantısı ve veri katmanının ortak yardımcıları.
 *
 * ÖNEMLİ: Bağlantıya modül tepe seviyesinde erişilmez. Cloudflare bağlamı
 * yalnızca istek sırasında vardır, derleme ve statik üretim sırasında yoktur.
 * Bu yüzden `getDb()` her çağrıda tembel olarak bağlamı okur.
 */

/** wrangler.jsonc içindeki d1_databases girdisinin binding adı. */
const DB_BINDING = "DB";

/** Sayfalama sınırları. Sorguların sınırsız satır çekmesini engeller. */
export const PAGINATION = {
  defaultLimit: 24,
  maxLimit: 100,
} as const;

/** Bağlam okunurken kullanılan asgari env şekli. */
type DbEnv = {
  readonly [DB_BINDING]?: D1Database;
};

/**
 * Bağlantıyı döner, yoksa `null`. Statik üretim veya bağlantısı tanımlanmamış
 * bir ortamda çağıran taraf sabit içeriğe düşebilsin diye vardır.
 */
export function tryGetDb(): D1Database | null {
  try {
    // `wrangler types` ile cloudflare-env.d.ts üretilirse bu dönüşüm kaldırılabilir.
    const env = getCloudflareContext().env as unknown as DbEnv;
    return env[DB_BINDING] ?? null;
  } catch {
    // Cloudflare bağlamı yoksa (derleme zamanı, birim test) hata fırlatmayız.
    return null;
  }
}

/** Bağlantıyı döner, yoksa açıklayıcı bir hata fırlatır. */
export function getDb(): D1Database {
  const db = tryGetDb();

  if (db === null) {
    throw new Error(
      `D1 bağlantısı bulunamadı ("${DB_BINDING}"). wrangler.jsonc içindeki ` +
        "d1_databases tanımını ve isteğin Cloudflare çalışma zamanında " +
        "yürütüldüğünü doğrulayın.",
    );
  }

  return db;
}

/** ISO 8601 UTC zaman damgası. Tarih alanlarının tek üretim noktası. */
export function nowIso(): string {
  return new Date().toISOString();
}

/** Öneki olan çakışmasız kimlik üretir, örn "zpl-9f3c...". */
export function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

/** Sayfalama değerlerini güvenli aralığa kırpar. */
export function resolvePage(options: {
  readonly limit?: number;
  readonly offset?: number;
}): { readonly limit: number; readonly offset: number } {
  const rawLimit = options.limit ?? PAGINATION.defaultLimit;
  const rawOffset = options.offset ?? 0;

  return {
    limit: clampInteger(rawLimit, 1, PAGINATION.maxLimit, PAGINATION.defaultLimit),
    offset: clampInteger(rawOffset, 0, Number.MAX_SAFE_INTEGER, 0),
  };
}

function clampInteger(
  value: number,
  min: number,
  max: number,
  fallback: number,
): number {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(Math.max(Math.trunc(value), min), max);
}

/**
 * JSON metnini güvenle ayrıştırır. Bozuk içerik uygulamayı çökertmez,
 * `null` döner ve çağıran taraf makul bir varsayılana düşer.
 */
export function parseJsonSafe(raw: string | null): unknown {
  if (raw === null || raw.length === 0) {
    return null;
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

/** SQLite tamsayısını (0/1) mantıksal değere çevirir. */
export function toBoolean(value: number | null): boolean {
  return value === 1;
}

/** Mantıksal değeri SQLite tamsayısına çevirir. */
export function fromBoolean(value: boolean): number {
  return value ? 1 : 0;
}

/** Boş metni `null` sayar, opsiyonel alanların tek dönüşüm noktası. */
export function optionalText(value: string | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
