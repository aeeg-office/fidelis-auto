import { describe, expect, it } from "vitest";
import {
  REVIEW_RATING_MAX,
  REVIEW_RATING_MIN,
  REVIEW_TEXT_MAX,
  REVIEW_TEXT_MIN,
  isVerifiedUser,
  parseReviewInput,
} from "./review-validation";

describe("parseReviewInput", () => {
  it("rejects non-object bodies", () => {
    expect(parseReviewInput(null).ok).toBe(false);
    expect(parseReviewInput("x").ok).toBe(false);
    expect(parseReviewInput([]).ok).toBe(false);
    expect(parseReviewInput(undefined).ok).toBe(false);
  });

  it("rejects missing / non-integer / out-of-range ratings", () => {
    expect(parseReviewInput({ rating: "5", text: "a".repeat(20) }).ok).toBe(false);
    expect(parseReviewInput({ rating: 4.5, text: "a".repeat(20) }).ok).toBe(false);
    expect(parseReviewInput({ rating: 0, text: "a".repeat(20) }).ok).toBe(false);
    expect(parseReviewInput({ rating: 6, text: "a".repeat(20) }).ok).toBe(false);
  });

  it("accepts integer ratings at both bounds", () => {
    for (const rating of [REVIEW_RATING_MIN, 3, REVIEW_RATING_MAX]) {
      const res = parseReviewInput({ rating, text: "a".repeat(20) });
      expect(res.ok).toBe(true);
      if (res.ok) expect(res.data.rating).toBe(rating);
    }
  });

  it("enforces text length bounds", () => {
    expect(parseReviewInput({ rating: 5, text: "short" }).ok).toBe(false);
    expect(parseReviewInput({ rating: 5, text: " ".repeat(REVIEW_TEXT_MIN) }).ok).toBe(false); // whitespace-only
    expect(parseReviewInput({ rating: 5, text: "a".repeat(REVIEW_TEXT_MIN) }).ok).toBe(true);
    expect(parseReviewInput({ rating: 5, text: "a".repeat(REVIEW_TEXT_MAX + 1) }).ok).toBe(false);
  });

  it("normalizes providerContext (undefined for empty, errors when too long)", () => {
    const withCtx = parseReviewInput({ rating: 5, text: "a".repeat(20), providerContext: " buyer is serious " });
    expect(withCtx).toEqual({ ok: true, data: { rating: 5, text: "a".repeat(20), providerContext: "buyer is serious" } });

    const empty = parseReviewInput({ rating: 5, text: "a".repeat(20), providerContext: "   " });
    expect(empty.ok).toBe(true);
    if (empty.ok) expect(empty.data.providerContext).toBeUndefined();

    expect(parseReviewInput({ rating: 5, text: "a".repeat(20), providerContext: 42 }).ok).toBe(false);
  });
});

describe("isVerifiedUser", () => {
  it("requires an account with email OR phone verification", () => {
    expect(isVerifiedUser(null)).toBe(false);
    expect(isVerifiedUser(undefined)).toBe(false);
    expect(isVerifiedUser({ verified: false, phoneVerified: false })).toBe(false);
    expect(isVerifiedUser({ verified: true, phoneVerified: false })).toBe(true);
    expect(isVerifiedUser({ verified: false, phoneVerified: true })).toBe(true);
    expect(isVerifiedUser({ verified: true, phoneVerified: true })).toBe(true);
  });
});
