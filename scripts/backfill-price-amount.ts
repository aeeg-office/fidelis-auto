/* WS1 price backfill: copy unambiguous numeric EGP prices from `price` text into `priceAmount`.
 * `priceAmount` is the numeric price in the currency's SMALLEST unit (for EGP, piastres: 1 EGP = 100).
 * Rules (spec §6 WS1, "backfill only unambiguous numeric prices"):
 *  - Accept ONLY prices that parse to a clean integer amount with NO foreign-currency token.
 *  - A price is unambiguous when digits form a valid integer with EGP thousand-grouping
 *    (plain "500000", or comma-grouped "1,200,000"), optionally followed by an EGP currency word.
 *  - Ambiguous / negotiable / currency-mismatched / malformed-grouping values are left NULL and flagged.
 *  - Values exceeding PostgreSQL INTEGER max (2147483647) are flagged, never written.
 *  - Raw `price` text is ALWAYS preserved (never overwritten).
 * Idempotent. Run AFTER the WS1 migration; read-only on production until a backup is verified.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set. Refusing to run backfill without it.");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

const INT_MAX = 2_147_483_647;

// Foreign-currency tokens (must never be backfilled into EGP). Symbols deliberately NOT word-bounded.
const FOREIGN_CURRENCY = /\b(usd|euro|sar|aed|gbp|kwd|qar|rmb|cny|yen|reais)\b|\$|€|£|ريال|دينار|درهم|سيار/i;
// EGP tokens: Latin forms use a word boundary; Arabic forms are matched by exact characters
// (no \b, which is ASCII-only in JavaScript and would fail around Arabic/glyph punctuation).
const EGP_LATIN = /\b(egp|le|e£|e\.gp|e£)\b/i;
const EGP_ARABIC = /ج\.م|الجنية|جنية|جنيه من مصري|جنيه|مصري/;
const NEGOTIABLE = /negotiable|on request|price on request|for sale|n\.?a\.?|contact us|للتفاوض|على التفاوض|بدون سعر|افضل سعر|كلمنا|اتصل/i;

interface Flagged { id: string; price: string | null; reason: string; }

function parseAmount(price: string | null): { amount: number | null; flag?: string } {
  if (!price) return { amount: null };
  const trimmed = price.trim();
  if (!trimmed) return { amount: null };

  if (FOREIGN_CURRENCY.test(trimmed)) return { amount: null, flag: "currency-mismatch-foreign-token" };
  if (NEGOTIABLE.test(trimmed)) return { amount: null, flag: "negotiable-or-nonspecific" };

  // Strip EGP currency tokens but KEEP commas/spaces so grouping can be validated.
  const bare = trimmed.replace(EGP_LATIN, "").replace(EGP_ARABIC, "").trim();

  // Valid canonical forms (validate grouping BEFORE collapsing separators):
  //   thousands: "1,200,000"  -> digits where the LAST group is 3 and all prior groups are 3
  //   plain:     "500000"     -> pure digits (no separator)
  const commaGrouped = /^\d{1,3}(,\d{3})+$/.test(bare);
  const plainDigits = /^\d+$/.test(bare);
  // Space-separated digits that are not valid 3-digit thousands groups -> ambiguous ("1 2 3").
  if (/^\d{1,3}( \d{3})+$/.test(bare)) return { amount: null, flag: "ambiguous-space-grouping" };

  let amount: number | null = null;
  if (commaGrouped || plainDigits) {
    amount = parseInt(bare.replace(/,/g, ""), 10);
  }
  if (amount === null) {
    if (/\d,\d{1,2}\b/.test(bare) || /^\d{1,3}\.\d/.test(bare)) return { amount: null, flag: "ambiguous-decimal-or-range" };
    return { amount: null, flag: "non-numeric-or-malformed-grouping" };
  }
  if (amount <= 0) return { amount: null, flag: "zero" };

  // priceAmount is in smallest unit (piastres for EGP). Guard INT overflow.
  const smallestUnits = amount * 100;
  if (!Number.isSafeInteger(smallestUnits) || smallestUnits > INT_MAX) {
    return { amount: null, flag: "exceeds-int-max" };
  }
  return { amount: smallestUnits };
}

async function main() {
  const vehicles = await prisma.vehicle.findMany({
    where: { price: { not: null } },
    select: { id: true, price: true, currency: true },
  });
  console.log(`Processing ${vehicles.length} vehicles with a price value.`);
  const flagged: Flagged[] = [];
  let backfilled = 0;

  for (const v of vehicles) {
    if (v.currency && v.currency !== "EGP") {
      flagged.push({ id: v.id, price: v.price, reason: `non-EGP currency (${v.currency})` });
      continue;
    }
    const { amount, flag } = parseAmount(v.price);
    if (amount !== null) {
      await prisma.vehicle.update({ where: { id: v.id }, data: { priceAmount: amount } });
      backfilled++;
    } else if (flag) {
      flagged.push({ id: v.id, price: v.price, reason: flag });
    }
  }

  console.log(`\nBackfilled priceAmount (smallest units / piastres) on ${backfilled} unambiguous rows.`);
  console.log(`Flagged ${flagged.length} ambiguous/unsafe rows (left as-is, priceAmount NULL):`);
  for (const f of flagged) console.log(`  - ${f.id}: "${f.price}" -> ${f.reason}`);
  console.log("\nRaw `price` text preserved on all rows.");
}

main()
  .catch((e) => { console.error("Price backfill error:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });