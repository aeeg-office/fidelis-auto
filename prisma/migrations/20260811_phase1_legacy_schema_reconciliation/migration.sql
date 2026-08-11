-- Reconcile the legacy Fidelis production schema after baselining the historical
-- migrations. This migration is deliberately idempotent for the existing
-- production database, while remaining a no-op after a clean unified-auth migration.

DO $$
BEGIN
  CREATE TYPE "AccountRole" AS ENUM ('BUYER', 'SELLER', 'DEALER', 'ADMINISTRATOR', 'SUPER_ADMIN');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "DealerApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'CHANGES_REQUESTED', 'REJECTED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "firstName" TEXT,
  ADD COLUMN IF NOT EXISTS "lastName" TEXT,
  ADD COLUMN IF NOT EXISTS "country" TEXT,
  ADD COLUMN IF NOT EXISTS "city" TEXT,
  ADD COLUMN IF NOT EXISTS "role" "AccountRole" NOT NULL DEFAULT 'BUYER';

-- Legacy production stored roles as text. Normalize its known values before
-- changing the column to the application enum, preserving privileged accounts.
DO $$
DECLARE
  role_type TEXT;
BEGIN
  SELECT c.udt_name
    INTO role_type
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = 'User'
    AND c.column_name = 'role';

  IF role_type IS DISTINCT FROM 'AccountRole' THEN
    UPDATE "User"
    SET "role" = CASE lower("role"::text)
      WHEN 'admin' THEN 'ADMINISTRATOR'
      WHEN 'administrator' THEN 'ADMINISTRATOR'
      WHEN 'super_admin' THEN 'SUPER_ADMIN'
      WHEN 'super-admin' THEN 'SUPER_ADMIN'
      WHEN 'dealer' THEN 'DEALER'
      WHEN 'seller' THEN 'SELLER'
      ELSE 'BUYER'
    END;

    ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
    ALTER TABLE "User"
      ALTER COLUMN "role" TYPE "AccountRole"
      USING "role"::text::"AccountRole";
    ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'BUYER';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "AuthSession" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "DealerProfile" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "businessName" TEXT NOT NULL,
  "contactPerson" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "website" TEXT,
  "logoUrl" TEXT,
  "approvalStatus" "DealerApprovalStatus" NOT NULL DEFAULT 'PENDING',
  "approvedAt" TIMESTAMP(3),
  "approvedById" TEXT,
  "moderationNotes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DealerProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AuthSession_tokenHash_key" ON "AuthSession"("tokenHash");
CREATE INDEX IF NOT EXISTS "AuthSession_userId_idx" ON "AuthSession"("userId");
CREATE INDEX IF NOT EXISTS "AuthSession_expiresAt_idx" ON "AuthSession"("expiresAt");
CREATE UNIQUE INDEX IF NOT EXISTS "DealerProfile_ownerId_key" ON "DealerProfile"("ownerId");
CREATE INDEX IF NOT EXISTS "DealerProfile_approvalStatus_idx" ON "DealerProfile"("approvalStatus");
CREATE INDEX IF NOT EXISTS "DealerProfile_country_city_idx" ON "DealerProfile"("country", "city");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'AuthSession_userId_fkey'
  ) THEN
    ALTER TABLE "AuthSession"
      ADD CONSTRAINT "AuthSession_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'DealerProfile_ownerId_fkey'
  ) THEN
    ALTER TABLE "DealerProfile"
      ADD CONSTRAINT "DealerProfile_ownerId_fkey"
      FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
