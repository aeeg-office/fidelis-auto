import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import type { JournalArticle } from "./journal-editorial/types";
import { articles as buying } from "./journal-editorial/articles-buying";
import { articles as ownership } from "./journal-editorial/articles-ownership";
import { articles as classics } from "./journal-editorial/articles-classics";
import { articles as trends } from "./journal-editorial/articles-trends";

// Fidelis Auto Journal — Editorial expansion (20 new bilingual articles).
//
// Truthfulness model (mission §4):
//  - publishedAt  = the REAL time this seed runs (true publish timestamp).
//  - editorialDate = the editorial ARCHIVE date (one of the 4 weekly groups),
//                    used only for archive display/ordering. Schema.org/OG/sitemap
//                    expose the true publishedAt, NOT editorialDate.
//
// This script also guarantees the "short Sources list" editorial requirement
// by appending an inline Sources/المصادر block to any article body that lacks
// one, using the fact-checked sources[] array (or the article's own inline tail).

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is not set. Refusing to seed without a database connection string.");
}
const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

const now = new Date(); // true publish timestamp for all 20 articles

function ensureEnSources(content: string, srcList: string[]): string {
  if (/^\s*Sources\s*$/m.test(content) || /\bSource(?:s?)\s*:/.test(content)) return content;
  if (!srcList.length) return content;
  const src = srcList.filter(Boolean).join("\n- ");
  return `${content.replace(/\s+$/, "")}\n\nSources:\n- ${src}`;
}

function ensureArSources(content: string, srcList: string[]): string {
  if (content.includes("المصادر")) return content;
  if (!srcList.length) return content;
  // Keep the message-like Arabic labels from the module when present.
  const src = srcList.filter(Boolean).join("\n- ");
  return `${content.replace(/\s+$/, "")}\n\nالمصادر:\n- ${src}`;
}

async function main() {
  const all: JournalArticle[] = [
    ...buying,
    ...ownership,
    ...classics,
    ...trends,
  ];
  if (all.length !== 20) {
    throw new Error(`Expected 20 editorial articles, got ${all.length}`);
  }
  const slugs = new Set(all.map((a) => a.slug));
  if (slugs.size !== 20) throw new Error("Duplicate slugs in editorial set");

  console.log(`Seeding ${all.length} editorial journal articles (archive 11 Oct – 5 Nov 2026)…`);

  for (const a of all) {
    const contentEn = ensureEnSources(a.contentEn, a.sources);
    const contentAr = ensureArSources(a.contentAr, a.sources);
    await prisma.journalEntry.upsert({
      where: { slug: a.slug },
      update: {
        title: a.titleEn,
        author: "Fidelis Auto Editorial",
        contentEn,
        contentAr,
        excerpt: a.excerptEn,
        category: a.category,
        editorialDate: new Date(`${a.editorialDate}T09:00:00.000Z`),
        isPublished: true,
        publishedAt: now, // TRUE publish time — never editorialDate
      },
      create: {
        slug: a.slug,
        title: a.titleEn,
        author: "Fidelis Auto Editorial",
        contentEn,
        contentAr,
        excerpt: a.excerptEn,
        category: a.category,
        editorialDate: new Date(`${a.editorialDate}T09:00:00.000Z`),
        isPublished: true,
        publishedAt: now,
      },
    });
    console.log(`  ✓ ${a.slug} (${a.category}, archive ${a.editorialDate})`);
  }
  console.log("Done.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });