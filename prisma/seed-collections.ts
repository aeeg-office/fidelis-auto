import { PrismaClient } from "@prisma/client";

/**
 * WS12 — seed the five canonical curated collections.
 *
 * Additive + idempotent: upserts by slug, never deletes, never touches
 * vehicles or other tables. Run with: npx tsx prisma/seed-collections.ts
 * (or `npm run db:seed-collections`).
 */
const prisma = new PrismaClient();

const COLLECTIONS = [
  {
    slug: "classics",
    titleEn: "Classics",
    titleAr: "كلاسيكيات",
    descriptionEn:
      "Timeless automobiles from the 1970s to the 1990s — icons that defined their era and still turn heads today.",
    descriptionAr: "سيارات خالدة من السبعينيات حتى التسعينيات — أيقونات صنعت عصرها وما زالت تلفت الأنظار حتى اليوم.",
    sortOrder: 10,
  },
  {
    slug: "first-cars",
    titleEn: "First Cars",
    titleAr: "أول سيارة",
    descriptionEn:
      "Practical, honest, easy-to-love everyday cars — the perfect starting point for a new driver's journey.",
    descriptionAr: "سيارات يومية عملية وصادقة وسهلة المحبة — نقطة البداية المثالية لرحلة أي سائق جديد.",
    sortOrder: 20,
  },
  {
    slug: "family-suvs",
    titleEn: "Family SUVs",
    titleAr: "سيارات العائلة",
    descriptionEn:
      "Room for everyone and everything: spacious SUVs verified for safety, comfort, and real-world family life.",
    descriptionAr: "مساحة للجميع وكل شيء: سيارات دفع رباعي فسيحة متحقق منها للأمان والراحة والحياة العائلية.",
    sortOrder: 30,
  },
  {
    slug: "electric",
    titleEn: "Electric",
    titleAr: "كهربائية",
    descriptionEn:
      "The electric future, documented today — modern EVs and hybrids with verified batteries and honest range.",
    descriptionAr: "المستقبل الكهربائي موثق اليوم — سيارات كهربائية وهجينة حديثة ببطاريات متحقق منها ومدى صادق.",
    sortOrder: 40,
  },
  {
    slug: "motorcycles",
    titleEn: "Motorcycles",
    titleAr: "دراجات نارية",
    descriptionEn:
      "Two wheels, one story — from daily commuters to weekend tourers, verified and ready to ride.",
    descriptionAr: "عجلتان وقصة واحدة — من دراجات الاستخدام اليومي إلى دراجات الرحلات، متحقق منها وجاهزة للانطلاق.",
    sortOrder: 50,
  },
];

async function main() {
  for (const c of COLLECTIONS) {
    const { slug, ...data } = c;
    await prisma.collection.upsert({
      where: { slug },
      update: data,
      create: c,
    });
    console.log(`✓ collection "${c.slug}" (${c.titleEn})`);
  }
  console.log(`\nDone. ${COLLECTIONS.length} canonical collections seeded.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
