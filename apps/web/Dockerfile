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
ENV CI=true
RUN npm ci --no-audit --no-fund

# Build the project
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
