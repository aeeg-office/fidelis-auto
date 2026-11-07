-- WS14: verified-user reviews + admin moderation (spec P2 trust).
-- Additive-only: creates the ReviewStatus enum (idempotent DO block) and the Review
-- table without touching existing tables/columns.

DO $$
BEGIN
  CREATE TYPE "ReviewStatus" AS ENUM ('published', 'under_review', 'removed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "Review" (
    "id"              TEXT          NOT NULL,
    "vehicleId"       TEXT          NOT NULL,
    "authorId"        TEXT          NOT NULL,
    "rating"          INTEGER       NOT NULL,
    "text"            TEXT          NOT NULL,
    "providerContext" TEXT,
    "status"          "ReviewStatus" NOT NULL DEFAULT 'under_review',
    "createdAt"       TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Review_vehicleId_status_createdAt_idx" ON "Review"("vehicleId", "status", "createdAt");
CREATE INDEX IF NOT EXISTS "Review_authorId_idx" ON "Review"("authorId");
CREATE INDEX IF NOT EXISTS "Review_status_createdAt_idx" ON "Review"("status", "createdAt");

ALTER TABLE "Review" ADD CONSTRAINT "Review_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
