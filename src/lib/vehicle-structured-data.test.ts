import { describe, expect, it } from "vitest";
import { buildMileage, buildVehicleOffer } from "./vehicle-structured-data";

const url = "https://fidelisauto.com/vehicles/x";

describe("buildVehicleOffer", () => {
  it("uses the WS1 numeric price and the listing's own currency", () => {
    expect(buildVehicleOffer({ priceAmount: 125_000_000, currency: "EGP", price: null, status: "available", url })).toEqual({
      "@type": "Offer",
      price: 1_250_000,
      priceCurrency: "EGP",
      url,
      availability: "https://schema.org/InStock",
    });
  });

  it("falls back to a plain numeric legacy price, defaulting currency to EGP", () => {
    const o = buildVehicleOffer({ priceAmount: null, currency: null, price: " 450000 ", status: null, url });
    expect(o?.price).toBe(450000);
    expect(o?.priceCurrency).toBe("EGP");
  });

  it("emits no offer when there is no real price", () => {
    expect(buildVehicleOffer({ priceAmount: null, currency: "EGP", price: "Contact seller", status: "available", url })).toBeNull();
    expect(buildVehicleOffer({ priceAmount: 0, currency: "EGP", price: null, status: "available", url })).toBeNull();
  });

  it("maps sold/pending status to availability", () => {
    expect(buildVehicleOffer({ priceAmount: 100, currency: "usd", price: null, status: "sold", url })?.availability).toBe(
      "https://schema.org/SoldOut",
    );
    expect(buildVehicleOffer({ priceAmount: 100, currency: "usd", price: null, status: "pending", url })?.priceCurrency).toBe("USD");
  });
});

describe("buildMileage", () => {
  it("uses KMT by default and SMI for miles", () => {
    expect(buildMileage(42000, "km")).toEqual({ "@type": "QuantitativeValue", value: 42000, unitCode: "KMT" });
    expect(buildMileage(42000, "mi")?.unitCode).toBe("SMI");
    expect(buildMileage(null, "km")).toBeUndefined();
  });
});
