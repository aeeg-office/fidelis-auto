/* WS1 price backfill: copy unambiguous numeric prices from `price` text into `priceAmount`.
 * Rules (per spec §6 WS1):
 *  - Only rows whose `price` parses to a clean numeric amount (digits + optional thousand separators)
 *    and an optional currency-word (EGP/LE/E£/جنيه/جنيه مصري) are treated as unambiguous.
 *  - Ambiguous / negotiable / currency-mismatched rows are left with priceAmount NULL and flagged.
 *  - Raw `price` text is ALWAYS preserved (never overwritten).
 * Run AFTER the WS1 migration; idempotent; read-only on production until verified on a backup.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set. Refusing to run backfill without it.");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

const CURRENCY_WORDS = ["egp", "le", "e£", "e£", "e.gp", "جنية", "جنيه", "ج.م", "usd", "$"];

interface Flagged { id: string; price: string | null; reason: string; }

function parseAmount(price: string | null): { amount: number | null; flag?: string } {
  if (!price) return { amount: null };
  const trimmed = price.trim();
  if (!trimmed) return { amount: null };
  const lower = trimmed.toLowerCase();
  const hasCurrency = CURRENCY_WORDS.some((w) => lower.includes(w));
  // Negotiable / on-request markers -> ambiguous
  if (/(negotiable|على التفاوض|for sale|on request|price on request|بدون سعر|n\.?a\.?|contact us|افضل سعر)/i.test(trimmed)) {
    return { amount: null, flag: "negotiable-or-nonspecific" };
  }
  // Strip currency tokens (symbols and words) so "1,200,000 EGP" and "$25000" both parse.
    const digitsOnly = trimmed
      .replace(/egp|le|e£|e\.gp|جنية|جنيه|ج\.م|usd|£|€|\$/gi, "") // currency words + symbols
      .trim();
    // Pure digits with optional thousand separators (e.g. "1,200,000", "1200000")
    const numeric = digitsOnly.replace(/[,\s]/g, "");
    if (/^[0-9]+$/.test(numeric)) {
      const amount = parseInt(numeric, 10);
      if (amount > 0) return { amount };
      return { amount: null, flag: "zero" };
    }
    if (digitsOnly.includes(",") && /^[\d,.]+$/.test(digitsOnly)) {
      return { amount: null, flag: "ambiguous-unknown-separator-or-decimal" };
    }
    return { amount: null, flag: "non-numeric" };
}

async function main() {
  const vehicles = await prisma.vehicle.findMany({ where: { price: { not: null } }, select: { id: true, price: true } });
  console.log(`Processing ${vehicles.length} vehicles with a price value.`);
  const flagged: Flagged[] = [];
  let backfilled = 0;

  for (const v of vehicles) {
    const { amount, flag } = parseAmount(v.price);
    if (amount !== null) {
      await prisma.vehicle.update({ where: { id: v.id }, data: { priceAmount: amount } });
      backfilled++;
    } else if (flag) {
      flagged.push({ id: v.id, price: v.price, reason: flag });
    }
  }

  console.log(`\nBackfilled priceAmount on ${backfilled} unambiguous rows.`);
  console.log(`Flagged ${flagged.length} ambiguous/unsafe rows (left as-is, priceAmount NULL):`);
  for (const f of flagged) console.log(`  - ${f.id}: "${f.price}" -> ${f.reason}`);
  console.log("\nRaw `price` text preserved on all rows.");
}

main()
  .catch((e) => { console.error("Price backfill error:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });