-- CreateEnum (idempotent — may exist from a partial apply or legacy schema)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'VehicleType') THEN
    CREATE TYPE "VehicleType" AS ENUM ('CAR', 'MOTORCYCLE');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FuelType') THEN
    CREATE TYPE "FuelType" AS ENUM ('PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'LPG', 'CNG', 'OTHER');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BodyType') THEN
    CREATE TYPE "BodyType" AS ENUM ('SEDAN', 'HATCHBACK', 'SUV', 'PICKUP', 'VAN', 'COUPE', 'CONVERTIBLE', 'WAGON', 'MPV', 'OTHER');
  END IF;
END $$;

-- AlterTable (idempotent column adds)
ALTER TABLE "Vehicle"
  ADD COLUMN IF NOT EXISTS "bodyType" "BodyType",
  ADD COLUMN IF NOT EXISTS "cityId" TEXT,
  ADD COLUMN IF NOT EXISTS "countryId" TEXT,
  ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'EGP',
  ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "fuelType" "FuelType",
  ADD COLUMN IF NOT EXISTS "isLicensed" BOOLEAN,
  ADD COLUMN IF NOT EXISTS "makeId" TEXT,
  ADD COLUMN IF NOT EXISTS "modelId" TEXT,
  ADD COLUMN IF NOT EXISTS "priceAmount" INTEGER,
  ADD COLUMN IF NOT EXISTS "vehicleType" "VehicleType" NOT NULL DEFAULT 'CAR';
ALTER TABLE "Vehicle" ALTER COLUMN "mileageUnit" SET DEFAULT 'km';

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "countryId" TEXT,
  ADD COLUMN IF NOT EXISTS "preferredLanguage" TEXT NOT NULL DEFAULT 'en';

-- CreateTable (idempotent)
CREATE TABLE IF NOT EXISTS "Country" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "phonePrefix" TEXT NOT NULL DEFAULT '+20',
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    "isEarlyAccess" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "City" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Make" (
    "id" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT,
    "vehicleType" "VehicleType" NOT NULL DEFAULT 'CAR',
    "origin" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Make_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Model" (
    "id" TEXT NOT NULL,
    "makeId" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT,
    "vehicleType" "VehicleType" NOT NULL DEFAULT 'CAR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Model_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "SiteSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (idempotent)
CREATE UNIQUE INDEX IF NOT EXISTS "Country_code_key" ON "Country"("code");
CREATE INDEX IF NOT EXISTS "City_countryId_nameEn_idx" ON "City"("countryId", "nameEn");
CREATE INDEX IF NOT EXISTS "Make_vehicleType_isActive_idx" ON "Make"("vehicleType", "isActive");
CREATE UNIQUE INDEX IF NOT EXISTS "Make_nameEn_vehicleType_key" ON "Make"("nameEn", "vehicleType");
CREATE INDEX IF NOT EXISTS "Model_makeId_vehicleType_idx" ON "Model"("makeId", "vehicleType");
CREATE UNIQUE INDEX IF NOT EXISTS "Model_makeId_nameEn_key" ON "Model"("makeId", "nameEn");
CREATE UNIQUE INDEX IF NOT EXISTS "SiteSetting_key_key" ON "SiteSetting"("key");
CREATE INDEX IF NOT EXISTS "Vehicle_countryId_vehicleType_isPublished_priceAmount_idx" ON "Vehicle"("countryId", "vehicleType", "isPublished", "priceAmount");
CREATE INDEX IF NOT EXISTS "Vehicle_makeId_modelId_year_idx" ON "Vehicle"("makeId", "modelId", "year");
CREATE INDEX IF NOT EXISTS "Vehicle_cityId_idx" ON "Vehicle"("cityId");

-- AddForeignKey (idempotent via constraint checks)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'City_countryId_fkey') THEN
    ALTER TABLE "City" ADD CONSTRAINT "City_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Model_makeId_fkey') THEN
    ALTER TABLE "Model" ADD CONSTRAINT "Model_makeId_fkey" FOREIGN KEY ("makeId") REFERENCES "Make"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Vehicle_countryId_fkey') THEN
    ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Vehicle_cityId_fkey') THEN
    ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Vehicle_makeId_fkey') THEN
    ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_makeId_fkey" FOREIGN KEY ("makeId") REFERENCES "Make"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Vehicle_modelId_fkey') THEN
    ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'User_countryId_fkey') THEN
    ALTER TABLE "User" ADD CONSTRAINT "User_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
