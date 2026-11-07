-- WS12 Curated Collections L+ — additive (2026-11-07)
-- Creates the curated-collections tables. No destructive ops; no existing data touched.

CREATE TABLE IF NOT EXISTS "Collection" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "titleEn" TEXT NOT NULL,
  "titleAr" TEXT,
  "descriptionEn" TEXT,
  "descriptionAr" TEXT,
  "coverImage" TEXT,
  "isVisible" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Collection_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Collection_slug_key" UNIQUE ("slug")
);

CREATE TABLE IF NOT EXISTS "CollectionVehicle" (
  "collectionId" TEXT NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CollectionVehicle_pkey" PRIMARY KEY ("collectionId", "vehicleId")
);

CREATE INDEX IF NOT EXISTS "Collection_isVisible_sortOrder_idx" ON "Collection"("isVisible", "sortOrder");
CREATE INDEX IF NOT EXISTS "CollectionVehicle_vehicleId_idx" ON "CollectionVehicle"("vehicleId");

-- FK constraints added idempotently via DO blocks (PostgreSQL does NOT support
-- IF NOT EXISTS on ADD CONSTRAINT).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CollectionVehicle_collectionId_fkey') THEN
    ALTER TABLE "CollectionVehicle" ADD CONSTRAINT "CollectionVehicle_collectionId_fkey"
      FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CollectionVehicle_vehicleId_fkey') THEN
    ALTER TABLE "CollectionVehicle" ADD CONSTRAINT "CollectionVehicle_vehicleId_fkey"
      FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;