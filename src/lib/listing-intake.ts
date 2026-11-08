/* Server-safe, deterministic AI listing intake (no LLM, no network).
 *
 * Converts seller-provided structured fields + an optional free-text note +
 * uploaded photo file names (used as HINTS ONLY) into a bilingual (EN/AR)
 * draft that the seller reviews before publishing.
 *
 * Anti-fabrication contract (matches the repo's honest-marketplace rules):
 *  - Every value in the draft comes from what the seller actually submitted.
 *  - Photo file names NEVER determine a specification; they surface only as
 *    "to confirm" suggestions when they happen to mention a known term.
 *  - Anything that could not be confirmed (missing field, unparseable price,
 *    photo-name suggestion, unrecognized enum value) is explicitly marked as
 *    "to confirm" (see ToConfirmItem) — never invented, never guessed.
 *  - Deterministic: same input always produces byte-identical output.
 *
 * Pure, side-effect-free, no DB access — unit-tested (listing-intake.test.ts).
 */

import { parseAmount } from "../../scripts/price-parser";
import { MAKES, EXTERIOR_COLORS } from "./car-data";

export type DraftField =
  | "year"
  | "make"
  | "model"
  | "trim"
  | "mileage"
  | "transmission"
  | "bodyType"
  | "fuelType"
  | "exteriorColor"
  | "interiorColor"
  | "engine"
  | "price";

export type ToConfirmReason = "missing" | "unparseable" | "unrecognized" | "hint";

export interface ToConfirmItem {
  field: DraftField;
  reason: ToConfirmReason;
  /** The raw submitted value that could not be confirmed (e.g. an unparseable price). */
  value: string | null;
  /** A photo file-name suggestion (hint only — never asserted as fact). */
  hint: string | null;
}

export interface PhotoHint {
  kind: "make" | "model" | "transmission" | "color" | "bodyType" | "fuelType" | "year";
  value: string;
  source: string; // the file name that produced this hint
}

export interface IntakeInput {
  year?: unknown;
  make?: unknown;
  model?: unknown;
  trim?: unknown;
  mileage?: unknown;
  mileageUnit?: unknown;
  transmission?: unknown;
  bodyType?: unknown;
  fuelType?: unknown;
  exteriorColor?: unknown;
  interiorColor?: unknown;
  engine?: unknown;
  price?: unknown;
  currency?: unknown;
  notes?: unknown;
  photoFilenames?: unknown;
}

export interface ListingDraft {
  fields: {
    year: number;
    make: string;
    model: string;
    trim: string | null;
    mileage: number | null;
    mileageUnit: string;
    transmission: string | null;
    bodyType: string | null;
    fuelType: string | null;
    exteriorColor: string | null;
    interiorColor: string | null;
    engine: string | null;
    price: string | null;
    priceAmount: number | null;
    currency: string;
    photoCount: number;
  };
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  toConfirm: ToConfirmItem[];
  notes: string | null;
  photoHints: PhotoHint[];
}

export type IntakeResult = { ok: true; draft: ListingDraft } | { ok: false; error: string };

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1886;
const MAX_NOTE_LENGTH = 2000;
const PHOTO_HINT_MAX = 8;

// ─── Fixed bilingual vocabulary (deterministic localization, not invention) ──

type EnumRow = { en: string; ar: string };

const enumTable: Record<"transmission" | "bodyType" | "fuelType", Record<string, EnumRow>> = {
  transmission: {
    MANUAL: { en: "Manual", ar: "يدوي" },
    AUTOMATIC: { en: "Automatic", ar: "أوتوماتيك" },
    OTHER: { en: "Other", ar: "أخرى" },
  },
  bodyType: {
    SEDAN: { en: "Sedan", ar: "سيدان" },
    HATCHBACK: { en: "Hatchback", ar: "هاتشباك" },
    SUV: { en: "SUV", ar: "SUV" },
    PICKUP: { en: "Pickup", ar: "بيك أب" },
    VAN: { en: "Van", ar: "فان" },
    COUPE: { en: "Coupe", ar: "كوبيه" },
    CONVERTIBLE: { en: "Convertible", ar: "كابورليه" },
    WAGON: { en: "Wagon", ar: "ستيشن واجن" },
    MPV: { en: "MPV", ar: "إم بي في" },
    OTHER: { en: "Other", ar: "أخرى" },
  },
  fuelType: {
    PETROL: { en: "Petrol", ar: "بنزين" },
    DIESEL: { en: "Diesel", ar: "ديزل" },
    ELECTRIC: { en: "Electric", ar: "كهرباء" },
    HYBRID: { en: "Hybrid", ar: "هايبرد" },
    LPG: { en: "LPG", ar: "غاز بترولي" },
    CNG: { en: "CNG", ar: "غاز طبيعي" },
    OTHER: { en: "Other", ar: "أخرى" },
  },
};

