-- WS11 Services L+ — additive provider-profile fields (2026-11-07)
ALTER TABLE "ServiceListing" ADD COLUMN IF NOT EXISTS "specialties" TEXT;
ALTER TABLE "ServiceListing" ADD COLUMN IF NOT EXISTS "languages" TEXT;
ALTER TABLE "ServiceListing" ADD COLUMN IF NOT EXISTS "coverageArea" TEXT;
ALTER TABLE "ServiceListing" ADD COLUMN IF NOT EXISTS "whatsapp" TEXT;