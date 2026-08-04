import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const url = process.env.DATABASE_URL || "postgresql://hermes_car:***@localhost:5432/hermes_car";
const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

// Fidelis Auto — initial vehicle inventory
const vehicles = [
  {
    slug: "porsche-911e",
    title: "1971 Porsche 911E",
    year: 1971,
    make: "Porsche",
    model: "911E",
    trim: "Coupe",
    vin: "9111300987",
    mileage: 3742,
    mileageUnit: "mi",
    exteriorColor: "Albert Blue",
    interiorColor: "Beige Leatherette",
    engine: "2.2L Flat-6",
    transmission: "5-Speed Manual",
    drivetrain: "Rear-Wheel Drive",
    price: "USD 425,000",
    status: "available",
    descriptionEn:
      "Delivered new in 1971 through a German military exchange program, this 911E has covered just 3,742 miles from new. Finished in its original Albert Blue over Beige Leatherette, it remains in remarkably preserved condition.",
    isFeatured: true,
    isPublished: true,
    order: 1,
  },
  {
    slug: "mercedes-230sl",
    title: "1967 Mercedes-Benz 230SL Pagoda",
    year: 1967,
    make: "Mercedes-Benz",
    model: "230SL",
    trim: "Roadster",
    vin: "11304212000123",
    mileage: null,
    mileageUnit: "mi",
    exteriorColor: "Silver",
    interiorColor: "Black",
    engine: "2.3L Inline-6",
    transmission: "4-Speed Manual",
    drivetrain: "Rear-Wheel Drive",
    price: "USD 180,000",
    status: "available",
    descriptionEn:
      "A beautifully restored 'Pagoda' in Silver over Black. The 230SL is the most elegant of the W113 generation, and this example is presented to a concours standard with a fully documented restoration.",
    isFeatured: true,
    isPublished: true,
    order: 2,
  },
  {
    slug: "porsche-911-carrera-rs",
    title: "1973 Porsche 911 Carrera RS 2.7",
    year: 1973,
    make: "Porsche",
    model: "911 Carrera RS",
    trim: "Coupe",
    vin: "9113601234",
    mileage: null,
    mileageUnit: "mi",
    exteriorColor: "Red",
    interiorColor: "Black",
    engine: "2.7L Flat-6",
    transmission: "5-Speed Manual",
    drivetrain: "Rear-Wheel Drive",
    price: "POA",
    status: "available",
    descriptionEn:
      "An original matching-numbers Carrera RS 2.7 — the most iconic and valuable of all early 911s. Fully documented provenance from new, presented in its correct Grand Prix Red.",
    isFeatured: true,
    isPublished: true,
    order: 3,
  },
  {
    slug: "mercedes-280sl",
    title: "1969 Mercedes-Benz 280SL",
    year: 1969,
    make: "Mercedes-Benz",
    model: "280SL",
    trim: "Roadster",
    vin: "11304412000123",
    mileage: null,
    mileageUnit: "mi",
    exteriorColor: "White",
    interiorColor: "Red",
    engine: "2.8L Inline-6",
    transmission: "Automatic",
    drivetrain: "Rear-Wheel Drive",
    price: "USD 145,000",
    status: "available",
    descriptionEn:
      "A recently restored 280SL in White over Red. The final, most powerful iteration of the Pagoda with the stronger 2.8-litre engine and the convenience of automatic transmission.",
    isFeatured: true,
    isPublished: true,
    order: 4,
  },
];

async function main() {
  console.log("Seeding vehicles...");
  for (const v of vehicles) {
    await prisma.vehicle.upsert({
      where: { slug: v.slug },
      update: {
        title: v.title,
        year: v.year,
        make: v.make,
        model: v.model,
        trim: v.trim,
        vin: v.vin,
        mileage: v.mileage,
        mileageUnit: v.mileageUnit,
        exteriorColor: v.exteriorColor,
        interiorColor: v.interiorColor,
        engine: v.engine,
        transmission: v.transmission,
        drivetrain: v.drivetrain,
        price: v.price,
        status: v.status,
        descriptionEn: v.descriptionEn,
        isFeatured: v.isFeatured,
        isPublished: v.isPublished,
        order: v.order,
      },
      create: v,
    });
    console.log(`  ✓ ${v.title}`);
  }
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });