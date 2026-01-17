FROM node:20-alpine AS base

# Phase 1: Prune
FROM base AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY . .
RUN npm install -g turbo
RUN turbo prune --scope=api --docker

# Phase 2: Install and Build
FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy the full workspace first
COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json
COPY --from=pruner /app/out/package-lock.json ./package-lock.json

# Install all dependencies (including devDependencies for build)
RUN npm install

# Build api
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma
RUN npx turbo run build --filter=api...

# Phase 2.5: Production Dependencies
FROM base AS prod-deps
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm install --omit=dev
# Copy generated Prisma client from builder
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Phase 3: Runner
FROM base AS runner
WORKDIR /app

# Install openssl for Prisma
RUN apk add --no-cache openssl

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/packages/database ./packages/database
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/packages/database/prisma/schema.prisma ./prisma/schema.prisma

EXPOSE 3001

CMD ["node", "dist/src/main"]
