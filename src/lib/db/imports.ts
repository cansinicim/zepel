import {
  createId,
  getDb,
  nowIso,
  optionalText,
  parseJsonSafe,
  resolvePage,
} from "./client";
import {
  IMPORT_STATUSES,
  type ImportInput,
  type ImportRecord,
  type ImportRow,
  type ImportStatus,
} from "./types";

/**
 * İlan içe aktarma denemeleri (imports) veri erişimi.
 *
 * Akış: create (pending) -> markParsed / markFailed -> markApplied.
 * Ham girdi saklanır, böylece başarısız ayrıştırma sonradan incelenebilir.
 * Durum geçişleri tablodaki CHECK kısıtlarıyla da korunur: 'failed' hata
 * metnisiz, 'applied' ise ilan kimliğisiz yazılamaz.
 */

const ID_PREFIX = "imp";

/** Hata metni sınırı, çok uzun yığın izlerinin satırı şişirmesini engeller. */
const ERROR_MAX_LENGTH = 2000;

const COLUMNS = [
  "id",
  "source_url",
  "raw_input",
  "status",
  "parsed_json",
  "error",
  "listing_id",
  "created_at",
].join(", ");

/** Yeni içe aktarma denemesini 'pending' olarak kaydeder. */
export async function create(input: ImportInput): Promise<ImportRecord> {
  const row = await getDb()
    .prepare(
      `INSERT INTO imports (id, source_url, raw_input, status, created_at)
       VALUES (?, ?, ?, ?, ?)
       RETURNING ${COLUMNS}`,
    )
    .bind(
      createId(ID_PREFIX),
      optionalText(input.sourceUrl),
      input.rawInput,
      "pending" satisfies ImportStatus,
      nowIso(),
    )
    .first<ImportRow>();

  if (row === null) {
    throw new Error("İçe aktarma kaydı oluşturulamadı.");
  }

  return mapRow(row);
}

/** Ayrıştırma sonucunu yazar ve kaydı 'parsed' durumuna alır. */
export async function markParsed(
  id: string,
  parsed: unknown,
): Promise<ImportRecord | null> {
  const row = await getDb()
    .prepare(
      `UPDATE imports
          SET status = ?, parsed_json = ?, error = NULL
        WHERE id = ?
        RETURNING ${COLUMNS}`,
    )
    .bind("parsed" satisfies ImportStatus, JSON.stringify(parsed), id)
    .first<ImportRow>();

  return row === null ? null : mapRow(row);
}

/** Hatayı yazar ve kaydı 'failed' durumuna alır. */
export async function markFailed(
  id: string,
  error: string,
): Promise<ImportRecord | null> {
  const message = error.trim().slice(0, ERROR_MAX_LENGTH) || "Bilinmeyen hata";

  const row = await getDb()
    .prepare(
      `UPDATE imports SET status = ?, error = ? WHERE id = ? RETURNING ${COLUMNS}`,
    )
    .bind("failed" satisfies ImportStatus, message, id)
    .first<ImportRow>();

  return row === null ? null : mapRow(row);
}

/** Oluşan ilanı kayda bağlar ve durumu 'applied' yapar. */
export async function markApplied(
  id: string,
  listingId: string,
): Promise<ImportRecord | null> {
  const row = await getDb()
    .prepare(
      `UPDATE imports
          SET status = ?, listing_id = ?, error = NULL
        WHERE id = ?
        RETURNING ${COLUMNS}`,
    )
    .bind("applied" satisfies ImportStatus, listingId, id)
    .first<ImportRow>();

  return row === null ? null : mapRow(row);
}

/** Son içe aktarma denemeleri, en yeniden eskiye. */
export async function list(limit?: number): Promise<ImportRecord[]> {
  const page = resolvePage({ limit });

  const result = await getDb()
    .prepare(
      `SELECT ${COLUMNS} FROM imports ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`,
    )
    .bind(page.limit, page.offset)
    .all<ImportRow>();

  return result.results.map(mapRow);
}

/* -------------------------------------------------------------------------- */
/* İç yardımcılar                                                              */
/* -------------------------------------------------------------------------- */

/** D1 satırını alan tipine çevirir. Tek dönüşüm noktası. */
function mapRow(row: ImportRow): ImportRecord {
  const parsed = parseJsonSafe(row.parsed_json);

  return {
    id: row.id,
    sourceUrl: row.source_url ?? undefined,
    rawInput: row.raw_input,
    status: IMPORT_STATUSES.includes(row.status as ImportStatus)
      ? (row.status as ImportStatus)
      : "pending",
    parsed: parsed ?? undefined,
    error: row.error ?? undefined,
    listingId: row.listing_id ?? undefined,
    createdAt: row.created_at,
  };
}
