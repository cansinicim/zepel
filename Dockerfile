# syntax=docker/dockerfile:1

# Zepel Gayrimenkul, Next.js 16 standalone production imajı
# Aşamalar: deps (bağımlılık) -> builder (derleme) -> runner (çalışma zamanı)

# Yerel geliştirme toolchain'i ile birebir aynı sürüm (node 24.12.0 / npm 11.6.2).
# Sabit sürüm, npm'in lock dosyasını platformlar arası aynı şekilde çözmesini garanti eder.
ARG NODE_VERSION=24.12.0-alpine

# ---------------------------------------------------------------------------
# 1) deps: sadece bağımlılıkları kur, katman önbelleği için ayrı tutulur
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS deps
WORKDIR /app

# Yalnızca manifest dosyaları kopyalanır; kaynak değişince bu katman yeniden kurulmaz
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ---------------------------------------------------------------------------
# 2) builder: uygulamayı derle (standalone çıktı)
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ---------------------------------------------------------------------------
# 3) runner: ince çalışma zamanı imajı, root olmayan kullanıcı
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 --ingroup nodejs nextjs

# Statik varlıklar ve standalone sunucu çıktısı
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/ || exit 1

CMD ["node", "server.js"]
