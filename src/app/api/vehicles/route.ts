import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/vehicles — public listings with basic filters + sort (WS3 L).
 *
 * Query params (all optional):
 *   type      CAR | MOTORCYCLE            (Vehicle.vehicleType)
 *   make      string                      (Vehicle.make text — reliable across legacy rows)
 *   model     string
 *   priceMin / priceMax  digits (EGP pounds) — converted to piastres (priceAmount is smallest unit)
 *   city      string                      (matches the linked City.nameEn/nameAr)
 *   sort      newest | price_low | price_high              (default newest)
 *
 * WS9 extended filters (all optional, additive, enum-guarded like `type`):
 *   year            int                       (exact Vehicle.year)
 *   maxMileage      int                       (Vehicle.mileage <= value)
 *   bodyType        SEDAN | HATCHBACK | SUV | PICKUP | VAN | COUPE | CONVERTIBLE | WAGON | MPV | OTHER
 *   fuelType        PETROL | DIESEL | ELECTRIC | HYBRID | LPG | CNG | OTHER
 *   transmission    string                    (Vehicle.transmission text, case-insensitive)
 *
 * Uses the WS1 launch index (countryId, vehicleType, isPublished, priceAmount). Empty results are
 * never fabricated (FID-010).
 */

const VALID_SORTS = new Set(["newest", "price_low", "price_high"]);

/** Valid VehicleType enum values (from prisma schema) — guards the Prisma enum from garbage. */
const VALID_VEHICLE_TYPES = new Set(["CAR", "MOTORCYCLE"]);

/** Valid BodyType enum values (from prisma schema) — guards the Prisma enum from garbage. */
const VALID_BODY_TYPES = new Set([
  "SEDAN", "HATCHBACK", "SUV", "PICKUP", "VAN", "COUPE",
  "CONVERTIBLE", "WAGON", "MPV", "OTHER",
]);

/** Valid FuelType enum values (from prisma schema) — guards the Prisma enum from garbage. */
const VALID_FUEL_TYPES = new Set([
  "PETROL", "DIESEL", "ELECTRIC", "HYBRID", "LPG", "CNG", "OTHER",
]);

function asText(v: string | null): string | null {
  return v && v.trim() ? v.trim() : null;
}
function asInt(v: string | null): number | null {
  if (!v || !/^\d+$/.test(v.trim())) return null;
  const n = Number(v.trim());
  return Number.isFinite(n) ? n : null;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const typeRaw = asText(url.searchParams.get("type"));
    // Guard the Prisma enum: an invalid vehicleType must not reach the query (would throw enum
    // validation and hit the catch-all 500). Unknown types behave like no filter, never invent data.
    const type = typeRaw && VALID_VEHICLE_TYPES.has(typeRaw as never) ? typeRaw : null;
    const make = asText(url.searchParams.get("make"));
    const model = asText(url.searchParams.get("model"));
    const city = asText(url.searchParams.get("city"));
    const priceMinLbs = asInt(url.searchParams.get("priceMin"));
    const priceMaxLbs = asInt(url.searchParams.get("priceMax"));
    const year = asInt(url.searchParams.get("year"));
    const maxMileage = asInt(url.searchParams.get("maxMileage"));
    // Same enum-guarding as `type`: garbage bodyType/fuelType must never reach the Prisma query.
    const bodyType = asText(url.searchParams.get("bodyType"));
    const bodyTypeSafe = bodyType && VALID_BODY_TYPES.has(bodyType as never) ? bodyType : null;
    const fuelType = asText(url.searchParams.get("fuelType"));
    const fuelTypeSafe = fuelType && VALID_FUEL_TYPES.has(fuelType as never) ? fuelType : null;
    const transmission = asText(url.searchParams.get("transmission"));
    const sortRaw = url.searchParams.get("sort");
    const sort = sortRaw && VALID_SORTS.has(sortRaw) ? sortRaw : "newest";

    // price filters are in EGP pounds -> smallest units (piastres) for priceAmount.
    const priceMinPiastres = priceMinLbs !== null ? priceMinLbs * 100 : null;
    const priceMaxPiastres = priceMaxLbs !== null ? priceMaxLbs * 100 : null;

    const where: Record<string, unknown> = {
      isPublished: true,
      // WS3: only live listings — exclude expired. Null = unlimited (older rows / admin choice).
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    };
    if (type) where.vehicleType = type;
    if (make) where.make = { contains: make, mode: "insensitive" };
    if (model) where.model = { contains: model, mode: "insensitive" };
    if (priceMinPiastres !== null || priceMaxPiastres !== null) {
      if (priceMinPiastres !== null && priceMaxPiastres !== null) {
        where.priceAmount = { gte: priceMinPiastres, lte: priceMaxPiastres };
      } else if (priceMinPiastres !== null) {
        where.priceAmount = { gte: priceMinPiastres };
      } else {
        where.priceAmount = { lte: priceMaxPiastres };
      }
    }
    if (city) {
      // city is the WS1 City relation; filter on its EN/AR names.
      where.city = {
        is: {
          OR: [
            { nameEn: { contains: city, mode: "insensitive" } },
            { nameAr: { contains: city, mode: "insensitive" } },
          ],
        },
      };
    }
    // WS9 extended filters — additive; each behaves like no filter when absent.
    if (year !== null) where.year = year;
    if (maxMileage !== null) where.mileage = { lte: maxMileage };
    if (bodyTypeSafe) where.bodyType = bodyTypeSafe;
    if (fuelTypeSafe) where.fuelType = fuelTypeSafe;
    if (transmission) where.transmission = { contains: transmission, mode: "insensitive" };

    let orderBy: Record<string, string>[] = [{ order: "asc" }];
    if (sort === "newest") orderBy = [{ createdAt: "desc" }];
    else if (sort === "price_low") orderBy = [{ priceAmount: "asc" }, { order: "asc" }];
    else if (sort === "price_high") orderBy = [{ priceAmount: "desc" }, { order: "asc" }];

    const vehicles = await prisma.vehicle.findMany({
      where,
      orderBy,
      select: {
        slug: true,
        title: true,
        year: true,
        make: true,
        model: true,
        trim: true,
        mileage: true,
        mileageUnit: true,
        vehicleType: true,
        price: true,
        priceAmount: true,
        images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
        city: { select: { nameEn: true, nameAr: true } },
      },
    });

    const result = vehicles.map((v) => {
      const primary = v.images.find((i) => i.isPrimary) ?? v.images[0];
      return {
        slug: v.slug,
        title: v.title,
        year: v.year,
        make: v.make,
        model: v.model,
        trim: v.trim,
        mileage: v.mileage,
        mileageUnit: v.mileageUnit,
        vehicleType: v.vehicleType,
        price: v.price,
        priceAmount: v.priceAmount,
        city: v.city?.nameEn ?? null,
        country: null as string | null,
        image: (primary?.src ?? null) ?? `/images/placeholder-${v.slug}.svg`,
      };
    });

    return NextResponse.json(result);
  } catch {
    // DB unreachable — return empty, never fabricated inventory (FID-010).
    return NextResponse.json([]);
  }
}