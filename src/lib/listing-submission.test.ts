import { describe, expect, it } from "vitest";
import { normalizeListingSubmission } from "./listing-submission";

describe("listing submission normalization", () => {
  const validPayload = {
    userId: "attacker-controlled-user-id",
    name: "Amina Seller",
    email: "amina@example.com",
    phone: "+971500000000",
    year: "2023",
    make: "Porsche",
    model: "911",
    mileage: "1200",
    photoUrls: ["/uploads/one.jpg"],
    videoUrls: ["/uploads/one.mp4"],
    city: "Dubai",
    country: "United Arab Emirates",
  };

  it("uses the authenticated owner and ignores a client supplied user id", () => {
    const result = normalizeListingSubmission(validPayload, "authenticated-owner-id");

    expect(result).toMatchObject({
      ok: true,
      value: {
        userId: "authenticated-owner-id",
        year: 2023,
        mileage: 1200,
      },
    });
    expect(result.ok && result.value).not.toHaveProperty("clientUserId");
  });

  it("rejects malformed numeric values and non-array media input", () => {
    expect(normalizeListingSubmission({ ...validPayload, year: "invalid" }, "owner")).toEqual({
      ok: false,
      error: "A valid vehicle year is required.",
    });
    expect(normalizeListingSubmission({ ...validPayload, photoUrls: "not-an-array" }, "owner")).toEqual({
      ok: false,
      error: "Photo URLs must be an array.",
    });
  });
});
