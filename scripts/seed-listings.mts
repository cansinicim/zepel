/**
 * Zepel Gayrimenkul, ilan tohumlama betiği.
 *
 * `src/content/properties.ts` içindeki 10 demo ilanı, D1'e uygulanabilir bir
 * SQL dosyasına dönüştürür. Amaç, genel site veritabanına geçtikten sonra
 * bugünkü görüntüsünü korumasıdır; gerçek ilanlar geldikçe yönetici bu demo
 * kayıtları panelden arşivler.
 *
 * Betik veritabanına DOĞRUDAN BAĞLANMAZ, yalnızca SQL üretip dosyaya yazar.
 * Üretilen dosya `wrangler d1 execute` ile uygulanır:
 *
 *   wrangler d1 execute zepel-db --local  --file=seed/listings.sql
 *   wrangler d1 execute zepel-db --remote --file=seed/listings.sql
 *
 * `INSERT OR IGNORE` kullanılır: betik birden fazla kez çalıştırılıp
 * uygulansa da (id/slug çakışması nedeniyle) var olan kayıtları ezmez, hata
 * vermez. Demo ilan metni sonradan değişirse mevcut satır güncellenmez;
 * güncelleme yönetim panelinden yapılır.
 *
 * Çalıştırma: `npm run db:seed:sql` (bkz. package.json).
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { properties, type ListingType, type Property } from "../src/content/properties.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, "..", "seed", "listings.sql");

/**
 * D1 satırı sütun sırası. `migrations/0001_init.sql` ve
 * `src/lib/db/listings.ts` içindeki `COLUMNS` ile birebir aynı olmalıdır.
 */
const COLUMNS = [
  "id",
  "slug",
  "title",
  "description",
  "location",
  "city",
  "district",
  "listing_type",
  "category",
  "price",
  "price_period",
  "beds",
  "baths",
  "area",
  "plot_area",
  "build_year",
  "features",
  "images",
  "featured",
  "status",
  "source_url",
  "created_at",
  "updated_at",
  "published_at",
] as const;

/** Fiyat periyodu, ilan tipinden türetilir. Bkz. `listings.ts` içindeki `pricePeriodFor`. */
function pricePeriodFor(listingType: ListingType): "ay" | null {
  return listingType === "kiralik" ? "ay" : null;
}

/** SQL metin değeri. Tek tırnak ikiye katlanarak kaçırılır (standart SQL kuralı). */
function sqlText(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

/** SQL NULL veya metin değeri. */
function sqlNullableText(value: string | null | undefined): string {
  return value === null || value === undefined ? "NULL" : sqlText(value);
}

/** SQL tamsayı veya NULL değeri. */
function sqlNullableInt(value: number | null | undefined): string {
  return value === null || value === undefined ? "NULL" : String(Math.trunc(value));
}

/** SQLite mantıksal değeri (0/1). */
function sqlBoolean(value: boolean): string {
  return value ? "1" : "0";
}

/** JSON dizi metni, SQL string olarak kaçırılmış. */
function sqlJsonArray(values: readonly string[]): string {
  return sqlText(JSON.stringify(values));
}

/** Tek bir ilan için `INSERT` deyimi. */
function insertStatement(property: Property, seededAt: string): string {
  const pricePeriod = pricePeriodFor(property.listingType);

  const values = [
    sqlText(property.id),
    sqlText(property.slug),
    sqlText(property.title),
    sqlText(property.description),
    sqlText(property.location),
    sqlText(property.city),
    sqlText(property.district),
    sqlText(property.listingType),
    sqlText(property.category),
    String(Math.max(0, Math.trunc(property.price))),
    sqlNullableText(pricePeriod),
    String(property.beds),
    String(property.baths),
    String(property.area),
    sqlNullableInt(property.plotArea),
    sqlNullableInt(property.buildYear),
    sqlJsonArray(property.features),
    sqlJsonArray(property.images),
    sqlBoolean(property.featured),
    sqlText("published"),
    "NULL", // source_url: elle hazırlanmış demo veri, kaynak linki yok.
    sqlText(seededAt),
    sqlText(seededAt),
    sqlText(seededAt),
  ];

  return `INSERT OR IGNORE INTO listings (${COLUMNS.join(", ")})\nVALUES (${values.join(", ")});`;
}

function buildSql(): string {
  const seededAt = new Date().toISOString();

  const header = [
    "-- Zepel Gayrimenkul, demo ilan tohumlama.",
    "-- `scripts/seed-listings.mts` tarafından üretildi, elle düzenlemeyin.",
    `-- Üretim zamanı: ${seededAt}`,
    "--",
    "-- Uygulama:",
    "--   wrangler d1 execute zepel-db --local  --file=seed/listings.sql",
    "--   wrangler d1 execute zepel-db --remote --file=seed/listings.sql",
    "--",
    "-- INSERT OR IGNORE kullanılır: id veya slug zaten varsa satır sessizce",
    "-- atlanır, hata verilmez. Bu betik yeniden çalıştırılıp yeniden",
    "-- uygulansa bile veri çoğalmaz.",
    "",
  ].join("\n");

  const statements = properties.map((property) => insertStatement(property, seededAt));

  return `${header}${statements.join("\n\n")}\n`;
}

function main(): void {
  const sql = buildSql();

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, sql, "utf-8");

  console.log(`${properties.length} ilan için SQL üretildi: ${OUTPUT_PATH}`);
}

main();
