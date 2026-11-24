import { describe, expect, it } from "vitest";
import { buildMakeCatalog, parseVehicleTypeParam } from "./make-catalog";
import { extractPhotoHints } from "./listing-intake";
import type { TaxonomyMake } from "./taxonomy-types";

const DB: TaxonomyMake[] = [
  { name: "BYD", vehicleType: "CAR", models: ["Atto 3", "Seal"] },
  { name: "Chery", vehicleType: "CAR", models: ["Tiggo 7", "Arrizo 5"] },
  { name: "chery ", vehicleType: "CAR", models: ["dup"] },
  { name: "Toyota", vehicleType: "CAR", models: ["Corolla"] },
  { name: "Yamaha", vehicleType: "MOTORCYCLE", models: ["YZF-R3", "NMAX"] },
];

describe("parseVehicleTypeParam", () => {
  it("accepts CAR/MOTORCYCLE case-insensitively", () => {
    expect(parseVehicleTypeParam("car")).toBe("CAR");
    expect(parseVehicleTypeParam(" Motorcycle ")).toBe("MOTORCYCLE");
  });
  it("treats anything else as no filter", () => {
    expect(parseVehicleTypeParam(null)).toBeNull();
    expect(parseVehicleTypeParam("")).toBeNull();
    expect(parseVehicleTypeParam("TRUCK")).toBeNull();
  });
});

describe("buildMakeCatalog", () => {
  it("serves the DB taxonomy incl. Chinese brands and motorcycles, deduplicated", () => {
    const all = buildMakeCatalog(DB, null);
    expect(all.map((m) => m.make)).toEqual(["BYD", "Chery", "Toyota", "Yamaha"]);
    expect(all.find((m) => m.make === "Chery")?.models).toEqual(["Tiggo 7", "Arrizo 5"]);
    expect(all.find((m) => m.make === "Yamaha")?.vehicleType).toBe("MOTORCYCLE");
  });

  it("filters by vehicle type", () => {
    expect(buildMakeCatalog(DB, "MOTORCYCLE").map((m) => m.make)).toEqual(["Yamaha"]);
    expect(buildMakeCatalog(DB, "CAR").map((m) => m.make)).toEqual(["BYD", "Chery", "Toyota"]);
  });

  it("falls back to the static car list when the DB taxonomy is empty, never inventing motorcycles", () => {
    const cars = buildMakeCatalog([], null);
    expect(cars.length).toBeGreaterThan(20);
    expect(cars.every((m) => m.vehicleType === "CAR")).toBe(true);
    expect(buildMakeCatalog([], "MOTORCYCLE")).toEqual([]);
  });
});

describe("extractPhotoHints with a DB catalog", () => {
  it("recognises Chinese brands and motorcycle makes from the supplied catalog", () => {
    const catalog = buildMakeCatalog(DB, null);
    const hints = extractPhotoHints(["chery-tiggo-7-front.jpg", "yamaha-nmax-side.jpg"], catalog);
    const makes = hints.filter((h) => h.kind === "make").map((h) => h.value);
    expect(makes).toEqual(expect.arrayContaining(["Chery", "Yamaha"]));
    const models = hints.filter((h) => h.kind === "model").map((h) => h.value);
    expect(models).toEqual(expect.arrayContaining(["Tiggo 7", "NMAX"]));
  });

  it("keeps the legacy behaviour when no catalog is supplied", () => {
    const hints = extractPhotoHints(["bmw-front.jpg"]);
    expect(hints.some((h) => h.kind === "make" && h.value === "BMW")).toBe(true);
  });
});
