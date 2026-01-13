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

# Copy lockfile and package.json's of isolated subworkspace
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json

# Install dependencies
RUN npm install

# Build the project
COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json

# Build api
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma
RUN npx turbo run build --filter=api...

# Phase 2.5: Production Dependencies
FROM base AS prod-deps
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
COPY --from=pruner /app/out/full/packages/database/prisma/schema.prisma ./packages/database/prisma/schema.prisma
RUN npm install --omit=dev
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma

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
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/packages/database/prisma/schema.prisma ./prisma/schema.prisma

EXPOSE 3001

CMD ["node", "dist/main"]
