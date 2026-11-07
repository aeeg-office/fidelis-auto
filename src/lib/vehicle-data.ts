import { prisma } from "@/lib/prisma";
import type { VehicleCardData } from "@/components/VehicleCard";

/**
 * Shared, genuinely-DB-driven vehicle-card loader.
 * FID-010: replaces all hardcoded placeholder inventory with real
 * published vehicles and their real primary image. Never fabricates
 * demo stock — returns [] when the database has nothing to show.
 */

interface GetVehiclesOptions {
  /** "available" (default) | "sold" | "pending" | "all" */
  status?: "available" | "sold" | "pending" | "all";
  /** "featured" (featured first, then stock order) | "recent" (newest first) */
  orderBy?: "featured" | "recent";
  limit?: number;
}

function primaryImage(vehicle: { images: { src: string; isPrimary: boolean }[] }): string | null {
  if (!vehicle.images || vehicle.images.length === 0) return null;
  const primary = vehicle.images.find((i) => i.isPrimary) ?? vehicle.images[0];
  return primary ? primary.src : null;
}

export async function getVehicles(opts: GetVehiclesOptions = {}): Promise<VehicleCardData[]> {
  const {
    status = "available",
    orderBy = "featured",
    limit,
  } = opts;

  const where: Record<string, unknown> = { isPublished: true };
  if (status !== "all") where.status = status;

  const order =
    orderBy === "recent"
      ? [{ createdAt: "desc" as const }]
      : [{ isFeatured: "desc" as const }, { order: "asc" as const }];

  // A vehicle counts as "featured" only while its feature has not expired.
  // Expired features must not rank first or appear in the featured section.
  const activeFeatured: Record<string, unknown> = {
    isFeatured: true,
    OR: [{ featuredUntil: null }, { featuredUntil: { gte: new Date() } }],
  };
  if (orderBy === "featured") {
    where.OR = [activeFeatured, { isFeatured: false }];
  }

  try {
    const rows = await prisma.vehicle.findMany({
      where,
      include: { images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] } },
      orderBy: order,
      ...(limit ? { take: limit } : {}),
    });

    return rows.map((v) => ({
      slug: v.slug,
      title: v.title,
      year: v.year,
      make: v.make,
      model: v.model,
      trim: v.trim,
      mileage: v.mileage,
      mileageUnit: v.mileageUnit,
      exteriorColor: v.exteriorColor,
      engine: v.engine,
      transmission: v.transmission,
      bodyType: v.bodyType,
      fuelType: v.fuelType,
      price: v.price,
      city: null,
      country: null,
      createdAt: v.createdAt.getTime(),
      image:
        primaryImage(v as { images: { src: string; isPrimary: boolean }[] }) ??
        `/images/placeholder-${v.slug}.svg`,
      category: v.category || undefined,
      isFeatured: v.isFeatured || undefined,
      featuredUntil: v.featuredUntil?.toISOString() ?? undefined,
    }));
  } catch {
    // DB unreachable — never show fabricated inventory.
    return [];
  }
}

export async function getFeaturedVehicles(limit = 2): Promise<VehicleCardData[]> {
  const rows = await getVehicles({ status: "available", orderBy: "featured", limit: 100 });
  // Strictly active features only (unexpired), newest first, capped at limit.
  const now = new Date();
  const sorted = rows
    .filter((v) => v.isFeatured === true && (!v.featuredUntil || new Date(v.featuredUntil) > now))
    .sort((a, b) => {
      const au = a.featuredUntil ? new Date(a.featuredUntil).getTime() : 0;
      const bu = b.featuredUntil ? new Date(b.featuredUntil).getTime() : 0;
      return bu - au;
    });
  return sorted.slice(0, limit);
}

export function getRecentVehicles(limit = 4): Promise<VehicleCardData[]> {
  return getVehicles({ status: "available", orderBy: "recent", limit });
}

export function getSoldVehicles(limit = 3): Promise<VehicleCardData[]> {
  return getVehicles({ status: "sold", orderBy: "recent", limit });
}
