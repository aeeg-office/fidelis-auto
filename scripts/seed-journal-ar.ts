/**
 * Idempotent Arabic metadata seeder for JournalEntry.
 * Reads data/journal-ar.json [{slug,titleAr,excerptAr,metaDescriptionAr}]
 * and upserts by slug (only sets non-null values). Dry-run default; --apply.
 * Usage: node --env-file=.env --import tsx scripts/seed-journal-ar.ts [--apply]
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { readFile } from "fs/promises";
import path from "path";

const APPLY = process.argv.includes("--apply");
const DATA_FILE = process.env.AR_JSON || path.join(process.cwd(), "data", "journal-ar.json");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

type Row = { slug: string; titleAr?: string; excerptAr?: string; metaDescriptionAr?: string };

async function main() {
  const raw = await readFile(DATA_FILE, "utf8");
  const rows = JSON.parse(raw) as Row[];
  console.log(`Journal AR seed (${APPLY ? "APPLY" : "DRY-RUN"}): ${rows.length} rows`);
  let updated = 0, missing = 0;
  for (const r of rows) {
    const entry = await prisma.journalEntry.findUnique({ where: { slug: r.slug }, select: { id: true } });
    if (!entry) {
      missing++;
      console.log(`  MISSING slug ${r.slug}`);
      continue;
    }
    const data: Record<string, string> = {};
    if (r.titleAr) data.titleAr = r.titleAr;
    if (r.excerptAr) data.excerptAr = r.excerptAr;
    if (r.metaDescriptionAr) data.metaDescriptionAr = r.metaDescriptionAr;
    if (Object.keys(data).length === 0) continue;
    if (!APPLY) {
      console.log(`  would-update ${r.slug}`);
      continue;
    }
    await prisma.journalEntry.update({ where: { id: entry.id }, data });
    updated++;
  }
  console.log(`Done: updated=${updated} missing=${missing} (${APPLY ? "applied" : "dry-run — rerun with --apply"})`);
  await prisma.$disconnect();
}

void main();
