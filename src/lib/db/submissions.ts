import {
  createId,
  getDb,
  nowIso,
  optionalText,
  resolvePage,
} from "./client";
import {
  SUBMISSION_STATUSES,
  type PageOptions,
  type Submission,
  type SubmissionInput,
  type SubmissionRow,
  type SubmissionStatus,
} from "./types";

/**
 * İletişim formu talepleri (submissions) veri erişimi.
 *
 * KİŞİSEL VERİ NOTU (KVKK): Ham IP adresi hiçbir koşulda saklanmaz. Kötüye
 * kullanım analizi için yalnızca sunucu tarafındaki gizli tuz ile üretilmiş
 * SHA-256 özeti tutulur (`hashClientIp`). Tuz olmadan özetten IP geri
 * üretilemez, tuz değiştirildiğinde eski özetler anlamsızlaşır. Tuz tanımlı
 * değilse özet üretilmez ve alan boş kalır.
 */

const ID_PREFIX = "sub";

/** IP özetleme tuzu bu ortam değişkeninden okunur, koda gömülü sabit yoktur. */
const IP_SALT_ENV = "SUBMISSION_IP_SALT";

const COLUMNS = [
  "id",
  "full_name",
  "phone",
  "email",
  "service",
  "message",
  "status",
  "ip_hash",
  "created_at",
].join(", ");

/** Yeni talebi kaydeder ve oluşan kaydı döner. */
export async function create(input: SubmissionInput): Promise<Submission> {
  const row = await getDb()
    .prepare(
      `INSERT INTO submissions (
         id, full_name, phone, email, service, message, status, ip_hash, created_at
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING ${COLUMNS}`,
    )
    .bind(
      createId(ID_PREFIX),
      input.fullName,
      input.phone,
      input.email,
      input.service,
      input.message,
      "new" satisfies SubmissionStatus,
      optionalText(input.ipHash),
      nowIso(),
    )
    .first<SubmissionRow>();

  if (row === null) {
    throw new Error("Talep kaydedilemedi, veritabanı satır döndürmedi.");
  }

  return mapRow(row);
}

/** Talepleri en yeniden eskiye listeler. Durum verilirse ona göre süzer. */
export async function list(
  status?: SubmissionStatus,
  options: PageOptions = {},
): Promise<Submission[]> {
  const { limit, offset } = resolvePage(options);

  const where = status === undefined ? "" : "WHERE status = ?";
  const params: unknown[] = status === undefined ? [] : [status];

  const result = await getDb()
    .prepare(
      `SELECT ${COLUMNS} FROM submissions ${where}
        ORDER BY created_at DESC, id DESC
        LIMIT ? OFFSET ?`,
    )
    .bind(...params, limit, offset)
    .all<SubmissionRow>();

  return result.results.map(mapRow);
}

/** Talebi okundu işaretler. */
export async function markRead(id: string): Promise<Submission | null> {
  return setStatus(id, "read");
}

/** Talebi arşivler. Kayıt silinmez, yalnızca listeden düşer. */
export async function archive(id: string): Promise<Submission | null> {
  return setStatus(id, "archived");
}

/** Okunmamış talep sayısı, yönetim rozetleri için. */
export async function countNew(): Promise<number> {
  const row = await getDb()
    .prepare("SELECT COUNT(*) AS total FROM submissions WHERE status = ?")
    .bind("new" satisfies SubmissionStatus)
    .first<{ readonly total: number }>();

  return row?.total ?? 0;
}

/**
 * IP adresinin tuzlanmış SHA-256 özetini üretir. Tuz tanımlı değilse `null`
 * döner ve çağıran taraf özetsiz kaydeder; ham IP asla saklanmaz.
 */
export async function hashClientIp(ip: string): Promise<string | null> {
  const salt = process.env[IP_SALT_ENV];

  if (salt === undefined || salt.length === 0) {
    return null;
  }

  const bytes = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/* -------------------------------------------------------------------------- */
/* İç yardımcılar                                                              */
/* -------------------------------------------------------------------------- */

async function setStatus(
  id: string,
  status: SubmissionStatus,
): Promise<Submission | null> {
  const row = await getDb()
    .prepare(
      `UPDATE submissions SET status = ? WHERE id = ? RETURNING ${COLUMNS}`,
    )
    .bind(status, id)
    .first<SubmissionRow>();

  return row === null ? null : mapRow(row);
}

/** D1 satırını alan tipine çevirir. Tek dönüşüm noktası. */
function mapRow(row: SubmissionRow): Submission {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    service: row.service,
    message: row.message,
    status: SUBMISSION_STATUSES.includes(row.status as SubmissionStatus)
      ? (row.status as SubmissionStatus)
      : "new",
    ipHash: row.ip_hash ?? undefined,
    createdAt: row.created_at,
  };
}
