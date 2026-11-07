import { describe, expect, it } from "vitest";
import { sanitizeSlug, toInt, toIdArray } from "./collections";

describe("sanitizeSlug", () => {
  it("normalizes case and whitespace to lowercase hyphenated slugs", () => {
    expect(sanitizeSlug("Family SUVs")).toEqual({ ok: true, slug: "family-suvs" });
    expect(sanitizeSlug("  First   Cars  ")).toEqual({ ok: true, slug: "first-cars" });
    expect(sanitizeSlug("Motorcycles")).toEqual({ ok: true, slug: "motorcycles" });
  });

  it("accepts numbers and hyphens", () => {
    expect(sanitizeSlug("classic-1970s")).toEqual({ ok: true, slug: "classic-1970s" });
  });

  it("rejects empty / missing slugs", () => {
    expect(sanitizeSlug("")).toEqual({ ok: false, error: "Slug is required." });
    expect(sanitizeSlug(undefined)).toEqual({ ok: false, error: "Slug is required." });
  });

  it("rejects invalid characters and leading/trailing hyphens", () => {
    expect(sanitizeSlug("my collection!")).toEqual({ ok: false, error: expect.stringContaining("lowercase") });
    expect(sanitizeSlug("-classics")).toEqual({ ok: false, error: expect.stringContaining("lowercase") });
    expect(sanitizeSlug("classics-")).toEqual({ ok: false, error: expect.stringContaining("lowercase") });
  });
});

describe("toInt", () => {
  it("parses integers and falls back on garbage", () => {
    expect(toInt("42")).toBe(42);
    expect(toInt(7)).toBe(7);
    expect(toInt("abc")).toBe(0);
    expect(toInt(null, 5)).toBe(5);
  });
});

describe("toIdArray", () => {
  it("normalizes arrays and single strings to trimmed id lists", () => {
    expect(toIdArray([" a ", "b"])).toEqual(["a", "b"]);
    expect(toIdArray("x y")).toEqual(["x y"]);
    expect(toIdArray("  ")).toEqual([]);
    expect(toIdArray(null)).toEqual([]);
    expect(toIdArray(undefined)).toEqual([]);
  });
});