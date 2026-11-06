/* WS1 price backfill runner: copies unambiguous numeric EGP prices from `price` text into
 * `priceAmount` (smallest units / piastres). Rules live in scripts/price-parser.ts (unit-tested).
 *  - Backfills ONLY unambiguous EGP prices; ambiguous/negotiable/foreign/malformed/overflow -> flagged, NULL.
 *  - Raw `price` text is ALWAYS preserved (never overwritten).
 *  - Idempotent. Run AFTER the WS1 migration; default is DRY-RUN on any non-empty DB.
 * Safety: pass --apply to actually write to the database. Without it, nothing is written.
 * Usage:
 *   npm run db:backfill-price            # dry-run (recommended first)
 *   npm run db:backfill-price -- --apply # write
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { parseAmount } from "./price-parser";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set. Refusing to run backfill without it.");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

interface Flagged { id: string; price: string | null; reason: string; }

const APPLY = process.argv.includes("--apply");

async function main() {
  const vehicles = await prisma.vehicle.findMany({
    where: { price: { not: null } },
    select: { id: true, price: true, currency: true },
  });
  console.log(`Processing ${vehicles.length} vehicles with a price value. (${APPLY ? "APPLY mode" : "DRY-RUN"})`);
  const flagged: Flagged[] = [];
  let backfilled = 0;

  for (const v of vehicles) {
    if (v.currency && v.currency !== "EGP") {
      flagged.push({ id: v.id, price: v.price, reason: `non-EGP currency (${v.currency})` });
      continue;
    }
    const { amount, flag } = parseAmount(v.price);
    if (amount !== null) {
      if (APPLY) {
        await prisma.vehicle.update({ where: { id: v.id }, data: { priceAmount: amount } });
      }
      backfilled++;
    } else if (flag) {
      flagged.push({ id: v.id, price: v.price, reason: flag });
    }
  }

  console.log(`\n${APPLY ? "Backfilled" : "Would backfill (dry-run)"} priceAmount (smallest units / piastres) on ${backfilled} unambiguous rows.`);
  console.log(`Flagged ${flagged.length} ambiguous/unsafe rows (kept NULL):`);
  for (const f of flagged) console.log(`  - ${f.id}: "${f.price}" -> ${f.reason}`);
  console.log("\nRaw `price` text is preserved on all rows (backfill never overwrites it).");
  if (!APPLY) console.log("\nDRY-RUN: no changes written. Re-run with --apply to write.");
}

main()
  .catch((e) => { console.error("Price backfill error:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });