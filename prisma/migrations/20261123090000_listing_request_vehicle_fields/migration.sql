-- TASK-2026-037 / FID-AUD-401: add the rich vehicle fields to ListingRequest so
-- an approved listing keeps its price, type, city and expiry through autoPublish.
-- Purely additive: 13 new nullable/defaulted columns, no drops, no renames.
ALTER TABLE "ListingRequest" ADD COLUMN IF NOT EXISTS "mileageUnit" TEXT NOT NULL DEFAULT 'km';
ALTER TABLE "ListingRequest" ADD COLUMN IF NOT EXISTS "vehicleType" TEXT;
ALTER TABLE "ListingRequest" ADD COLUMN IF NOT EXISTS "price" TEXT;
ALTER TABLE "ListingRequest" ADD COLUMN IF NOT EXISTS "priceAmount" INTEGER;
ALTER TABLE "ListingRequest" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'EGP';
ALTER TABLE "ListingRequest" ADD COLUMN IF NOT EXISTS "bodyType" TEXT;
ALTER TABLE "ListingRequest" ADD COLUMN IF NOT EXISTS "fuelType" TEXT;
ALTER TABLE "ListingRequest" ADD COLUMN IF NOT EXISTS "isLicensed" BOOLEAN;
ALTER TABLE "ListingRequest" ADD COLUMN IF NOT EXISTS "makeId" TEXT;
ALTER TABLE "ListingRequest" ADD COLUMN IF NOT EXISTS "modelId" TEXT;
ALTER TABLE "ListingRequest" ADD COLUMN IF NOT EXISTS "cityId" TEXT;
ALTER TABLE "ListingRequest" ADD COLUMN IF NOT EXISTS "countryId" TEXT;
ALTER TABLE "ListingRequest" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMPTZ;