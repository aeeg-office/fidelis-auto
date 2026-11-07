-- WS15: P2 media — walkaround video clip(s) + one engine sound clip per listing.
-- Additive-only: nullable columns, ADD COLUMN IF NOT EXISTS for idempotence on
-- partially-applied environments. No data removal, no type changes, no indexes named.
ALTER TABLE "Vehicle" ADD COLUMN IF NOT EXISTS "videoUrls" TEXT;
ALTER TABLE "Vehicle" ADD COLUMN IF NOT EXISTS "audioUrl" TEXT;
ALTER TABLE "ListingRequest" ADD COLUMN IF NOT EXISTS "audioUrl" TEXT;
