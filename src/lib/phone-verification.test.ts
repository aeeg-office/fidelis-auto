import { describe, expect, it } from "vitest";
import { OtpRateLimiter, normalizePhone, generateOtp } from "./phone-verification";

describe("OtpRateLimiter", () => {
  it("allows the first send, then limits per-minute (1/min/phone)", () => {
    const L = new OtpRateLimiter(1, 5, 1000);
    const t0 = 1_000_000;
    expect(L.allow("+20123456789", "1.2.3.4", t0)).toEqual({ ok: true });
    L.record("+20123456789", "1.2.3.4", t0);
    // Same phone, same minute -> blocked
    const d = L.allow("+20123456789", "1.2.3.4", t0 + 30_000);
    expect(d.ok).toBe(false);
    expect(d.reason).toBe("rate-limit-per-minute");
    expect(d.retryAfterSeconds).toBeGreaterThan(0);
    // Different phone is not blocked
    expect(L.allow("+2019999999", "1.2.3.4", t0 + 30_000)).toEqual({ ok: true });
  });

  it("allows a send again after the per-minute window passes", () => {
    const L = new OtpRateLimiter(1, 5, 1000);
    const t0 = 1_000_000;
    L.record("+2012345678", "1.2.3.4", t0);
    expect(L.allow("+2012345678", "1.2.3.4", t0 + 61_000).ok).toBe(true);
  });

  it("caps per-day at 5 for a phone", () => {
    const L = new OtpRateLimiter(1, 5, 1000);
    const t0 = 1_000_000;
    for (let i = 0; i < 5; i++) {
      const t = t0 + i * 120_000; // 2 min apart -> clear per-minute, same day
      expect(L.allow("+2012345678", "9.9.9.9", t).ok).toBe(true);
      L.record("+2012345678", "9.9.9.9", t);
    }
    // 6th send same day -> per-day capped
    expect(L.allow("+2012345678", "9.9.9.9", t0 + 6 * 120_000)).toEqual({
      ok: false,
      reason: "rate-limit-per-day",
    });
  });

  it("caps per-IP sends to stop budget abuse from one client", () => {
    const L = new OtpRateLimiter(1, 5, 3); // perIp=3
    const t0 = 1_000_000;
    L.record("a", "1.1.1.1", t0);
    L.record("b", "1.1.1.1", t0 + 120_000);
    L.record("c", "1.1.1.1", t0 + 240_000);
    // 4th from the same IP in the minute window -> blocked per-ip
    const d = L.allow("d", "1.1.1.1", t0 + 300_000);
    expect(d.ok).toBe(false);
    expect(d.reason).toBe("rate-limit-per-ip");
    // Different IP is allowed
    expect(L.allow("d", "8.8.8.8", t0 + 300_000).ok).toBe(true);
  });
});

describe("normalizePhone", () => {
  it("normalizes local Egypt format to E.164", () => {
    expect(normalizePhone("01234567890")).toBe("+201234567890");
    expect(normalizePhone("0100 123 4567")).toBe("+201001234567");
  });
  it("keeps existing E.164 / + prefix", () => {
    expect(normalizePhone("+201234567890")).toBe("+201234567890");
  });
  it("rejects empty", () => {
    expect(normalizePhone("")).toBe("");
    expect(normalizePhone("  ")).toBe("");
  });
});

describe("generateOtp", () => {
  it("produces a 6-digit numeric code", () => {
    const c = generateOtp();
    expect(/^\d{6}$/.test(c)).toBe(true);
  });
  it("is crypto-random (different values over a sample)", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 50; i++) seen.add(generateOtp());
    expect(seen.size).toBeGreaterThan(10);
  });
});