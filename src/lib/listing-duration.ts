/* WS3: listing duration rules (spec §Listings — "Listing stays live at least 30 days; seller can
 * choose longer"). Pure helpers so the policy is unit-testable and consistent across submit/edit,
 * and both the API and UI derive the same minimum expiry.
 */

export const MIN_LISTING_DAYS = 30;

/**
 * Earliest allowed expiry for a new listing published now: this installs the 30-day floor.
 * When a listing is published/approved, its `expiresAt` is at least this far out.
 */
export function minListingExpiry(from: Date = new Date()): Date {
  return new Date(from.getTime() + MIN_LISTING_DAYS * 24 * 60 * 60 * 1000);
}

/**
 * Compute a listing's expiry from the seller-chosen duration (days). If they choose shorter than
 * the 30-day floor, the floor is enforced (never shorten below minimum). Returns a Date.
 */
export function expiresFromSellerDays(days: number, from: Date = new Date()): Date {
  const safe = Number.isFinite(days) && days > 0 ? Math.floor(days) : MIN_LISTING_DAYS;
  const chosen = new Date(from.getTime() + safe * 24 * 60 * 60 * 1000);
  const floor = minListingExpiry(from);
  return chosen > floor ? chosen : floor;
}

/** True if the listing would have at least the 30-day floor of remaining live time. */
export function hasMinimumDuration(expiresAt: Date | null, from: Date = new Date()): boolean {
  if (!expiresAt) return true; // no expiry -> interpret as unlimited (older rows / admin choice)
  return expiresAt.getTime() - from.getTime() >= MIN_LISTING_DAYS * 24 * 60 * 60 * 1000;
}