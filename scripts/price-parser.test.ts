import { describe, expect, it } from "vitest";
import { parseAmount, INT_MAX } from "./price-parser";

describe("price parser (WS1 backfill)", () => {
  it("accepts plain and comma-grouped EGP prices into smallest units (piastres)", () => {
    expect(parseAmount("500000")).toEqual({ amount: 50000000 });
    expect(parseAmount("1,200,000 EGP")).toEqual({ amount: 120000000 });
    expect(parseAmount("1,200,000 LE")).toEqual({ amount: 120000000 });
    expect(parseAmount("1200")).toEqual({ amount: 120000 });
  });

  it("accepts Egyptian-pound tokens e£ / E £ / E£ and Arabic EGP tokens", () => {
    expect(parseAmount("1,200,000 e£")).toEqual({ amount: 120000000 });
    expect(parseAmount("E £ 900,000")).toEqual({ amount: 90000000 });
    expect(parseAmount("750000 ج.م")).toEqual({ amount: 75000000 });
    expect(parseAmount("900,000 جنيه مصري")).toEqual({ amount: 90000000 });
    expect(parseAmount("900,000 جنيه من مصري")).toEqual({ amount: 90000000 });
    expect(parseAmount("1,200,000 جنيه")).toEqual({ amount: 120000000 });
  });

  it("rejects foreign-currency tokens (never backfilled into EGP)", () => {
    expect(parseAmount("$25000")).toEqual({ amount: null, flag: "currency-mismatch-foreign-token" });
    expect(parseAmount("£25000")).toEqual({ amount: null, flag: "currency-mismatch-foreign-token" });
    expect(parseAmount("1000 USD")).toEqual({ amount: null, flag: "currency-mismatch-foreign-token" });
    expect(parseAmount("AED 50000")).toEqual({ amount: null, flag: "currency-mismatch-foreign-token" });
    expect(parseAmount("500,000 ريال")).toEqual({ amount: null, flag: "currency-mismatch-foreign-token" });
  });

  it("rejects negotiable / on-request / nonspecific prices", () => {
    expect(parseAmount("negotiable")).toEqual({ amount: null, flag: "negotiable-or-nonspecific" });
    expect(parseAmount("price on request")).toEqual({ amount: null, flag: "negotiable-or-nonspecific" });
    expect(parseAmount("للتفاوض")).toEqual({ amount: null, flag: "negotiable-or-nonspecific" });
  });

  it("rejects ambiguous / malformed grouping (data-safety)", () => {
    expect(parseAmount("1,50")).toEqual({ amount: null, flag: "ambiguous-decimal-or-range" });
    expect(parseAmount("1 2 3")).toEqual({ amount: null, flag: "non-numeric-or-malformed-grouping" });
    expect(parseAmount("1 500 000")).toEqual({ amount: null, flag: "ambiguous-space-grouping" });
    expect(parseAmount("12.5")).toEqual({ amount: null, flag: "ambiguous-decimal-or-range" });
    expect(parseAmount("مليون جنيه")).toEqual({ amount: null, flag: "non-numeric-or-malformed-grouping" });
    expect(parseAmount("ooo")).toEqual({ amount: null, flag: "non-numeric-or-malformed-grouping" });
    expect(parseAmount("no price")).toEqual({ amount: null, flag: "non-numeric-or-malformed-grouping" });
  });

  it("guards PostgreSQL INTEGER overflow", () => {
    // 25,000,000 EGP * 100 = 2,500,000,000 > INT_MAX
    expect(parseAmount("25000000")).toEqual({ amount: null, flag: "exceeds-int-max" });
    // boundary: largest value that fits
    expect(parseAmount(String(Math.floor(INT_MAX / 100)))).toEqual({ amount: Math.floor(INT_MAX / 100) * 100 });
  });

  it("rejects empty / whitespace-only values", () => {
    expect(parseAmount("")).toEqual({ amount: null });
    expect(parseAmount(null)).toEqual({ amount: null });
    expect(parseAmount("   ")).toEqual({ amount: null });
  });
});