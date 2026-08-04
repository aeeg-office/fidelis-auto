import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding vehicle categories...");

  const vehicles = await prisma.vehicle.findMany();

  if (vehicles.length === 0) {
    console.log("No vehicles found to seed.");
    return;
  }

  const categoryMap: Record<string, string> = {
    // Classic cars (1970s-1990s)
    "911E": "Classic",
    "230SL": "Vintage",
    "280SL": "Vintage",
    "911 Carrera RS": "Vintage",
    "300SL": "Vintage",
    "250 GTO": "Vintage",
    // Modern cars
    "911 GT3": "Modern",
    "911 Turbo": "Modern",
    "720S": "Modern",
    "SF90": "Modern",
    "Urus": "Modern",
    "Cayenne": "Modern",
    "Model S": "EV",
    "Model 3": "EV",
    "Model X": "EV",
    "Model Y": "EV",
    "Taycan": "EV",
    "E-Tron": "EV",
    "i4": "EV",
    "iX": "EV",
  };

  let updated = 0;
  for (const v of vehicles) {
    let category: string;

    // Auto-assign based on model if we have a mapping
    if (categoryMap[v.model]) {
      category = categoryMap[v.model];
    } else if (v.year >= 2020) {
      category = "Modern";
    } else if (v.year >= 2000) {
      category = "Modern";
    } else if (v.year >= 1970) {
      category = "Classic";
    } else {
      category = "Vintage";
    }

    await prisma.vehicle.update({
      where: { id: v.id },
      data: { category },
    });
    console.log(`  ${v.year} ${v.make} ${v.model} → ${category}`);
    updated++;
  }

  console.log(`\nDone! Updated ${updated} vehicles with categories.`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });