-- Phase 1: unified accounts, opaque sessions and dealer onboarding.
-- Existing users remain BUYER accounts; promotion is an explicit administrative operation.

CREATE TYPE "AccountRole" AS ENUM ('BUYER', 'SELLER', 'DEALER', 'ADMINISTRATOR', 'SUPER_ADMIN');
CREATE TYPE "DealerApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'CHANGES_REQUESTED', 'REJECTED');

ALTER TABLE "User"
  ADD COLUMN "firstName" TEXT,
  ADD COLUMN "lastName" TEXT,
  ADD COLUMN "country" TEXT,
  ADD COLUMN "city" TEXT,
  ADD COLUMN "role" "AccountRole" NOT NULL DEFAULT 'BUYER';

CREATE TABLE "AuthSession" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DealerProfile" (
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

CREATE UNIQUE INDEX "AuthSession_tokenHash_key" ON "AuthSession"("tokenHash");
CREATE INDEX "AuthSession_userId_idx" ON "AuthSession"("userId");
CREATE INDEX "AuthSession_expiresAt_idx" ON "AuthSession"("expiresAt");
CREATE UNIQUE INDEX "DealerProfile_ownerId_key" ON "DealerProfile"("ownerId");
CREATE INDEX "DealerProfile_approvalStatus_idx" ON "DealerProfile"("approvalStatus");
CREATE INDEX "DealerProfile_country_city_idx" ON "DealerProfile"("country", "city");

ALTER TABLE "AuthSession"
  ADD CONSTRAINT "AuthSession_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DealerProfile"
  ADD CONSTRAINT "DealerProfile_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
