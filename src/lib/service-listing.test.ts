import { describe, expect, it } from "vitest";
import { normalizeServiceListing } from "./service-listing";

describe("service listing normalization", () => {
  const valid = { businessName: "Fidelis Restoration", category: "Restoration", description: "Specialist classic-car restoration.", website: "https://example.com" };

  it("accepts a bounded valid service listing", () => {
    expect(normalizeServiceListing(valid)).toMatchObject({ ok: true, value: valid });
  });

  it("rejects invalid categories and insecure websites", () => {
    expect(normalizeServiceListing({ ...valid, category: "Crypto" })).toEqual({ ok: false, error: "Business name, a valid category, and description are required." });
    expect(normalizeServiceListing({ ...valid, website: "http://example.com" })).toEqual({ ok: false, error: "Website must use HTTPS." });
  });
});