const BODY_TYPES = Object.keys(enumTable.bodyType);
const FUEL_TYPES = Object.keys(enumTable.fuelType);
const TRANSMISSION_VALUES = Object.keys(enumTable.transmission);

export const FIELD_LABELS: Record<DraftField, { en: string; ar: string }> = {
  year: { en: "Year", ar: "السنة" },
  make: { en: "Make", ar: "الصانع" },
  model: { en: "Model", ar: "الموديل" },
  trim: { en: "Trim", ar: "الفئة" },
  mileage: { en: "Mileage", ar: "عدد الكيلومترات" },
  transmission: { en: "Transmission", ar: "ناقل الحركة" },
  bodyType: { en: "Body type", ar: "نوع الهيكل" },
  fuelType: { en: "Fuel type", ar: "نوع الوقود" },
  exteriorColor: { en: "Exterior color", ar: "اللون الخارجي" },
  interiorColor: { en: "Interior color", ar: "اللون الداخلي" },
  engine: { en: "Engine", ar: "المحرك" },
  price: { en: "Asking price", ar: "السعر المطلوب" },
};

// Stable ordering for the "to confirm" list.
const FIELD_ORDER: DraftField[] = [
  "price",
  "bodyType",
  "fuelType",
  "transmission",
  "exteriorColor",
  "interiorColor",
  "engine",
  "mileage",
  "trim",
  "make",
  "model",
];

// ─── Small pure helpers ─────────────────────────────────────────────────────

const text = (value: unknown, max = 120): string =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const optionalText = (value: unknown, max = 120): string | null => text(value, max) || null;

const formatInteger = (value: number): string => Math.round(value).toLocaleString("en-US");

/** Upper-case normalization against a fixed allowed vocabulary; returns the raw value when unrecognized. */
function normalizeEnum(value: unknown, allowed: readonly string[]): string | null {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return null;
  const upper = raw.toUpperCase();
  return allowed.includes(upper) ? upper : raw;
}

function enumDisplay(field: "transmission" | "bodyType" | "fuelType", value: string): EnumRow | null {
  return enumTable[field][value.toUpperCase()] ?? null;
}

// ─── Display helpers (used by the review UI and by the draft itself) ───────

export function displayValue(
  field: DraftField,
  value: string | number | null,
  locale: "en" | "ar",
  opts?: { mileageUnit?: string; currency?: string },
): string {
  if (value === null || value === undefined || value === "") return "";
  if (field === "mileage") return `${formatInteger(Number(value))} ${opts?.mileageUnit ?? "km"}`;
  if (field === "price") return `${String(value)} ${opts?.currency ?? "EGP"}`;
  if (field === "transmission" || field === "bodyType" || field === "fuelType") {
    return enumDisplay(field, String(value))?.[locale] ?? String(value);
  }
  return String(value);
}

const REASON_PHRASES: Record<
  ToConfirmReason,
  { en: (label: string, value?: string | null, hint?: string | null) => string; ar: (label: string, value?: string | null, hint?: string | null) => string }
> = {
  missing: {
    en: (label) => `${label} (not provided)`,
    ar: (label) => `${label} (غير مُقدَّم)`,
  },
  unparseable: {
    en: (label, value) => `${label} (could not be computed automatically${value ? ` — "${value}"` : ""})`,
    ar: (label, value) => `${label} (تعذّر احتساب قيمته تلقائيًا${value ? ` — "${value}"` : ""})`,
  },
  unrecognized: {
    en: (label, value) => `${label} ("${value}" is not a recognized option)`,
    ar: (label, value) => `${label} ("${value}" ليست خيارًا معروفًا)`,
  },
  hint: {
    en: (label, _value, hint) => `${label} (a photo file name suggests "${hint}" — please confirm)`,
    ar: (label, _value, hint) => `${label} (يشير اسم ملف صورة إلى "${hint}" — يرجى التأكيد)`,
  },
};

/** Human-readable, bilingual rendering of a single "to confirm" item. */
export function describeToConfirm(item: ToConfirmItem, locale: "en" | "ar"): string {
  const label = FIELD_LABELS[item.field][locale];
  return REASON_PHRASES[item.reason][locale](label, item.value, item.hint);
}

// ─── Photo file-name hints (hint-only; never assert a specification) ───────

const HINT_BODY_TYPE_WORDS: Record<string, string> = {
  sedan: "Sedan",
  hatchback: "Hatchback",
  suv: "SUV",
  pickup: "Pickup",
  van: "Van",
  coupe: "Coupe",
  convertible: "Convertible",
  wagon: "Wagon",
  mpv: "MPV",
};

const HINT_FUEL_TYPE_WORDS: Record<string, string> = {
  petrol: "Petrol",
  gasoline: "Petrol",
  diesel: "Diesel",
  electric: "Electric",
  hybrid: "Hybrid",
  lpg: "LPG",
  cng: "CNG",
};

function stemFilename(fileName: string): string {
  const name = fileName.trim().toLowerCase();
  const withoutExt = name.replace(/\.[a-z0-9]{1,6}$/, "");
  return withoutExt.replace(/[^a-z0-9]+/g, " ").trim();
}

/** Word-boundary phrase matcher tolerant of separators ("land rover" matches "land_rover"). */
function buildPhraseRegex(phrase: string): RegExp | null {
  const words = phrase.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return null;
  const body = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("[^a-z0-9]+");
  return new RegExp(`(?<![a-z0-9])${body}(?![a-z0-9])`);
}

export function extractPhotoHints(photoFilenames: unknown): PhotoHint[] {
  const names = Array.isArray(photoFilenames)
    ? photoFilenames.filter((f): f is string => typeof f === "string").slice(0, 30)
    : [];
  const hints: PhotoHint[] = [];
  const seen = new Set<string>();
  const addHint = (kind: PhotoHint["kind"], value: string, source: string) => {
    const key = `${kind}:${value.toLowerCase()}`;
    if (seen.has(key) || hints.length >= PHOTO_HINT_MAX) return;
    seen.add(key);
    hints.push({ kind, value, source });
  };

  for (const fileName of names) {
    const stem = stemFilename(fileName);
    if (!stem) continue;

    for (const make of MAKES) {
      const rx = buildPhraseRegex(make.make);
      if (rx && rx.test(stem)) addHint("make", make.make, fileName);
    }
    for (const color of EXTERIOR_COLORS) {
      const rx = buildPhraseRegex(color);
      if (rx && rx.test(stem)) addHint("color", color, fileName);
    }
    for (const [word, canonical] of Object.entries({ manual: "Manual", automatic: "Automatic" })) {
      if (new RegExp(`(?<![a-z0-9])${word}(?![a-z0-9])`).test(stem)) addHint("transmission", canonical, fileName);
    }
    for (const [word, canonical] of Object.entries(HINT_BODY_TYPE_WORDS)) {
      if (new RegExp(`(?<![a-z0-9])${word}(?![a-z0-9])`).test(stem)) addHint("bodyType", canonical, fileName);
    }
    for (const [word, canonical] of Object.entries(HINT_FUEL_TYPE_WORDS)) {
      if (new RegExp(`(?<![a-z0-9])${word}(?![a-z0-9])`).test(stem)) addHint("fuelType", canonical, fileName);
    }
    const yearMatch = /(?<![0-9])(\d{4})(?![0-9])/.exec(stem);
    if (yearMatch) {
      const y = parseInt(yearMatch[1], 10);
      if (y >= MIN_YEAR && y <= CURRENT_YEAR + 1) addHint("year", String(y), fileName);
    }
  }

  // Model hints only against makes already hinted, to keep matching quiet.
  const hintedMakes = new Set(hints.filter((h) => h.kind === "make").map((h) => h.value.toLowerCase()));
  if (hintedMakes.size) {
    for (const fileName of names) {
      const stem = stemFilename(fileName);
      if (!stem) continue;
      for (const make of MAKES) {
        if (!hintedMakes.has(make.make.toLowerCase())) continue;
        for (const model of make.models) {
          const rx = buildPhraseRegex(model);
          if (rx && rx.test(stem)) addHint("model", model, fileName);
        }
      }
    }
  }

  return hints;
}

// ─── Draft builder ─────────────────────────────────────────────────────────

export function buildListingDraft(input: IntakeInput): IntakeResult {
  const year = Number(input.year);
  if (!Number.isInteger(year) || year < MIN_YEAR || year > CURRENT_YEAR + 1) {
    return { ok: false, error: "A valid year is required to build a draft." };
  }
  const make = text(input.make);
  const model = text(input.model);
  if (!make || !model) {
    return { ok: false, error: "Make and model are required to build a draft." };
  }

  const trim = optionalText(input.trim);
  const mileageUnit = optionalText(input.mileageUnit) || "km";
  const transmission = normalizeEnum(input.transmission, TRANSMISSION_VALUES);
  const bodyType = normalizeEnum(input.bodyType, BODY_TYPES);
  const fuelType = normalizeEnum(input.fuelType, FUEL_TYPES);
  const exteriorColor = optionalText(input.exteriorColor);
  const interiorColor = optionalText(input.interiorColor);
  const engine = optionalText(input.engine);
  const currency = optionalText(input.currency) || "EGP";
  const price = optionalText(input.price);
  const notes = optionalText(input.notes, MAX_NOTE_LENGTH) || null;

  // Mileage: whole non-negative number only.
  const mileageRaw = typeof input.mileage === "string" ? input.mileage.trim() : input.mileage;
  const mileageProvided = mileageRaw !== "" && mileageRaw !== null && mileageRaw !== undefined;
  let mileage: number | null = null;
  let mileageInvalid = false;
  if (mileageProvided) {
    const parsed = Number(mileageRaw);
    if (Number.isInteger(parsed) && parsed >= 0) mileage = parsed;
    else mileageInvalid = true;
  }

  // Price: reuse the repo's strict EGP parser; ambiguous/foreign prices stay unconfirmed.
  let priceAmount: number | null = null;
  let priceInvalid = false;
  if (price) {
    const parsed = parseAmount(price);
    priceAmount = parsed.amount;
    if (parsed.amount === null) priceInvalid = true;
  }

  const photoHints = extractPhotoHints(input.photoFilenames);
  const photoCount = Array.isArray(input.photoFilenames)
    ? input.photoFilenames.filter((f): f is string => typeof f === "string").length
    : 0;

  // ── "To confirm" marking: only what could not be confirmed. ──
  const toConfirm: ToConfirmItem[] = [];
  const add = (field: DraftField, reason: ToConfirmReason, value: string | null = null, hint: string | null = null) => {
    toConfirm.push({ field, reason, value, hint });
  };
  const hintOf = (kind: PhotoHint["kind"]): PhotoHint | undefined => photoHints.find((h) => h.kind === kind);

  // Field is empty and a photo name suggests it → hint-level "to confirm";
  // otherwise the value conflicts with a suggestion → hint-level too.
  const addHintOrMissing = (field: DraftField, confirmed: string | null, hint: PhotoHint | undefined) => {
    if (!confirmed) {
      add(field, hint ? "hint" : "missing", null, hint ? hint.value : null);
      return;
    }
    if (hint && hint.value.toLowerCase() !== confirmed.toLowerCase()) {
      add(field, "hint", confirmed, hint.value);
    }
  };

  // Price is NEVER guessed from photos — missing or unparseable stays "to confirm".
  if (!price) add("price", "missing");
  else if (priceInvalid) add("price", "unparseable", price);

  if (!bodyType) addHintOrMissing("bodyType", null, hintOf("bodyType"));
  else if (!BODY_TYPES.includes(bodyType)) add("bodyType", "unrecognized", bodyType);

  if (!fuelType) addHintOrMissing("fuelType", null, hintOf("fuelType"));
  else if (!FUEL_TYPES.includes(fuelType)) add("fuelType", "unrecognized", fuelType);

  addHintOrMissing("transmission", transmission, hintOf("transmission"));
  addHintOrMissing("exteriorColor", exteriorColor, hintOf("color"));

  if (!interiorColor) add("interiorColor", "missing");
  if (!engine) add("engine", "missing");

  if (!mileageProvided) add("mileage", "missing");
  else if (mileageInvalid) add("mileage", "unparseable", String(mileageRaw));

  if (!trim) add("trim", "missing");

  addHintOrMissing("make", make, hintOf("make"));
  addHintOrMissing("model", model, hintOf("model"));

  toConfirm.sort((a, b) => FIELD_ORDER.indexOf(a.field) - FIELD_ORDER.indexOf(b.field));

  // ── Bilingual titles (only confirmed data). ──
  const identityEn = trim ? `${year} ${make} ${model} ${trim}` : `${year} ${make} ${model}`;
  const identityAr = trim ? `${make} ${model} ${trim} موديل ${year}` : `${make} ${model} موديل ${year}`;

  // ── Bilingual confirmed-details bullets. ──
  const bulletsEn: string[] = [`Vehicle: ${identityEn}`];
  const bulletsAr: string[] = [`المركبة: ${identityAr}`];
  if (transmission) {
    bulletsEn.push(`Transmission: ${displayValue("transmission", transmission, "en")}`);
    bulletsAr.push(`ناقل الحركة: ${displayValue("transmission", transmission, "ar")}`);
  }
  if (mileage !== null) {
    bulletsEn.push(`Mileage: ${formatInteger(mileage)} ${mileageUnit}`);
    bulletsAr.push(`عدد الكيلومترات: ${formatInteger(mileage)} ${mileageUnit === "km" ? "كم" : mileageUnit}`);
  }
  if (exteriorColor) {
    bulletsEn.push(`Exterior color: ${exteriorColor}`);
    bulletsAr.push(`اللون الخارجي: ${exteriorColor}`);
  }
  if (interiorColor) {
    bulletsEn.push(`Interior color: ${interiorColor}`);
    bulletsAr.push(`اللون الداخلي: ${interiorColor}`);
  }
  if (engine) {
    bulletsEn.push(`Engine: ${engine}`);
    bulletsAr.push(`المحرك: ${engine}`);
  }
  if (bodyType) {
    bulletsEn.push(`Body type: ${displayValue("bodyType", bodyType, "en")}`);
    bulletsAr.push(`نوع الهيكل: ${displayValue("bodyType", bodyType, "ar")}`);
  }
  if (fuelType) {
    bulletsEn.push(`Fuel type: ${displayValue("fuelType", fuelType, "en")}`);
    bulletsAr.push(`نوع الوقود: ${displayValue("fuelType", fuelType, "ar")}`);
  }
  if (price) {
    bulletsEn.push(`Asking price: ${price} ${currency}`);
    bulletsAr.push(`السعر المطلوب: ${price} ${currency}`);
  }

  const confirmLineEn = toConfirm.length
    ? `To confirm before publishing: ${toConfirm.map((i) => describeToConfirm(i, "en")).join("; ")}.`
    : "All details were confirmed — nothing is marked for confirmation.";
  const confirmLineAr = toConfirm.length
    ? `للتأكيد قبل النشر: ${toConfirm.map((i) => describeToConfirm(i, "ar")).join("؛ ")}.`
    : "جميع التفاصيل مؤكدة — لا يوجد ما هو معلَّم للتأكيد.";

  const photoLineEn =
    photoCount > 0
      ? `Photos (${photoCount}) were used as file-name hints only and never used to determine any specification.`
      : null;
  const photoLineAr =
    photoCount > 0
      ? `تم استخدام الصور (${photoCount}) كتلميحات من أسماء الملفات فقط، ولم تُستخدم أبدًا لتحديد أي مواصفة.`
      : null;

  const noteBlockEn = notes ? ["", "Seller's note:", notes] : [];
  const noteBlockAr = notes ? ["", "ملاحظة البائع:", notes] : [];
  const photoBlockEn = photoLineEn ? ["", photoLineEn] : [];
  const photoBlockAr = photoLineAr ? ["", photoLineAr] : [];

  const lines = (head: string, bullets: string[], confirm: string, noteBlock: string[], photoBlock: string[]): string[] => [
    head,
    "",
    ...bullets,
    "",
    confirm,
    ...noteBlock,
    ...photoBlock,
  ];

  const descriptionEn = lines(
    "Draft listing — generated from the seller's submitted details. No information was invented.",
    bulletsEn,
    confirmLineEn,
    noteBlockEn,
    photoBlockEn,
  ).join("\n");

  const descriptionAr = lines(
    "مسودة قائمة — أُنشئت من التفاصيل التي أدخلها البائع. لم يتم اختلاق أي معلومة.",
    bulletsAr,
    confirmLineAr,
    noteBlockAr,
    photoBlockAr,
  ).join("\n");

  return {
    ok: true,
    draft: {
      fields: {
        year,
        make,
        model,
        trim,
        mileage,
        mileageUnit,
        transmission,
        bodyType,
        fuelType,
        exteriorColor,
        interiorColor,
        engine,
        price,
        priceAmount,
        currency,
        photoCount,
      },
      titleEn: identityEn,
      titleAr: identityAr,
      descriptionEn,
      descriptionAr,
      toConfirm,
      notes,
      photoHints,
    },
  };
}
