FROM node:20-alpine AS base

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

# Copy lockfile and package.json's of isolated subworkspace
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json

# Install dependencies
RUN npm install --no-audit --no-fund

# Build the project
COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json

# Build args
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build web - generate prisma client first to avoid build errors
RUN npx prisma@6.19.2 generate --schema=packages/database/prisma/schema.prisma
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

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "apps/web/server.js"]
