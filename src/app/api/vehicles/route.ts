import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Placeholder data for when DB is unavailable
const PLACEHOLDER_VEHICLES: Record<string, any> = {
  "porsche-911e": {
    slug: "porsche-911e", title: "1971 Porsche 911E", year: 1971, make: "Porsche", model: "911E",
    trim: "Coupe", mileage: 3742, mileageUnit: "mi", exteriorColor: "Albert Blue",
    interiorColor: "Beige Leatherette", engine: "2.2L Flat-6 (1991cc)", transmission: "5-Speed Manual",
    drivetrain: "Rear-Wheel Drive", price: null, city: "Munich", country: "Germany",
    image: "/images/placeholder-porsche-911e.svg",
  },
  "mercedes-230sl": {
    slug: "mercedes-230sl", title: "1967 Mercedes-Benz 230SL Pagoda", year: 1967, make: "Mercedes-Benz", model: "230SL",
    trim: "Pagoda", mileage: 12450, mileageUnit: "mi", exteriorColor: "Silver",
    interiorColor: "Red Leather", engine: "2.3L Inline-6", transmission: "4-Speed Manual",
    drivetrain: "Rear-Wheel Drive", price: null, city: "Dubai", country: "United Arab Emirates",
    image: "/images/placeholder-mercedes-230sl.svg",
  },
  "porsche-911-carrera-rs": {
    slug: "porsche-911-carrera-rs", title: "1973 Porsche 911 Carrera RS 2.7", year: 1973, make: "Porsche", model: "911 Carrera RS",
    trim: "2.7", mileage: 28500, mileageUnit: "mi", exteriorColor: "Grand Prix Red",
    interiorColor: "Black Leatherette", engine: "2.7L Flat-6 (210 hp)", transmission: "5-Speed Manual",
    drivetrain: "Rear-Wheel Drive", price: "POA", city: "Stuttgart", country: "Germany",
    image: "/images/placeholder-porsche-911-carrera-rs.svg",
  },
  "mercedes-280sl": {
    slug: "mercedes-280sl", title: "1969 Mercedes-Benz 280SL", year: 1969, make: "Mercedes-Benz", model: "280SL",
    trim: null, mileage: 82300, mileageUnit: "mi", exteriorColor: "White",
    interiorColor: "Blue MB-Tex", engine: "2.8L Inline-6", transmission: "Automatic",
    drivetrain: "Rear-Wheel Drive", price: "USD 145,000", city: "Cairo", country: "Egypt",
    image: "/images/placeholder-mercedes-280sl.svg",
  },
};

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
      },
    });

    const result = vehicles.map((v) => ({
      ...v,
      city: null as string | null,
      country: null as string | null,
      image: `/images/placeholder-${v.slug}.svg`,
    }));

    return NextResponse.json(result);
  } catch {
    // Return placeholder data when DB is unavailable
    const result = Object.values(PLACEHOLDER_VEHICLES).map((v) => ({
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
      city: v.city,
      country: v.country,
      image: v.image,
    }));
    return NextResponse.json(result);
  }
}