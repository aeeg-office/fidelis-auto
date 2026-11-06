/* Pure, side-effect-free parser for WS1 price backfill.
 * `priceAmount` is the numeric price in the currency's SMALLEST unit (for EGP, piastres: 1 EGP = 100).
 * Rules (spec §6 WS1, "backfill only unambiguous numeric prices"):
 *  - Accept ONLY prices that parse to a clean integer amount with NO foreign-currency token.
 *  - A price is unambiguous when digits form a valid integer with EGP thousand-grouping
 *    (plain "500000", or comma-grouped "1,200,000"), optionally followed by an EGP currency word.
 *  - Ambiguous / negotiable / currency-mismatched / malformed-grouping values are left NULL and flagged.
 *  - Values exceeding PostgreSQL INTEGER max (2147483647) are flagged, never written.
 * This module has no DB/IO side effects and is unit-tested (scripts/price-parser.test.ts).
 */

export const INT_MAX = 2_147_483_647;

// Foreign-currency tokens (must never be backfilled into EGP). The pound symbol £ is treated as
// foreign ONLY when it is NOT the Egyptian-pound token "e£"/"E£"/"E £". EGP tokens are stripped
// FIRST, then the remainder is tested for any foreign-currency token.
const FOREIGN_CURRENCY = /\b(usd|euro|sar|aed|gbp|kwd|qar|rmb|cny|yen|reais)\b|\$|€|£|ريال|دينار|درهم/i;
// EGP tokens: Latin forms use a word boundary (no trailing \b — £ is a non-word char and ends the
// token cleanly before whitespace/end-of-string); Arabic forms match exact characters.
const EGP_LATIN = /^\s*e\s?£|\be\s?£|\be\.gp\b|\begp\b|\ble\b|\be£/i;
// Arabic EGP tokens must be STANDALONE (bounded by whitespace / start / end), so an embedded token
// like "100جنيه200" is NOT stripped (it stays non-numeric and is flagged) — prevents merging amounts.
const EGP_ARABIC = /(?:^|\s)(?:ج\.م|جنيه من مصري|جنيه مصري|جنيه|الجنية|جنية|مصري)(?=\s|$)/gi;
const NEGOTIABLE = /negotiable|on request|price on request|for sale|n\.?a\.?|contact us|للتفاوض|على التفاوض|بدون سعر|افضل سعر|كلمنا|اتصل/i;

export interface ParseResult {
  amount: number | null;
  flag?: string;
}

export function parseAmount(price: string | null): ParseResult {
  if (!price) return { amount: null };
  const trimmed = price.trim();
  if (!trimmed) return { amount: null };

  if (NEGOTIABLE.test(trimmed)) return { amount: null, flag: "negotiable-or-nonspecific" };

  // Strip EGP currency tokens (incl. the Egyptian pound "e£") BEFORE checking for foreign currency,
  // so a valid "1,200,000 e£" is not misread as a foreign £ price.
  const stripped = trimmed.replace(EGP_LATIN, "").replace(EGP_ARABIC, "").trim();
  if (!stripped) return { amount: null, flag: "non-numeric-or-malformed-grouping" };
  if (FOREIGN_CURRENCY.test(stripped)) return { amount: null, flag: "currency-mismatch-foreign-token" };

  const bare = stripped;

  // Valid canonical forms (validate grouping BEFORE collapsing separators):
  //   thousands: "1,200,000"  -> digits where groups of 3 (first group 1-3 digits)
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