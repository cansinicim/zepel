-- Zepel Gayrimenkul, Cloudflare D1 (SQLite) başlangıç şeması.
--
-- Uygulama:
--   npm run db:migrate:local   (yerel)
--   npm run db:migrate         (uzak)
--
-- Kurallar:
--   * Tarih alanları ISO 8601 UTC metnidir (SQLite'ta yerleşik tarih tipi yoktur).
--   * Liste alanları (features, images) JSON metin olarak saklanır; okuma
--     tarafında güvenli biçimde ayrıştırılır, bozuk JSON uygulamayı çökertmez.
--   * Bu dosya yalnızca tablo ve indeks oluşturur, yıkıcı işlem içermez.
--   * Geri alma (down) adımları dosyanın en altında yorum olarak durur. D1
--     migration akışı ileri yönlüdür, geri alma bilinçli ve elle yapılır.

-- ---------------------------------------------------------------------------
-- listings: ilan portföyü. Alan adları src/content/properties.ts içindeki
-- Property tipinin snake_case karşılığıdır; dönüşüm src/lib/db/listings.ts
-- içinde tek noktada yapılır.
-- ---------------------------------------------------------------------------
CREATE TABLE listings (
  id            TEXT PRIMARY KEY,
  slug          TEXT NOT NULL UNIQUE,
  title         TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  location      TEXT NOT NULL DEFAULT '',
  city          TEXT NOT NULL DEFAULT '',
  district      TEXT NOT NULL DEFAULT '',
  listing_type  TEXT NOT NULL CHECK (listing_type IN ('satilik', 'kiralik')),
  category      TEXT NOT NULL CHECK (category IN ('villa', 'rezidans', 'daire', 'yali', 'arsa', 'ofis')),
  -- Ham fiyat, TRY. Kiralık ilanlarda aylık bedeldir.
  -- Ekranda gösterilen priceLabel saklanmaz, price + listing_type'tan türetilir.
  price         INTEGER NOT NULL CHECK (price >= 0),
  price_period  TEXT CHECK (price_period IS NULL OR price_period = 'ay'),
  beds          INTEGER NOT NULL DEFAULT 0 CHECK (beds >= 0),
  baths         INTEGER NOT NULL DEFAULT 0 CHECK (baths >= 0),
  area          INTEGER NOT NULL DEFAULT 0 CHECK (area >= 0),
  plot_area     INTEGER CHECK (plot_area IS NULL OR plot_area >= 0),
  build_year    INTEGER CHECK (build_year IS NULL OR (build_year BETWEEN 1800 AND 2200)),
  -- JSON dizi metni, örnek: ["Yerden ısıtma","Kapalı otopark"]
  features      TEXT NOT NULL DEFAULT '[]',
  images        TEXT NOT NULL DEFAULT '[]',
  featured      INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  -- İçe aktarma kaynağı (ilan linki), elle girilen kayıtlarda NULL.
  source_url    TEXT,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  published_at  TEXT,

  -- Fiyat periyodu ilan tipiyle tutarlı olmalı: kiralık ise 'ay', satılık ise boş.
  -- COALESCE şart: SQLite'ta NULL karşılaştırması NULL döner ve CHECK sessizce geçer.
  CHECK (
    (listing_type = 'kiralik' AND COALESCE(price_period, '') = 'ay')
    OR (listing_type = 'satilik' AND price_period IS NULL)
  ),
  -- Yayınlanan ilanın yayın tarihi boş kalamaz.
  CHECK (status <> 'published' OR published_at IS NOT NULL)
);

-- Genele açık listeler her zaman status = 'published' ile başlar, bu yüzden
-- indekslerin tamamı status ile öncülenmiştir (SQLite sorgu başına tek indeks kullanır).
CREATE INDEX idx_listings_status_published_at ON listings (status, published_at DESC);
CREATE INDEX idx_listings_status_listing_type ON listings (status, listing_type, published_at DESC);
CREATE INDEX idx_listings_status_category     ON listings (status, category, published_at DESC);
CREATE INDEX idx_listings_status_district     ON listings (status, district, published_at DESC);
CREATE INDEX idx_listings_status_featured     ON listings (status, featured, published_at DESC);
-- Yönetim ekranı için: son güncellenenler.
CREATE INDEX idx_listings_updated_at          ON listings (updated_at DESC);

-- ---------------------------------------------------------------------------
-- submissions: iletişim formu talepleri.
-- Alanlar src/lib/contact-form.ts içindeki ContactFormValues sözleşmesiyle
-- birebir aynıdır: fullName, phone, email, service, message.
--
-- KİŞİSEL VERİ NOTU (KVKK):
--   Ham IP adresi kişisel veridir ve talebi değerlendirmek için gerekli değildir.
--   Bu yüzden IP asla saklanmaz. Kötüye kullanım ve tekrarlı gönderim analizi
--   için yalnızca sunucu tarafında tutulan gizli bir tuz (salt) ile üretilmiş
--   SHA-256 özeti (ip_hash) saklanır. Tuz olmadan özetten IP geri üretilemez,
--   tuz değiştirildiğinde eski özetler kendiliğinden anlamsızlaşır.
--   ip_hash opsiyoneldir: tuz tanımlı değilse NULL yazılır.
-- ---------------------------------------------------------------------------
CREATE TABLE submissions (
  id         TEXT PRIMARY KEY,
  full_name  TEXT NOT NULL,
  phone      TEXT NOT NULL,
  email      TEXT NOT NULL,
  service    TEXT NOT NULL,
  message    TEXT NOT NULL DEFAULT '',
  status     TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived')),
  -- Tuzlanmış SHA-256 özeti (hex). Ham IP saklanmaz, yukarıdaki nota bakınız.
  ip_hash    TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX idx_submissions_status_created_at ON submissions (status, created_at DESC);
CREATE INDEX idx_submissions_created_at        ON submissions (created_at DESC);

-- ---------------------------------------------------------------------------
-- imports: ilan içe aktarma denemeleri (yapıştırılan ilan metni veya link).
-- Ayrıştırma sonucu parsed_json içinde tutulur, uygulanınca listing_id dolar.
-- ---------------------------------------------------------------------------
CREATE TABLE imports (
  id          TEXT PRIMARY KEY,
  source_url  TEXT,
  -- Yapıştırılan ham içerik. Ayrıştırma hatası ayıklanabilsin diye saklanır.
  raw_input   TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'parsed', 'failed', 'applied')),
  -- Ayrıştırılan ilan alanları, JSON nesne metni.
  parsed_json TEXT,
  error       TEXT,
  -- Uygulandığında oluşan ilan. İlan silinirse kayıt tarihçe olarak kalır.
  listing_id  TEXT REFERENCES listings (id) ON DELETE SET NULL,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

  -- 'applied' durumu ancak bir ilana bağlanmışsa anlamlıdır.
  CHECK (status <> 'applied' OR listing_id IS NOT NULL),
  -- 'failed' durumu hata metni olmadan yazılamaz.
  CHECK (status <> 'failed' OR error IS NOT NULL)
);

CREATE INDEX idx_imports_status_created_at ON imports (status, created_at DESC);
CREATE INDEX idx_imports_created_at        ON imports (created_at DESC);
CREATE INDEX idx_imports_listing_id        ON imports (listing_id);

-- ---------------------------------------------------------------------------
-- GERİ ALMA (down). YIKICIDIR: tüm ilan, talep ve içe aktarma verisi silinir.
-- Üretim veritabanında çalıştırmadan önce yedek alın ve onay isteyin.
--
--   DROP TABLE IF EXISTS imports;
--   DROP TABLE IF EXISTS submissions;
--   DROP TABLE IF EXISTS listings;
--
-- Silme sırası önemlidir: imports.listing_id, listings tablosuna referans verir.
-- ---------------------------------------------------------------------------
