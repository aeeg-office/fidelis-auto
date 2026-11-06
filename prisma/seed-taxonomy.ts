/* WS1/WS1b seed: Country, City, Make, and Model taxonomy (full Egyptian-market).
 * Concrete, research-sourced market facts only (no invented makes/models) — see ./taxonomy-data.
 * Idempotent via upsert on the schema's unique keys.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { CAR_TAXONOMY, MOTORCYCLE_TAXONOMY } from "./taxonomy-data";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set. Refusing to seed without it.");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

// Countries as data (Egypt live; SA/UAE early-access, unmarketed).
const COUNTRIES: {
  code: string; nameEn: string; nameAr: string; currency: string; phonePrefix: string;
  isLive: boolean; isEarlyAccess: boolean;
}[] = [
  { code: "EG", nameEn: "Egypt", nameAr: "مصر", currency: "EGP", phonePrefix: "+20", isLive: true, isEarlyAccess: false },
  { code: "SA", nameEn: "Saudi Arabia", nameAr: "السعودية", currency: "SAR", phonePrefix: "+966", isLive: false, isEarlyAccess: true },
  { code: "AE", nameEn: "United Arab Emirates", nameAr: "الإمارات", currency: "AED", phonePrefix: "+971", isLive: false, isEarlyAccess: true },
];

// Egypt governorates as cities (ISO-ish; names in EN/AR).
const EG_CITIES: { nameEn: string; nameAr: string }[] = [
  { nameEn: "Cairo", nameAr: "القاهرة" },
  { nameEn: "Giza", nameAr: "الجيزة" },
  { nameEn: "Alexandria", nameAr: "الإسكندرية" },
  { nameEn: "Sharm El Sheikh", nameAr: "شرم الشيخ" },
  { nameEn: "Hurghada", nameAr: "الغردقة" },
  { nameEn: "Luxor", nameAr: "الأقصر" },
  { nameEn: "Aswan", nameAr: "أسوان" },
  { nameEn: "Mansoura", nameAr: "المنصورة" },
  { nameEn: "Tanta", nameAr: "طنطا" },
  { nameEn: "Port Said", nameAr: "بورسعيد" },
  { nameEn: "Ismailia", nameAr: "الإسماعيلية" },
  { nameEn: "Suez", nameAr: "السويس" },
  { nameEn: "Zagazig", nameAr: "الزقازيق" },
  { nameEn: "Assiut", nameAr: "أسيوط" },
  { nameEn: "Qena", nameAr: "قنا" },
  { nameEn: "Sohag", nameAr: "سوهاج" },
  { nameEn: "Minya", nameAr: "المنيا" },
  { nameEn: "Damanhur", nameAr: "دمنهور" },
  { nameEn: "Kafr El Sheikh", nameAr: "كفر الشيخ" },
  { nameEn: "El Mahalla", nameAr: "المحلة الكبرى" },
  { nameEn: "10th of Ramadan", nameAr: "مدينة العاشر من رمضان" },
  { nameEn: "6th of October", nameAr: "مدينة السادس من أكتوبر" },
];

// Makes + models live in ./taxonomy-data (CAR_TAXONOMY, MOTORCYCLE_TAXONOMY) — research-sourced.

async function main() {
  console.log("Seeding countries, cities, and launch make taxonomy...");

  const countryIds: Record<string, string> = {};
  for (const c of COUNTRIES) {
    const rec = await prisma.country.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    });
    countryIds[c.code] = rec.id;
    console.log(`  country ${c.code} ${c.nameEn} (${c.isLive ? "live" : "early-access"})`);
  }

  const eg = await prisma.country.findUnique({ where: { code: "EG" } });
  if (eg) {
    for (const city of EG_CITIES) {
      const existing = await prisma.city.findFirst({
        where: { countryId: eg.id, nameEn: city.nameEn },
      });
      if (!existing) {
        await prisma.city.create({ data: { ...city, countryId: eg.id } });
      }
    }
    console.log(`  cities: ${EG_CITIES.length} Egyptian governorates`);
  }

  let makeCount = 0;
  let modelCount = 0;

  const seedMake = async (
    m: { nameEn: string; nameAr: string; origin?: string; models: { en: string; ar: string }[] },
    vehicleType: "CAR" | "MOTORCYCLE",
  ) => {
    const make = await prisma.make.upsert({
      where: { nameEn_vehicleType: { nameEn: m.nameEn, vehicleType } },
      update: { nameAr: m.nameAr, origin: m.origin ?? null, isActive: true },
      create: {
        nameEn: m.nameEn, nameAr: m.nameAr, origin: m.origin ?? null,
        vehicleType, isActive: true,
      },
    });
    makeCount++;
    for (const model of m.models) {
      await prisma.model.upsert({
        where: { makeId_nameEn: { makeId: make.id, nameEn: model.en } },
        update: { nameAr: model.ar, isActive: true },
        create: {
          makeId: make.id, nameEn: model.en, nameAr: model.ar, vehicleType, isActive: true,
        },
      });
      modelCount++;
    }
  };

  for (const m of CAR_TAXONOMY) await seedMake(m, "CAR");
  for (const m of MOTORCYCLE_TAXONOMY) await seedMake(m, "MOTORCYCLE");

  console.log(
    `  makes: ${makeCount} (CAR ${CAR_TAXONOMY.length}, MOTORCYCLE ${MOTORCYCLE_TAXONOMY.length}) · models: ${modelCount}`,
  );

  // Homepage/site defaults (non-technical admin toggles start as empty settings here).
  await prisma.siteSetting.upsert({
    where: { key: "free_during_launch" },
    update: { value: "true" },
    create: { key: "free_during_launch", value: "true", description: "Show 'Free during launch' badges (L+), admin toggle" },
  });

  console.log("Taxonomy seed complete.");
}

main()
  .catch((e) => { console.error("Taxonomy seed error:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });