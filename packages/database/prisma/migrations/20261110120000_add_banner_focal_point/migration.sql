-- Adds the "focalPoint" field to StoreBanner so each banner can decide how the
-- image is cropped when it does not fit the box (mobile cover / desktop cover).
--
-- SAFETY: this migration is fully idempotent (ADD COLUMN IF NOT EXISTS) and it is
-- additive only. It never drops, renames or rewrites existing columns, and it
-- never deletes rows. Running it on a database that already has this column is
-- a no-op.
--
-- NOTE: it was intentionally NOT generated with `prisma migrate dev`, because that
-- command can reset (drop + recreate) the database when it detects drift. This file
-- is applied with `prisma migrate deploy`, which only applies pending SQL.

-- Where the image is anchored when the aspect ratio does not match the frame:
-- 'center' | 'top' | 'bottom' | 'left' | 'right'.
-- Existing rows are backfilled with 'center' by the DEFAULT clause.
ALTER TABLE "StoreBanner" ADD COLUMN IF NOT EXISTS "focalPoint" TEXT DEFAULT 'center';

-- Safety net: normalise any empty value left behind by a previous manual ALTER.
UPDATE "StoreBanner" SET "focalPoint" = 'center' WHERE "focalPoint" IS NULL OR "focalPoint" = '';
