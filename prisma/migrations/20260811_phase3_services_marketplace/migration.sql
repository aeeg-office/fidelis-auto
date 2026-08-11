-- Phase 3: additive marketplace services directory.
CREATE TABLE IF NOT EXISTS "ServiceListing" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "businessName" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "phone" TEXT,
  "website" TEXT,
  "city" TEXT,
  "country" TEXT,
  "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ServiceListing_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ServiceListing_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "ServiceListing_isPublished_category_idx" ON "ServiceListing"("isPublished", "category");
CREATE INDEX IF NOT EXISTS "ServiceListing_ownerId_idx" ON "ServiceListing"("ownerId");
