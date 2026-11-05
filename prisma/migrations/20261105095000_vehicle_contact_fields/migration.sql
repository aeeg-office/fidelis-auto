-- Per-listing optional public contact overrides (contact identity, 2026-11-05)
ALTER TABLE "Vehicle" ADD COLUMN IF NOT EXISTS "contactEmail" TEXT;
ALTER TABLE "Vehicle" ADD COLUMN IF NOT EXISTS "contactPhone" TEXT;
