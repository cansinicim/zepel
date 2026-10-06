/**
 * Basit, süreç içi sabit pencere oran sınırlayıcı.
 *
 * Amaç, iletişim formu gibi kimlik doğrulaması olmayan uç noktaları kaba
 * spam ve kaynak tüketiminden korumaktır.
 *
 * SINIRLARI (bilinçli tercih, gerçek e-posta veya CRM entegrasyonu bağlanmadan
 * önce yeniden değerlendirilmeli):
 * - Sayaç bellekte tutulur, yani her sunucu örneği kendi sayacını görür.
 *   Çok örnekli veya sunucusuz bir dağıtımda koruma zayıflar; o noktada
 *   paylaşılan bir depo (Redis, KV) gerekir.
 * - Süreç yeniden başladığında sayaçlar sıfırlanır.
 * Bu haliyle tek başına yeterli bir savunma değildir, ilk katmandır.
 */

type Bucket = {
  count: number;
  resetAt: number;
};

export type RateLimitResult = {
  allowed: boolean;
  /** Pencere sıfırlanana kadar kalan saniye. */
  retryAfterSeconds: number;
};

export type RateLimitOptions = {
  /** Pencere başına izin verilen istek sayısı. */
  limit: number;
  /** Pencere uzunluğu, milisaniye. */
  windowMs: number;
};

/** Bellek sızıntısını önlemek için tutulacak azami anahtar sayısı. */
const MAX_TRACKED_KEYS = 10_000;

const buckets = new Map<string, Bucket>();

function evictExpired(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Verilen anahtar için bir isteği sayar ve izin verilip verilmediğini döndürür.
 * Anahtar genellikle istemci IP adresidir.
 */
export function consumeRateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    if (buckets.size >= MAX_TRACKED_KEYS) evictExpired(now);
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  bucket.count += 1;

  if (bucket.count > limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}
