import { describe, expect, it } from "vitest";
import { listingModerationDecision } from "./listing-moderation";

describe("listing moderation", () => {
  it("approves a pending listing with an audit action", () => {
    expect(listingModerationDecision("approve", "Verified documentation.")).toEqual({
      ok: true,
      status: "approved",
      notes: "Verified documentation.",
      auditAction: "LISTING_APPROVED",
    });
  });

  it("rejects with a seller-visible explanation", () => {
    expect(listingModerationDecision("reject", "Please provide clear ownership photos.")).toEqual({
      ok: true,
      status: "rejected",
      notes: "Please provide clear ownership photos.",
      auditAction: "LISTING_REJECTED",
    });
  });

  it("refuses unsupported actions and excessive notes", () => {
    expect(listingModerationDecision("publish", "")).toEqual({ ok: false, error: "Invalid listing moderation action." });
    expect(listingModerationDecision("approve", "x".repeat(2_001))).toEqual({
      ok: false,
      error: "Moderation notes must be 2000 characters or fewer.",
    });
  });
});
