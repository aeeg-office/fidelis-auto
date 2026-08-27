import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      select: {
        slug: true,
        title: true,
        year: true,
        make: true,
        model: true,
        trim: true,
        mileage: true,
        mileageUnit: true,
        exteriorColor: true,
        interiorColor: true,
        engine: true,
        transmission: true,
        drivetrain: true,
        price: true,
        images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
      },
    });

    const result = vehicles.map((v) => {
      const primary =
        v.images.find((i) => i.isPrimary) ?? v.images[0];
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
        interiorColor: v.interiorColor,
        engine: v.engine,
        transmission: v.transmission,
        drivetrain: v.drivetrain,
        price: v.price,
        city: null as string | null,
        country: null as string | null,
        image:
          (primary?.src ?? null) ?? `/images/placeholder-${v.slug}.svg`,
      };
    });

    return NextResponse.json(result);
  } catch {
    // DB unreachable — return empty, never fabricated inventory (FID-010).
    return NextResponse.json([]);
  }
}