import { describe, expect, it } from "vitest";
import {
  MIN_LISTING_DAYS,
  minListingExpiry,
  expiresFromSellerDays,
  hasMinimumDuration,
} from "./listing-duration";

const T0 = new Date("2026-11-06T12:00:00Z");

describe("listing duration policy (30-day minimum)", () => {
  it("minimum expiry is exactly 30 days out", () => {
    expect(MIN_LISTING_DAYS).toBe(30);
    const e = minListingExpiry(T0);
    expect((e.getTime() - T0.getTime()) / (24 * 3600 * 1000)).toBeCloseTo(30, 5);
  });

  it("seller choice shorter than 30 days is clamped up to the floor", () => {
    const e = expiresFromSellerDays(5, T0);
    expect((e.getTime() - T0.getTime()) / (24 * 3600 * 1000)).toBeCloseTo(30, 5);
    const e0 = expiresFromSellerDays(0, T0); // 0 / invalid -> floor
    expect((e0.getTime() - T0.getTime()) / (24 * 3600 * 1000)).toBeCloseTo(30, 5);
  });

  it("seller can choose longer than 30 days", () => {
    const e = expiresFromSellerDays(90, T0);
    expect((e.getTime() - T0.getTime()) / (24 * 3600 * 1000)).toBeCloseTo(90, 5);
  });

  it("hasMinimumDuration accepts 30+ days and null (unlimited) but rejects < 30", () => {
    expect(hasMinimumDuration(expiresFromSellerDays(30, T0), T0)).toBe(true);
    expect(hasMinimumDuration(expiresFromSellerDays(90, T0), T0)).toBe(true);
    expect(hasMinimumDuration(new Date(T0.getTime() + 5 * 24 * 3600 * 1000), T0)).toBe(false);
    expect(hasMinimumDuration(new Date(T0.getTime() + 29 * 24 * 3600 * 1000), T0)).toBe(false);
    expect(hasMinimumDuration(null, T0)).toBe(true);
  });
});