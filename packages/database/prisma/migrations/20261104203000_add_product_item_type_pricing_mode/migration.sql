-- Adds the "itemType" / "pricingMode" discriminator to Product so a store can
-- publish physical products AND services from the same catalogue.
--
-- SAFETY: this migration is fully idempotent (ADD COLUMN IF NOT EXISTS) and it is
-- additive only. It never drops, renames or rewrites existing columns, and it never
-- deletes rows. Running it on a database that already has these columns is a no-op.
--
-- NOTE: it was intentionally NOT generated with `prisma migrate dev`, because that
-- command can reset (drop + recreate) the database when it detects drift. This file
-- is applied with `prisma migrate deploy`, which only applies pending SQL.

-- Physical product (default) vs. service.
-- Existing rows are backfilled with 'product' by the DEFAULT clause.
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "itemType" TEXT NOT NULL DEFAULT 'product';

-- Pricing semantics for services: 'fixed' | 'from' | 'hourly' | 'quote' | NULL.
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "pricingMode" TEXT;

-- Safety net: normalise any empty value left behind by a previous manual ALTER.
UPDATE "Product" SET "itemType" = 'product' WHERE "itemType" IS NULL OR "itemType" = '';
