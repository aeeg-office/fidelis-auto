/* WS1 seed: Country, City, and launch Make taxonomy.
 * Concrete, real market facts only (no invented makes/models).
 * Full per-model listing (incl. motorcycle makes, EN/AR names) is WS1b from real research sources.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

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

// Launch car makes present on the Egyptian market — real, incl. Chinese brands.
const CAR_MAKES: { nameEn: string; nameAr: string; origin: string }[] = [
  { nameEn: "Chery", nameAr: "شيري", origin: "CN" },
  { nameEn: "BYD", nameAr: "بي واي دي", origin: "CN" },
  { nameEn: "Geely", nameAr: "جيلي", origin: "CN" },
  { nameEn: "Jetour", nameAr: "جيتور", origin: "CN" },
  { nameEn: "Haval", nameAr: "هافال", origin: "CN" },
  { nameEn: "Changan", nameAr: "تشانجان", origin: "CN" },
  { nameEn: "MG", nameAr: "إم جي", origin: "CN" },
  { nameEn: "Tank", nameAr: "تانك", origin: "CN" },
  { nameEn: "Sehol", nameAr: "سي هول", origin: "CN" },
  { nameEn: "Toyota", nameAr: "تويوتا", origin: "JP" },
  { nameEn: "Nissan", nameAr: "نيسان", origin: "JP" },
  { nameEn: "Honda", nameAr: "هوندا", origin: "JP" },
  { nameEn: "Mitsubishi", nameAr: "ميتسوبيشي", origin: "JP" },
  { nameEn: "Suzuki", nameAr: "سوزوكي", origin: "JP" },
  { nameEn: "Hyundai", nameAr: "هيونداي", origin: "KR" },
  { nameEn: "Kia", nameAr: "كيا", origin: "KR" },
  { nameEn: "Chevrolet", nameAr: "شيفروليه", origin: "US" },
  { nameEn: "Ford", nameAr: "فورد", origin: "US" },
  { nameEn: "Jeep", nameAr: "جيب", origin: "US" },
  { nameEn: "Opel", nameAr: "أوبل", origin: "DE" },
  { nameEn: "Volkswagen", nameAr: "فولكس فاجن", origin: "DE" },
  { nameEn: "BMW", nameAr: "بي إم دبليو", origin: "DE" },
  { nameEn: "Mercedes-Benz", nameAr: "مرسيدس", origin: "DE" },
  { nameEn: "Audi", nameAr: "أودي", origin: "DE" },
  { nameEn: "Peugeot", nameAr: "بيجو", origin: "FR" },
  { nameEn: "Citroen", nameAr: "سيتروين", origin: "FR" },
  { nameEn: "Renault", nameAr: "رينو", origin: "FR" },
  { nameEn: "Fiat", nameAr: "فيات", origin: "IT" },
  { nameEn: "Skoda", nameAr: "سكودا", origin: "CZ" },
  { nameEn: "Volvo", nameAr: "فولفو", origin: "SE" },
  { nameEn: "Lexus", nameAr: "لكزس", origin: "JP" },
  { nameEn: "Mazda", nameAr: "مازدا", origin: "JP" },
  { nameEn: "Daihatsu", nameAr: "دايهاتسو", origin: "JP" },
  { nameEn: "Lada", nameAr: "لادا", origin: "RU" },
];

// Motorcycle makes on the Egyptian market — real, EN only (validated via market; WS1b adds AR/full list).
const MOTORCYCLE_MAKES: string[] = [
  "Honda", "Yamaha", "Suzuki", "Kawasaki", "KTM", "BMW Motorrad",
  "Sym", "Zontes", "Benelli", "Vespa", "Aprilia", "CFMoto",
];

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
  for (const m of CAR_MAKES) {
    // upsert on the unique (nameEn, vehicleType) in the schema.
    const rec = await prisma.make.upsert({
      where: { nameEn_vehicleType: { nameEn: m.nameEn, vehicleType: "CAR" } },
      update: { nameAr: m.nameAr, origin: m.origin, isActive: true },
      create: { ...m, vehicleType: "CAR", isActive: true },
    });
    void rec;
    makeCount++;
  }
  for (const mn of MOTORCYCLE_MAKES) {
    const rec = await prisma.make.upsert({
      where: { nameEn_vehicleType: { nameEn: mn, vehicleType: "MOTORCYCLE" } },
      update: { isActive: true },
      create: { nameEn: mn, vehicleType: "MOTORCYCLE", isActive: true },
    });
    void rec;
    makeCount++;
  }
  console.log(`  makes: ${makeCount} new (CAR ${CAR_MAKES.length} list, MOTORCYCLE ${MOTORCYCLE_MAKES.length} list)`);

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