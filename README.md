# Zepel Gayrimenkul

Premium gayrimenkul tanıtım sitesi. Next.js 16 App Router, React 19, TypeScript ve Tailwind CSS v4 ile geliştirilmiştir. Animasyonlar GSAP, Motion ve Lenis ile yapılır.

## Gereksinimler

- Node.js 24 veya üzeri
- npm 11 veya üzeri
- Docker 24+ (opsiyonel, konteynerli çalıştırma için)

## Kurulum ve geliştirme

```bash
npm install
cp .env.example .env   # değerleri kendinize göre doldurun
npm run dev
```

Uygulama http://localhost:3000 adresinde açılır.

## Komutlar

| Komut | Açıklama |
| --- | --- |
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Production derlemesi (standalone çıktı) |
| `npm start` | Derlenmiş uygulamayı çalıştırır |
| `npm run lint` | ESLint denetimi |
| `npm run typecheck` | TypeScript tip denetimi |
| `npm run docker:build` | Docker imajını üretir |
| `npm run docker:run` | Docker imajını 3000 portunda çalıştırır |

## Docker ile çalıştırma

Multi-stage `Dockerfile` (deps, builder, runner) ince bir Alpine tabanlı imaj üretir; uygulama root olmayan `nextjs` kullanıcısı ile çalışır ve Next.js standalone çıktısını kullanır.

```bash
# imajı derle
docker build -t zepel:latest .

# çalıştır
docker run --rm -p 3000:3000 --name zepel zepel:latest
```

Docker Compose ile (yerel önizleme):

```bash
docker compose up --build
# arka planda: docker compose up -d --build
# durdurmak için: docker compose down
```

`WEB_PORT` ortam değişkeni ile host portu değiştirilebilir (varsayılan 3000). `.env` dosyası varsa compose tarafından otomatik yüklenir, yoksa yok sayılır.

## Dizin yapısı

```
src/
  app/            App Router sayfaları, layout, global stiller, server actions
    actions/      Form gönderimi gibi server action'lar
    portfoy/      Portföy (ilan) rotaları
  components/
    layout/       Header, footer, sayfa iskeleti
    sections/     Ana sayfa bölümleri (hero, hakkımızda, iletişim vb.)
    property/     İlan kartı ve ilan detay bileşenleri
    ui/           Yeniden kullanılabilir arayüz parçaları
  content/        Site içeriği ve veri kaynakları (statik TypeScript)
  lib/            Yardımcı fonksiyonlar (biçimlendirme, ikonlar, form)
public/           Statik varlıklar (görsel, ikon)
```

Altyapı dosyaları kök dizindedir: `Dockerfile`, `.dockerignore`, `docker-compose.yml`, `vercel.json`, `next.config.ts`.

## Ortam değişkenleri

Tüm değişkenler `.env.example` içinde şablon olarak listelenmiştir. `.env` sürüm kontrolüne alınmaz, gizli anahtarlar koda gömülmez.

- `NEXT_PUBLIC_SITE_URL`: sitenin kanonik adresi (metadata, sitemap, Open Graph)
- `WEB_PORT`: Docker Compose host portu
- İletişim formu e-posta sağlayıcısı ve analitik anahtarları ileride eklenecek yer tutuculardır.

## Deploy

Birincil hedef Vercel'dir. Depo Vercel projesine bağlandığında `main` dalına yapılan push production dağıtımını, diğer dallar preview dağıtımını tetikler. `vercel.json` içinde framework tanımı, güvenlik başlıkları (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, HSTS) ve statik varlıklar için uzun süreli cache-control tanımlıdır.

Alternatif olarak `output: "standalone"` sayesinde uygulama herhangi bir konteyner ortamında (VPS, ECS, Cloud Run) yukarıdaki Docker imajı ile çalıştırılabilir. Konteyner 3000 portunu dinler ve `HEALTHCHECK` ile sağlık durumu raporlar.

Production ortam değişkenleri Vercel proje ayarlarından veya konteyner ortamının secret yönetiminden verilir, imaja gömülmez.
