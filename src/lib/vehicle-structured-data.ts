/**
 * schema.org helpers for the vehicle detail page (audit C-11).
 *
 * Truthfulness rules: an Offer is emitted only when the listing has a real
 * numeric price; nothing is guessed. Currency comes from the listing's own
 * `currency` field (EGP by default since WS1) — never hardcoded.
 */

export type OfferInput = {
  /** WS1 numeric price in the smallest unit (priceAmount / 100 = major units). */
  priceAmount: number | null | undefined;
  currency: string | null | undefined;
  /** Legacy free-text price; used only when it is a plain positive number. */
  price: string | null | undefined;
  /** "available" | "sold" | "pending" */
  status: string | null | undefined;
  url: string;
};

export type SchemaOffer = {
  "@type": "Offer";
  price: number;
  priceCurrency: string;
  url: string;
  availability: string;
};

function legacyNumericPrice(price: string | null | undefined): number | null {
  if (!price) return null;
  const n = Number(price.trim());
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function buildVehicleOffer(v: OfferInput): SchemaOffer | null {
  let price: number | null = null;
  if (typeof v.priceAmount === "number" && Number.isFinite(v.priceAmount) && v.priceAmount > 0) {
    price = v.priceAmount / 100;
  } else {
    price = legacyNumericPrice(v.price);
  }
  if (price === null) return null;

  const currency = (v.currency || "EGP").trim().toUpperCase();
  const status = (v.status || "available").toLowerCase();
  const availability =
    status === "sold"
      ? "https://schema.org/SoldOut"
      : status === "pending"
        ? "https://schema.org/LimitedAvailability"
        : "https://schema.org/InStock";

  return { "@type": "Offer", price, priceCurrency: currency, url: v.url, availability };
}

/** schema.org QuantitativeValue for the odometer, with the UN/CEFACT unit code. */
export function buildMileage(mileage: number | null | undefined, unit: string | null | undefined) {
  if (typeof mileage !== "number" || !Number.isFinite(mileage) || mileage < 0) return undefined;
  const isMiles = (unit || "km").toLowerCase().startsWith("mi");
  return { "@type": "QuantitativeValue", value: mileage, unitCode: isMiles ? "SMI" : "KMT" };
}
