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
      price: v.price,
      city: null,
      country: null,
      createdAt: v.createdAt.getTime(),
      image:
        primaryImage(v as { images: { src: string; isPrimary: boolean }[] }) ??
        `/images/placeholder-${v.slug}.svg`,
      category: v.category || undefined,
      isFeatured: v.isFeatured || undefined,
    }));
  } catch {
    // DB unreachable — never show fabricated inventory.
    return [];
  }
}

export function getFeaturedVehicles(limit = 2): Promise<VehicleCardData[]> {
  return getVehicles({ status: "available", orderBy: "featured", limit });
}

export function getRecentVehicles(limit = 4): Promise<VehicleCardData[]> {
  return getVehicles({ status: "available", orderBy: "recent", limit });
}

export function getSoldVehicles(limit = 3): Promise<VehicleCardData[]> {
  return getVehicles({ status: "sold", orderBy: "recent", limit });
}
