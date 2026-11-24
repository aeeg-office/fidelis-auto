/**
 * Display price for a listing (cards + detail page).
 *
 * - Prefers the WS1 numeric `priceAmount` (smallest unit, /100) in the listing's
 *   own `currency` (EGP default) — never a hardcoded "$".
 * - Falls back to a legacy free-text price: a plain number is formatted in the
 *   listing currency; any other text (e.g. "POA", "Contact seller") is returned
 *   by the caller's own logic, so this returns null for it.
 */
export type PriceFields = {
  priceAmount?: number | null;
  currency?: string | null;
  price?: string | null;
};

/** Major-unit numeric price, or null when the listing has no real numeric price. */
export function numericPrice(v: PriceFields): number | null {
  if (typeof v.priceAmount === "number" && Number.isFinite(v.priceAmount) && v.priceAmount > 0) {
    return v.priceAmount / 100;
  }
  const raw = v.price?.trim();
  if (!raw) return null;
  // Accept "450000" or "450,000"; anything with letters is not a numeric price.
  if (!/^[\d,.\s]+$/.test(raw)) return null;
  const n = Number(raw.replace(/[,\s]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function formatPrice(v: PriceFields, locale: string): string | null {
  const n = numericPrice(v);
  if (n === null) return null;
  const currency = (v.currency || "EGP").trim().toUpperCase();
  const tag = locale === "ar" ? "ar-EG" : "en-EG";
  try {
    return new Intl.NumberFormat(tag, { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  } catch {
    // Unknown currency code — show the number with the code rather than guess a symbol.
    return `${n.toLocaleString(tag)} ${currency}`;
  }
}
