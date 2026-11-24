-- WS-SD Service Directory: additive only (2026-11-24). No existing column is altered or dropped.
DO $$ BEGIN
  CREATE TYPE "ServiceSource" AS ENUM ('SELF_SUBMITTED', 'DIRECTORY_RESEARCH');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "ServiceClaimStatus" AS ENUM ('UNCLAIMED', 'CLAIM_PENDING', 'CLAIMED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "ServiceVerificationLevel" AS ENUM ('UNVERIFIED', 'SOURCE_VERIFIED', 'FIDELIS_VERIFIED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "ServiceLeadKind" AS ENUM ('WHATSAPP_TAP', 'CALL_TAP', 'WEBSITE_TAP', 'PROFILE_VIEW', 'CLAIM_CLICK');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "ServiceListing"
  ADD COLUMN IF NOT EXISTS "descriptionAr" TEXT,
  ADD COLUMN IF NOT EXISTS "businessNameAr" TEXT,
  ADD COLUMN IF NOT EXISTS "source" "ServiceSource" NOT NULL DEFAULT 'SELF_SUBMITTED',
  ADD COLUMN IF NOT EXISTS "claimStatus" "ServiceClaimStatus" NOT NULL DEFAULT 'CLAIMED',
  ADD COLUMN IF NOT EXISTS "verificationLevel" "ServiceVerificationLevel" NOT NULL DEFAULT 'UNVERIFIED',
  ADD COLUMN IF NOT EXISTS "sourceUrls" TEXT,
  ADD COLUMN IF NOT EXISTS "researchedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "lastVerifiedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "cityId" TEXT,
  ADD COLUMN IF NOT EXISTS "governorate" TEXT,
  ADD COLUMN IF NOT EXISTS "district" TEXT,
  ADD COLUMN IF NOT EXISTS "landmark" TEXT,
  ADD COLUMN IF NOT EXISTS "address" TEXT,
  ADD COLUMN IF NOT EXISTS "mapsUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "hours" TEXT,
  ADD COLUMN IF NOT EXISTS "email" TEXT,
  ADD COLUMN IF NOT EXISTS "instagram" TEXT,
  ADD COLUMN IF NOT EXISTS "facebook" TEXT,
  ADD COLUMN IF NOT EXISTS "subType" TEXT,
  ADD COLUMN IF NOT EXISTS "authorisedBrands" TEXT,
  ADD COLUMN IF NOT EXISTS "servicesOffered" TEXT,
  ADD COLUMN IF NOT EXISTS "makesServed" TEXT,
  ADD COLUMN IF NOT EXISTS "vehicleTypes" TEXT,
  ADD COLUMN IF NOT EXISTS "eras" TEXT,
  ADD COLUMN IF NOT EXISTS "options" TEXT,
  ADD COLUMN IF NOT EXISTS "yearEstablished" INTEGER,
  ADD COLUMN IF NOT EXISTS "paymentMethods" TEXT,
  ADD COLUMN IF NOT EXISTS "priceFrom" TEXT,
  ADD COLUMN IF NOT EXISTS "warranty" TEXT,
  ADD COLUMN IF NOT EXISTS "certifications" TEXT,
  ADD COLUMN IF NOT EXISTS "dedupeKey" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "ServiceListing_dedupeKey_key" ON "ServiceListing"("dedupeKey");
CREATE INDEX IF NOT EXISTS "ServiceListing_source_claimStatus_idx" ON "ServiceListing"("source", "claimStatus");
CREATE INDEX IF NOT EXISTS "ServiceListing_cityId_idx" ON "ServiceListing"("cityId");

DO $$ BEGIN
  ALTER TABLE "ServiceListing" ADD CONSTRAINT "ServiceListing_cityId_fkey"
    FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "ServiceLead" (
  "id" TEXT NOT NULL,
  "serviceListingId" TEXT NOT NULL,
  "kind" "ServiceLeadKind" NOT NULL,
  "dayHash" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ServiceLead_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ServiceLead_serviceListingId_kind_createdAt_idx" ON "ServiceLead"("serviceListingId", "kind", "createdAt");
DO $$ BEGIN
  ALTER TABLE "ServiceLead" ADD CONSTRAINT "ServiceLead_serviceListingId_fkey"
    FOREIGN KEY ("serviceListingId") REFERENCES "ServiceListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
