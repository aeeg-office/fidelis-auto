import { describe, expect, it } from "vitest";
import {
  dedupeKeyFor,
  normaliseEgyptPhone,
  normaliseName,
  publishGate,
  stripAdminOnly,
  validateImportRow,
  type DirectoryRow,
} from "./service-directory";

const good: DirectoryRow = {
  businessName: "Nile Classic Workshop",
  category: "Maintain & Repair",
  city: "Cairo",
  phone: "010 1234 5678",
  descriptionEn: "Independent workshop covering classic European engines and gearboxes.",
  servicesOffered: ["Engine rebuild", "Gearbox service"],
  sourceUrls: ["https://nileclassic.example/contact", "https://www.facebook.com/nileclassic"],
};

describe("normaliseEgyptPhone", () => {
  it("normalises mobile numbers in every common form to +20", () => {
    for (const v of ["01012345678", "+20 10 1234 5678", "0020-10-1234-5678", "(010) 1234-5678", "20 10 12345678"]) {
      expect(normaliseEgyptPhone(v)).toBe("+201012345678");
    }
  });
  it("accepts valid mobile prefixes 010/011/012/015 only", () => {
    expect(normaliseEgyptPhone("01112345678")).toBe("+201112345678");
    expect(normaliseEgyptPhone("01512345678")).toBe("+201512345678");
    expect(normaliseEgyptPhone("01312345678")).toBeNull(); // 013 is not a mobile range
  });
  it("accepts a Cairo landline", () => {
    expect(normaliseEgyptPhone("02 2345 6789")).toBe("+20223456789");
  });
  it("rejects bare, too-short, or non-Egyptian numbers", () => {
    expect(normaliseEgyptPhone("1012345678")).toBeNull(); // no prefix: ambiguous
    expect(normaliseEgyptPhone("010123")).toBeNull();
    expect(normaliseEgyptPhone("+966501234567")).toBeNull();
    expect(normaliseEgyptPhone("")).toBeNull();
    expect(normaliseEgyptPhone(null)).toBeNull();
  });
});

describe("normaliseName / dedupeKeyFor", () => {
  it("unifies Arabic orthographic variants and strips diacritics", () => {
    expect(normaliseName("مَرْكَز الإصلاح")).toBe(normaliseName("مركز الاصلاح"));
    expect(normaliseName("مدرسة")).toBe(normaliseName("مدرسه"));
  });
  it("is case and punctuation insensitive", () => {
    expect(normaliseName("Nile-Classic  Workshop!")).toBe("nileclassicworkshop");
  });
  it("produces the same key for the same business written differently", () => {
    const a = dedupeKeyFor({ businessName: "Nile Classic Workshop", city: "Cairo", phone: "01012345678" });
    const b = dedupeKeyFor({ businessName: "nile classic workshop", city: "CAIRO", phone: "+20 10 1234 5678" });
    expect(a).toBe(b);
  });
  it("separates two branches that have different phones", () => {
    const a = dedupeKeyFor({ businessName: "Chain", city: "Cairo", phone: "01012345678" });
    const b = dedupeKeyFor({ businessName: "Chain", city: "Cairo", phone: "01112345678" });
    expect(a).not.toBe(b);
  });
});

describe("validateImportRow", () => {
  it("accepts a well-formed row", () => {
    expect(validateImportRow(good)).toEqual({ ok: true, errors: [] });
  });
  it("rejects a category outside SERVICE_CATEGORIES", () => {
    const r = validateImportRow({ ...good, category: "Crypto" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.join(" ")).toMatch(/category not in SERVICE_CATEGORIES/);
  });
  it("rejects a bad Egyptian phone and a non-https website", () => {
    const r = validateImportRow({ ...good, phone: "12345", website: "http://nile.example" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors).toEqual(expect.arrayContaining(["phone not a valid Egyptian number", "website must be an https URL"]));
  });
  it("rejects an empty or too-short English description", () => {
    const r = validateImportRow({ ...good, descriptionEn: "Short." });
    expect(r.ok).toBe(false);
  });
});

describe("publishGate (two-source rule)", () => {
  it("publishes when name, city, phone, 2 services and 2 distinct sources all pass", () => {
    expect(publishGate(good)).toEqual({ publish: true });
  });
  it("holds a record with only one source", () => {
    const r = publishGate({ ...good, sourceUrls: ["https://nileclassic.example/contact"] });
    expect(r).toEqual({ publish: false, holdReasons: ["needs 2 independent sources, has 1"] });
  });
  it("does not count two URLs on the same host as two sources", () => {
    const r = publishGate({ ...good, sourceUrls: ["https://nileclassic.example/a", "https://www.nileclassic.example/b"] });
    expect(r.publish).toBe(false);
  });
  it("holds a record without a verified phone or WhatsApp", () => {
    const r = publishGate({ ...good, phone: null, whatsapp: null });
    expect(r.publish).toBe(false);
    if (!r.publish) expect(r.holdReasons).toContain("no verified phone or WhatsApp");
  });
  it("holds a record with fewer than two concrete services", () => {
    const r = publishGate({ ...good, servicesOffered: ["Engine rebuild"] });
    expect(r.publish).toBe(false);
    if (!r.publish) expect(r.holdReasons).toContain("fewer than 2 concrete services");
  });
});

describe("stripAdminOnly", () => {
  it("removes sourceUrls and dedupeKey so they never reach a public response", () => {
    const row = { id: "x", businessName: "Nile", sourceUrls: "[\"https://a.example\"]", dedupeKey: "nile|cairo|1" };
    expect(stripAdminOnly(row)).toEqual({ id: "x", businessName: "Nile" });
    expect(JSON.stringify(stripAdminOnly(row))).not.toMatch(/sourceUrls|dedupeKey/);
  });
});
