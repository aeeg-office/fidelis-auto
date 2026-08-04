-- AlterTable: Add category and featuredUntil to Vehicle
ALTER TABLE "Vehicle" ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT 'Other';
ALTER TABLE "Vehicle" ADD COLUMN IF NOT EXISTS "featuredUntil" TIMESTAMP(3);