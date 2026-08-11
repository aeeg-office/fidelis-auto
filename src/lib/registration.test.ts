import { describe, expect, it } from "vitest";
import { normalizeRegistration, validateRegistration } from "./registration";

const valid = {
  firstName: "Amina",
  lastName: "Hassan",
  email: "AMINA@EXAMPLE.COM ",
  mobileNumber: "+201001234567",
  country: "Egypt",
  city: "Cairo",
  password: "SafePass1!",
};

describe("registration validation", () => {
  it("normalizes required buyer registration data", () => {
    expect(normalizeRegistration(valid)).toMatchObject({
      firstName: "Amina",
      lastName: "Hassan",
      email: "amina@example.com",
      country: "Egypt",
      city: "Cairo",
      role: "SELLER",
    });
    expect(validateRegistration(valid)).toEqual({ ok: true });
  });

  it("rejects missing mandatory profile fields and weak passwords", () => {
    expect(validateRegistration({ ...valid, firstName: "" })).toEqual({
      ok: false,
      error: "First name is required.",
    });
    expect(validateRegistration({ ...valid, mobileNumber: "" })).toEqual({
      ok: false,
      error: "Mobile number is required.",
    });
    expect(validateRegistration({ ...valid, country: "" })).toEqual({
      ok: false,
      error: "Country is required.",
    });
    expect(validateRegistration({ ...valid, password: "weak" })).toEqual({
      ok: false,
      error: "Password must be at least 8 characters.",
    });
  });
});
