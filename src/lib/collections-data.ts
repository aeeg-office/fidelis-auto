import { prisma } from "@/lib/prisma";
import type { VehicleCardData } from "@/components/VehicleCard";

/**
 * WS12: shared data loaders for the public curated-collections pages.
 * Only visible collections and their published vehicles are ever exposed.
 */

export interface PublicCollectionSummary {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string | null;
  descriptionEn: string | null;
  descriptionAr: string | null;
  coverImage: string | null;
  coverSrc: string | null;
  vehicleCount: number;
}

function primaryImage(vehicle: { images: { src: string; isPrimary: boolean }[] }): string | null {
  if (!vehicle.images || vehicle.images.length === 0) return null;
  const primary = vehicle.images.find((i) => i.isPrimary) ?? vehicle.images[0];
  return primary ? primary.src : null;
}

/** Visible collections ordered by sortOrder, each with its published-vehicle count and a cover source. */
export async function getVisibleCollections(): Promise<PublicCollectionSummary[]> {
  try {
    const rows = await prisma.collection.findMany({
      where: { isVisible: true },
      include: {
        vehicles: {
          where: { vehicle: { isPublished: true } },
          select: { vehicle: { select: { id: true, images: { select: { src: true, isPrimary: true } } } } },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    return rows.map((c) => {
      const vehicles = c.vehicles.map((cv) => cv.vehicle);
      const firstImage = vehicles
        .map((v) => primaryImage(v as { images: { src: string; isPrimary: boolean }[] }))
        .find(Boolean);
      return {
        id: c.id,
        slug: c.slug,
        titleEn: c.titleEn,
        titleAr: c.titleAr,
        descriptionEn: c.descriptionEn,
        descriptionAr: c.descriptionAr,
        coverImage: c.coverImage,
        coverSrc: c.coverImage ?? firstImage ?? null,
        vehicleCount: vehicles.length,
      };
    });
  } catch {
    // DB unreachable — never fabricate collections.
    return [];
  }
}

/** A public collection (visible) with its published vehicles mapped to VehicleCardData. */
export async function getPublicCollection(slug: string): Promise<{
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string | null;
  descriptionEn: string | null;
  descriptionAr: string | null;
  coverImage: string | null;
  vehicles: VehicleCardData[];
} | null> {
  try {
    const row = await prisma.collection.findUnique({
      where: { slug },
      include: {
        vehicles: {
          where: { vehicle: { isPublished: true } },
          include: { vehicle: { include: { images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] } } } },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
    if (!row || !row.isVisible) return null;

    return {
      id: row.id,
      slug: row.slug,
      titleEn: row.titleEn,
      titleAr: row.titleAr,
      descriptionEn: row.descriptionEn,
      descriptionAr: row.descriptionAr,
      coverImage: row.coverImage,
      vehicles: row.vehicles.map((cv) => {
        const v = cv.vehicle;
        return {
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
          category: v.category || undefined,
          isFeatured: v.isFeatured || undefined,
          featuredUntil: v.featuredUntil?.toISOString() ?? undefined,
          createdAt: v.createdAt.getTime(),
          image: primaryImage(v as { images: { src: string; isPrimary: boolean }[] }) ?? `/images/placeholder-${v.slug}.svg`,
        };
      }),
    };
  } catch {
    return null;
  }
}