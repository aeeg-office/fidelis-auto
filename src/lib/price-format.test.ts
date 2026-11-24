import { describe, expect, it } from "vitest";
import { formatPrice, numericPrice } from "./price-format";

describe("numericPrice", () => {
  it("prefers priceAmount (minor units)", () => {
    expect(numericPrice({ priceAmount: 125_000_000, price: "999" })).toBe(1_250_000);
  });
  it("accepts plain numeric legacy text only", () => {
    expect(numericPrice({ price: "450,000" })).toBe(450000);
    expect(numericPrice({ price: "POA" })).toBeNull();
    expect(numericPrice({ price: "Contact seller" })).toBeNull();
    expect(numericPrice({})).toBeNull();
  });
});

describe("formatPrice", () => {
  it("formats in the listing currency, EGP by default — never a bare $", () => {
    const en = formatPrice({ priceAmount: 125_000_000 }, "en");
    expect(en).toMatch(/EGP/);
    expect(en).toMatch(/1,250,000/);
    expect(en).not.toMatch(/\$/);
    expect(formatPrice({ priceAmount: 2_500_000, currency: "USD" }, "en")).toMatch(/\$|USD/);
  });
  it("returns null without a numeric price", () => {
    expect(formatPrice({ price: "POA" }, "en")).toBeNull();
  });
  it("produces an Arabic-locale string for /ar", () => {
    expect(formatPrice({ priceAmount: 125_000_000 }, "ar")).toBeTruthy();
  });
});
