# Node 22 y no 20: `@supabase/supabase-js` 2.119 exige Node 22+ y al crear el
# cliente de Supabase revienta con "Node.js detected but native WebSocket not
# found" en Node 20. Sin eso la API no puede tener SUPABASE_KEY (y con ella no
# puede subir ni borrar archivos en el bucket).
FROM node:22-alpine AS base

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
RUN turbo prune --scope=api --docker

# Phase 2: Install and Build
FROM base AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Build args if needed in future
# RUN npm install -g prisma@7.2.0 (Removed to avoid WASM module errors)

# Copy lockfile and package.json's of isolated subworkspace
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json

# Install all dependencies
# - El cache de npm se monta en /root/.npm: no entra en la imagen y se
#   reusa entre los tres `npm ci` del build (builder y prod-deps) y entre
#   deploys. Sin esto cada etapa baja el arbol completo otra vez.
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

# Build api
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma
RUN npx turbo run build --filter=api... --concurrency=1

# Phase 2.5: Production Dependencies
# Se poda el node_modules del builder en vez de hacer un `npm ci --omit=dev`
# aparte: el prune no descarga nada (los paquetes ya estan en disco), asi que
# el build deja de instalar el arbol de dependencias por tercera vez.
FROM builder AS prod-deps
RUN npm prune --omit=dev --no-audit --no-fund

# Copy generated Prisma client (the actual artifacts)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Phase 3: Runner
FROM base AS runner
WORKDIR /app

# Install openssl for Prisma and libc6-compat for sharp (Alpine)
RUN apk add --no-cache openssl libc6-compat

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./dist
COPY --from=prod-deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/packages/database ./packages/database
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json

EXPOSE 3001

CMD ["node", "dist/main"]
