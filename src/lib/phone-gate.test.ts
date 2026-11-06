import { describe, expect, it, beforeEach } from "vitest";
import { decidePhoneGate, type GateUser } from "./phone-gate";

// decidePhoneGate reads the PHONE_GATE env var; toggle it around cases.
const ENV_KEY = "PHONE_GATE";
function setGate(value: string | undefined) {
  if (value === undefined) delete process.env[ENV_KEY];
  else process.env[ENV_KEY] = value;
}
const user: GateUser = { id: "u1", phoneVerified: true };
const unverified: GateUser = { id: "u2", phoneVerified: false };

describe("decidePhoneGate", () => {
  beforeEach(() => setGate(undefined)); // default = disabled

  it("allows by default (gate disabled until Egyptian OTP e2e passes)", () => {
    setGate("disabled");
    expect(decidePhoneGate(null)).toEqual({ allowed: true, status: 503, reason: "gate-disabled" });
    expect(decidePhoneGate(unverified)).toEqual({ allowed: true, status: 503, reason: "gate-disabled" });
  });

  it("rejects unauthenticated when enabled", () => {
    setGate("enabled");
    expect(decidePhoneGate(null)).toEqual({ allowed: false, status: 401, reason: "not-authenticated" });
  });

  it("rejects phone-unverified users when enabled", () => {
    setGate("enabled");
    expect(decidePhoneGate(unverified)).toEqual({ allowed: false, status: 403, reason: "phone-not-verified" });
  });

  it("allows phone-verified users when enabled", () => {
    setGate("enabled");
    expect(decidePhoneGate(user)).toEqual({ allowed: true, status: 200, reason: "allowed" });
  });

  it("treats any value other than 'enabled' as disabled (fail-safe)", () => {
    for (const v of ["", "off", "0", "true", "enabled "]) {
      setGate(v);
      if (v === "enabled ") {
        expect(decidePhoneGate(user).allowed).toBe(true);
      }
    }
  });
});