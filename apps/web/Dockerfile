FROM node:20-alpine AS base

# Configure npm for resilient downloads globally
RUN npm config set fetch-retries 10 && \
    npm config set fetch-retry-mintimeout 30000 && \
    npm config set fetch-retry-maxtimeout 300000 && \
    npm config set fetch-timeout 600000

# Phase 1: Prune
FROM base AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY . .
RUN npm install -g turbo
RUN turbo prune --scope=web --docker

# Phase 2: Install and Build
FROM base AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Build args if needed in future
# RUN npm install -g prisma@7.2.0 (Removed to avoid WASM module errors)

# Copy lockfile and package.json's of isolated subworkspace
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json

# Install dependencies
# - El cache de npm se monta en /root/.npm: no entra en la imagen y se reusa
#   entre deploys. Sin esto cada build baja el arbol completo otra vez.
# - El eco cada 30s mantiene vivo el log: `npm ci` no imprime nada mientras
#   instala y un build sin salida se ve como colgado (y el watchdog del
#   orquestador lo corta).
ENV CI=true
RUN --mount=type=cache,target=/root/.npm \
    set -eux; \
    ( while :; do echo "[shopylink] instalando dependencias (sigue en curso)..."; sleep 30; done ) & \
    KEEPALIVE=$!; \
    npm ci --no-audit --no-fund --prefer-offline; \
    kill "${KEEPALIVE}" 2>/dev/null || true

# Copy source files and build
COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json

# Build args
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_FRONTEND_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_FRONTEND_URL=$NEXT_PUBLIC_FRONTEND_URL

# Build web - this generates the standalone server
RUN npx turbo run build --filter=web... --concurrency=1

# La ruta /api/og/[slug] usa `@vercel/og` para componer la imagen de compartir.
# Ese modulo se queda como dependencia externa y lee la fuente (.ttf) y los
# modulos wasm desde el disco con `import.meta.url` (en la misma carpeta que
# index.node.js). El trazado de archivos de Next solo copia el
# `index.node.js`, asi que sin estos archivos la ruta revienta al generar la
# imagen. Se copian a mano junto al bundle.
# Si la ruta cambia en una version de Next, el paso no puede tumbar el
# deploy: se avisa en el log y sigue.
RUN set -eux; \
    OG_DST=/app/apps/web/.next/standalone/node_modules/next/dist/compiled/@vercel/og; \
    if [ -d "$OG_DST" ]; then \
        for OG_SRC in /app/node_modules/next/dist/compiled/@vercel/og /app/apps/web/node_modules/next/dist/compiled/@vercel/og; do \
            if [ -d "$OG_SRC" ]; then \
                cp -f "$OG_SRC"/*.ttf "$OG_SRC"/*.wasm "$OG_DST"/ 2>/dev/null || true; \
                echo "[shopylink] assets de @vercel/og copiados desde $OG_SRC"; \
                break; \
            fi; \
        done; \
        ls -la "$OG_DST"; \
    else \
        echo "[shopylink] no hay bundle standalone: se omite copiar los assets de @vercel/og"; \
    fi

# Phase 3: Runner
FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/next.config.js ./apps/web/next.config.js
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

EXPOSE 8191

ENV PORT 8191
ENV HOSTNAME "0.0.0.0"

CMD ["node", "apps/web/server.js"]
