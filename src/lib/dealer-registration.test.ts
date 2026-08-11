import { describe, expect, it } from "vitest";
import { validateDealerRegistration } from "./registration";

const validDealer = {
  businessName: "Fidelis Heritage Motors",
  contactPerson: "Amina Hassan",
  email: "dealer@example.com",
  phone: "+201001234567",
  address: "12 Nile Avenue",
  city: "Cairo",
  country: "Egypt",
  description: "Independent specialist in collector-car sourcing, inspections, and sales.",
  website: "https://example.com",
};

describe("dealer registration validation", () => {
  it("accepts a complete dealer application and normalizes email", () => {
    expect(validateDealerRegistration(validDealer)).toEqual({
      ok: true,
      value: expect.objectContaining({ email: "dealer@example.com" }),
    });
  });

  it("requires business, contact, address and meaningful description data", () => {
    expect(validateDealerRegistration({ ...validDealer, businessName: "" })).toEqual({
      ok: false,
      error: "Business name is required.",
    });
    expect(validateDealerRegistration({ ...validDealer, description: "Too brief" })).toEqual({
      ok: false,
      error: "Business description must be at least 30 characters.",
    });
  });
});
