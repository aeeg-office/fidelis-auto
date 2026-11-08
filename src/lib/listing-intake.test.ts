import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildListingDraft,
  describeToConfirm,
  displayValue,
  extractPhotoHints,
  FIELD_LABELS,
  type IntakeInput,
  type ToConfirmItem,
} from "./listing-intake";

const fullInput: IntakeInput = {
  year: 2015,
  make: "BMW",
  model: "X5",
  trim: "M Sport",
  mileage: "45000",
  transmission: "Automatic",
  exteriorColor: "Black",
  engine: "3.0L",
  price: "1,200,000",
  currency: "EGP",
  notes: "One careful owner, full service history.",
  photoFilenames: ["bmw-x5-front.jpg", "interior-black.jpg"],
};

describe("buildListingDraft", () => {
  it("fills confirmed fields from structured input and never invents details", () => {
    const result = buildListingDraft(fullInput);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.draft.fields).toMatchObject({
      year: 2015,
      make: "BMW",
      model: "X5",
      trim: "M Sport",
      mileage: 45000,
      transmission: "AUTOMATIC",
      exteriorColor: "Black",
      engine: "3.0L",
      price: "1,200,000",
      priceAmount: 120000000, // 1,200,000 EGP in piastres via the strict parser
      currency: "EGP",
      photoCount: 2,
    });
    expect(result.draft.titleEn).toBe("2015 BMW X5 M Sport");
    expect(result.draft.titleAr).toBe("BMW X5 M Sport موديل 2015");

    // Confirmed data appears in both drafts; nothing else is asserted.
    const en = result.draft.descriptionEn;
    const ar = result.draft.descriptionAr;
    expect(en).toContain("No information was invented");
    expect(en).toContain("Transmission: Automatic");
    expect(en).toContain("Mileage: 45,000 km");
    expect(en).toContain("Asking price: 1,200,000 EGP");
    expect(ar).toContain("لم يتم اختلاق أي معلومة");
    expect(ar).toContain("ناقل الحركة: أوتوماتيك");
    expect(ar).toContain("عدد الكيلومترات: 45,000 كم");
    expect(ar).toContain("السعر المطلوب: 1,200,000 EGP");

    // Already-confirmed fields are not flagged.
    const flagged = result.draft.toConfirm.map((i) => i.field);
    expect(flagged).not.toContain("price");
    expect(flagged).not.toContain("transmission");
    expect(flagged).not.toContain("mileage");
    // Still-unconfirmed optionals ARE flagged.
    expect(flagged).toContain("bodyType");
    expect(flagged).toContain("fuelType");
    expect(flagged).toContain("interiorColor");

    // Seller's own note is carried verbatim, clearly labeled.
    expect(en).toContain("Seller's note:");
    expect(en).toContain("One careful owner, full service history.");
    // Photos are only hints, and the draft says so.
    expect(en).toContain("used as file-name hints only");
  });

  it("marks every unconfirmed field as 'to confirm' and never fabricates a price", () => {
    const result = buildListingDraft({ year: 2021, make: "Toyota", model: "Corolla" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const fields = result.draft.toConfirm.map((i) => i.field);
    expect(fields).toEqual([
      "price",
      "bodyType",
      "fuelType",
      "transmission",
      "exteriorColor",
      "interiorColor",
      "engine",
      "mileage",
      "trim",
    ]);

    const en = result.draft.descriptionEn;
    const ar = result.draft.descriptionAr;
    expect(en).toContain("Asking price (not provided)");
    expect(en).toContain("Body type (not provided)");
    expect(ar).toContain("السعر المطلوب (غير مُقدَّم)");
    // No price value was ever invented.
    expect(en).not.toMatch(/EGP/);
    expect(en).not.toMatch(/[£$€]/);

    // The draft explicitly tells the seller to confirm.
    expect(en).toContain("To confirm before publishing:");
  });

  it("marks unparseable prices as 'to confirm' instead of guessing", () => {
    const result = buildListingDraft({
      year: 2020,
      make: "Porsche",
      model: "911",
      price: "negotiable",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const priceItem = result.draft.toConfirm.find((i) => i.field === "price");
    expect(priceItem).toMatchObject({ reason: "unparseable", value: "negotiable" });
    expect(result.draft.descriptionEn).toContain("could not be computed automatically");
    expect(result.draft.fields.priceAmount).toBeNull();

    // Foreign-currency prices are never converted into EGP.
    const foreign = buildListingDraft({ year: 2020, make: "Porsche", model: "911", price: "50000 USD" });
    expect(foreign.ok).toBe(true);
    if (!foreign.ok) return;
    expect(foreign.draft.toConfirm.find((i) => i.field === "price")?.reason).toBe("unparseable");
  });

  it("surfaces photo file-name suggestions only as hints, when they conflict", () => {
    const result = buildListingDraft({
      year: 2021,
      make: "Toyota",
      model: "Corolla",
      photoFilenames: ["bmw-m3-front.jpg"],
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const makeItem = result.draft.toConfirm.find((i) => i.field === "make");
    expect(makeItem).toMatchObject({ reason: "hint", hint: "BMW", value: "Toyota" });
    const modelItem = result.draft.toConfirm.find((i) => i.field === "model");
    expect(modelItem).toMatchObject({ reason: "hint", hint: "M3" });
    expect(result.draft.descriptionEn).toContain('a photo file name suggests "BMW"');
    expect(result.draft.descriptionAr).toContain('يشير اسم ملف صورة إلى "BMW"');
  });

  it("marks unrecognized enum values as 'to confirm'", () => {
    const result = buildListingDraft({
      year: 2020,
      make: "Toyota",
      model: "Corolla",
      bodyType: "4x4",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.draft.fields.bodyType).toBe("4x4"); // raw value preserved, never mapped
    expect(result.draft.toConfirm.find((i) => i.field === "bodyType")).toMatchObject({
      reason: "unrecognized",
      value: "4x4",
    });
    expect(result.draft.descriptionEn).toContain('"4x4" is not a recognized option');
  });

  it("rejects an incomplete vehicle identity without inventing one", () => {
    expect(buildListingDraft({})).toEqual({ ok: false, error: "A valid year is required to build a draft." });
    expect(buildListingDraft({ year: 2021 })).toEqual({
      ok: false,
      error: "Make and model are required to build a draft.",
    });
    expect(buildListingDraft({ year: "not-a-year", make: "BMW", model: "X5" })).toEqual({
      ok: false,
      error: "A valid year is required to build a draft.",
    });
  });

  it("is deterministic: identical input produces identical output", () => {
    const a = buildListingDraft(fullInput);
    const b = buildListingDraft(fullInput);
    expect(a).toEqual(b);
  });
});

describe("extractPhotoHints", () => {
  it("extracts known terms from file names without asserting them as facts", () => {
    const hints = extractPhotoHints([
      "IMG_2021_land_rover_front.jpg",
      "dashboard_manual.jpg",
      "black_trim.jpg",
    ]);
    expect(hints).toContainEqual(expect.objectContaining({ kind: "make", value: "Land Rover" }));
    expect(hints).toContainEqual(expect.objectContaining({ kind: "year", value: "2021" }));
    expect(hints).toContainEqual(expect.objectContaining({ kind: "transmission", value: "Manual" }));
    expect(hints).toContainEqual(expect.objectContaining({ kind: "color", value: "Black" }));
  });

  it("deduplicates repeated hints and ignores noise file names", () => {
    const hints = extractPhotoHints(["bmw-front.jpg", "bmw-rear.jpg", "IMG_20220101_123456.jpg"]);
    expect(hints.filter((h) => h.kind === "make" && h.value === "BMW")).toHaveLength(1);
    // A pure camera-style name with no recognizable term yields no make hint.
    expect(hints.filter((h) => h.kind === "year")).toHaveLength(0); // 20220101 is not a 4-digit year
  });

  it("is safe with malformed input", () => {
    expect(extractPhotoHints(null)).toEqual([]);
    expect(extractPhotoHints(["", 42])).toEqual([]);
  });
});

describe("bilingual helpers", () => {
  it("renders fixed vocabulary in both locales", () => {
    expect(displayValue("transmission", "AUTOMATIC", "en")).toBe("Automatic");
    expect(displayValue("transmission", "AUTOMATIC", "ar")).toBe("أوتوماتيك");
    expect(displayValue("bodyType", "SUV", "ar")).toBe("SUV");
    expect(displayValue("bodyType", "4x4", "ar")).toBe("4x4"); // unknown passes through raw
    expect(displayValue("mileage", 45000, "en", { mileageUnit: "km" })).toBe("45,000 km");
    expect(displayValue("price", "1,200,000", "ar", { currency: "EGP" })).toBe("1,200,000 EGP");
  });

  it("renders to-confirm items with per-locale labels", () => {
    const item: ToConfirmItem = { field: "bodyType", reason: "missing", value: null, hint: null };
    expect(describeToConfirm(item, "en")).toBe("Body type (not provided)");
    expect(describeToConfirm(item, "ar")).toBe("نوع الهيكل (غير مُقدَّم)");
    expect(FIELD_LABELS.price.en).toBe("Asking price");
    expect(FIELD_LABELS.price.ar).toBe("السعر المطلوب");
  });
});

describe("bilingual message key parity", () => {
  const DRAFT_KEYS = [
    "draftSection",
    "draftSectionHint",
    "draftFromInfo",
    "draftConfirmed",
    "draftToConfirm",
    "draftToConfirmNote",
    "draftPhotoHints",
    "draftPhotoHintsNote",
    "draftNotes",
    "draftTitleEn",
    "draftTitleAr",
    "draftDescEn",
    "draftDescAr",
    "useEnDraft",
    "useArDraft",
    "keepMyText",
    "draftCopied",
    "draftError",
  ];

  const load = (locale: "en" | "ar") => {
    const raw = readFileSync(join(process.cwd(), "messages", `${locale}.json`), "utf8");
    return JSON.parse(raw) as Record<string, Record<string, unknown>>;
  };

  it("adds every intake key to both en.json and ar.json with non-empty values", () => {
    const en = load("en").sellYourCar;
    const ar = load("ar").sellYourCar;
    for (const key of DRAFT_KEYS) {
      expect(typeof en[key]).toBe("string");
      expect((en[key] as string).trim().length).toBeGreaterThan(0);
      expect(typeof ar[key]).toBe("string");
      expect((ar[key] as string).trim().length).toBeGreaterThan(0);
    }
  });

  it("keeps the draft-related key sets identical across locales", () => {
    const draftKeysOf = (locale: "en" | "ar") =>
      Object.keys(load(locale).sellYourCar).filter((k) => k.startsWith("draft") || DRAFT_KEYS.includes(k));
    const enKeys = draftKeysOf("en");
    const arKeys = draftKeysOf("ar");
    expect([...arKeys].sort()).toEqual([...enKeys].sort());
    expect(enKeys).toEqual(expect.arrayContaining(DRAFT_KEYS));
  });
});
