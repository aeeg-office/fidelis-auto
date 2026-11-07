// WS14 (spec P2 trust): review input validation + verified-user gate.
// Pure functions so they are unit-testable without a DB or HTTP.

export const REVIEW_RATING_MIN = 1;
export const REVIEW_RATING_MAX = 5;
export const REVIEW_TEXT_MIN = 10;
export const REVIEW_TEXT_MAX = 2000;
export const REVIEW_PROVIDER_CONTEXT_MAX = 1000;

export interface ReviewInput {
  rating: number;
  text: string;
  providerContext?: string;
}

export type ReviewInputResult =
  | { ok: true; data: ReviewInput }
  | { ok: false; error: string };

/** Validate the raw POST body of a review. Unknown or malformed fields are rejected. */
export function parseReviewInput(body: unknown): ReviewInputResult {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, error: "Invalid review payload." };
  }
  const b = body as Record<string, unknown>;

  const rating = b.rating;
  if (typeof rating !== "number" || !Number.isInteger(rating)) {
    return { ok: false, error: `rating must be an integer between ${REVIEW_RATING_MIN} and ${REVIEW_RATING_MAX}.` };
  }
  if (rating < REVIEW_RATING_MIN || rating > REVIEW_RATING_MAX) {
    return { ok: false, error: `rating must be between ${REVIEW_RATING_MIN} and ${REVIEW_RATING_MAX}.` };
  }

  const text = b.text;
  if (typeof text !== "string" || text.trim().length < REVIEW_TEXT_MIN) {
    return { ok: false, error: `review text must be at least ${REVIEW_TEXT_MIN} characters.` };
  }
  if (text.length > REVIEW_TEXT_MAX) {
    return { ok: false, error: `review text must be at most ${REVIEW_TEXT_MAX} characters.` };
  }

  let providerContext: string | undefined;
  if (b.providerContext !== undefined && b.providerContext !== null) {
    if (typeof b.providerContext !== "string") {
      return { ok: false, error: "providerContext must be a string." };
    }
    if (b.providerContext.length > REVIEW_PROVIDER_CONTEXT_MAX) {
      return { ok: false, error: `providerContext must be at most ${REVIEW_PROVIDER_CONTEXT_MAX} characters.` };
    }
    providerContext = b.providerContext.trim() === "" ? undefined : b.providerContext.trim();
  }

  return {
    ok: true,
    data: { rating, text: text.trim(), ...(providerContext ? { providerContext } : {}) },
  };
}

export interface VerifiedUserLike {
  verified: boolean;
  phoneVerified: boolean;
}

/**
 * Spec P2: "Reviews by verified users only" — a user is trusted when either their
 * email is verified (`verified`) or their phone is verified (`phoneVerified`).
 */
export function isVerifiedUser(user: VerifiedUserLike | null | undefined): boolean {
  return Boolean(user && (user.verified || user.phoneVerified));
}
