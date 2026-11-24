// WS-SD Service Directory — pure, dependency-free helpers.
// Used by scripts/import-directory.ts and the publish gate. No I/O here.
import { SERVICE_CATEGORIES } from "./fidelisTaxonomy";

export const CATEGORY_LABELS: readonly string[] = SERVICE_CATEGORIES.map((c) => c.label);

// ── Text normalisation (EN + AR) ─────────────────────────────────────────
// Strips Arabic diacritics and tatweel, unifies alef/ya/ta-marbuta variants,
// lowercases, and keeps only letters and digits. Used for dedupe keys only.
export function normaliseName(raw: string): string {
  return raw
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "") // harakat + tatweel
    .replace(/[\u0622\u0623\u0625]/g, "\u0627") // أ إ آ -> ا
    .replace(/\u0649/g, "\u064A") // ى -> ي
    .replace(/\u0629/g, "\u0647") // ة -> ه
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

// ── Egyptian phone normalisation ─────────────────────────────────────────
// Accepts +20, 0020, 20 or a local 0-prefixed number, with spaces, dashes or
// brackets. Returns E.164 "+20…" or null. This is a FORMAT check only; it does
// not prove the number is live. Liveness comes from the two-source rule.
// Mobile: 01[0125] + 8 digits. Landline: area digit(s) 2-9 + 7-8 digits.
export function normaliseEgyptPhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let s = raw.trim().replace(/[\s\-().\u00A0\u200E\u200F]/g, "");
  if (s.startsWith("+")) s = s.slice(1);
  else if (s.startsWith("00")) s = s.slice(2);
  if (s.startsWith("20")) s = s.slice(2);
  else if (s.startsWith("0")) s = s.slice(1);
  else return null; // a bare national number with no prefix is ambiguous
  // s is now the national significant number
  if (/^1[0125]\d{8}$/.test(s)) return `+20${s}`; // Egyptian mobile (10 digits)
  if (/^[2-9]\d{7,8}$/.test(s)) return `+20${s}`; // Landline (8-9 digits)
  return null;
}

export function phoneDigits(e164: string | null): string {
  return e164 ? e164.replace(/\D/g, "") : "";
}

// ── Dedupe ───────────────────────────────────────────────────────────────
// normalised name | normalised city | phone digits. Two branches of one chain
// are separate listings only when they have a different address AND phone.
export function dedupeKeyFor(input: { businessName: string; city: string; phone: string | null }): string {
  return `${normaliseName(input.businessName)}|${normaliseName(input.city)}|${phoneDigits(normaliseEgyptPhone(input.phone))}`;
}

// ── Import validation ────────────────────────────────────────────────────
export type DirectoryRow = {
  businessName: string;
  businessNameAr?: string | null;
  category: string; // must equal a SERVICE_CATEGORIES label
  subType?: string | null;
  city: string;
  governorate?: string | null;
  district?: string | null;
  landmark?: string | null;
  address?: string | null;
  mapsUrl?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  email?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  hours?: string | null;
  descriptionEn: string;
  descriptionAr?: string | null;
  servicesOffered: string[];
  makesServed?: string[];
  vehicleTypes?: string[];
  eras?: string[];
  authorisedBrands?: string[];
  languages?: string | null;
  sourceUrls: string[];
  verificationLevel?: "UNVERIFIED" | "SOURCE_VERIFIED";
};

export type ValidationResult = { ok: true; errors: [] } | { ok: false; errors: string[] };

function isHttpsUrl(u: string): boolean {
  try {
    const x = new URL(u);
    return x.protocol === "https:" && !!x.hostname;
  } catch {
    return false;
  }
}

// Syntax-level validation. Network "does it resolve" is checked by the import
// script, not here, so this stays pure and testable.
export function validateImportRow(row: DirectoryRow): ValidationResult {
  const errors: string[] = [];
  if (!row.businessName?.trim()) errors.push("businessName required");
  if (!CATEGORY_LABELS.includes(row.category)) errors.push(`category not in SERVICE_CATEGORIES: ${row.category}`);
  if (!row.city?.trim()) errors.push("city required");
  if (!row.descriptionEn || row.descriptionEn.trim().length < 20) errors.push("descriptionEn required (min 20 chars)");
  if (row.phone && !normaliseEgyptPhone(row.phone)) errors.push("phone not a valid Egyptian number");
  if (row.whatsapp && !normaliseEgyptPhone(row.whatsapp)) errors.push("whatsapp not a valid Egyptian number");
  if (row.website && !isHttpsUrl(row.website)) errors.push("website must be an https URL");
  if (row.mapsUrl && !isHttpsUrl(row.mapsUrl)) errors.push("mapsUrl must be an https URL");
  for (const u of row.sourceUrls ?? []) if (!isHttpsUrl(u)) errors.push(`sourceUrl must be https: ${u}`);
  return errors.length === 0 ? { ok: true, errors: [] } : { ok: false, errors };
}

// ── Publish gate (two-source rule, §1.2) ─────────────────────────────────
// A record is publishable only if name, city, and a verified phone or WhatsApp
// agree across at least TWO distinct source URLs, and it has at least two
// concrete services. Anything else goes to HOLD with reasons.
export function publishGate(row: DirectoryRow): { publish: true } | { publish: false; holdReasons: string[] } {
  const reasons: string[] = [];
  const distinctSources = new Set((row.sourceUrls ?? []).map((u) => {
    try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; }
  }));
  if (!row.businessName?.trim()) reasons.push("no name");
  if (!row.city?.trim()) reasons.push("no city");
  if (!CATEGORY_LABELS.includes(row.category)) reasons.push("category invalid");
  if (!normaliseEgyptPhone(row.phone) && !normaliseEgyptPhone(row.whatsapp)) reasons.push("no verified phone or WhatsApp");
  if ((row.servicesOffered ?? []).filter((s) => s.trim()).length < 2) reasons.push("fewer than 2 concrete services");
  if (distinctSources.size < 2) reasons.push(`needs 2 independent sources, has ${distinctSources.size}`);
  return reasons.length === 0 ? { publish: true } : { publish: false, holdReasons: reasons };
}

// ── Public-API safety ────────────────────────────────────────────────────
// Fields that must never appear in a public response or rendered page.
export const ADMIN_ONLY_FIELDS = ["sourceUrls", "dedupeKey"] as const;

export function stripAdminOnly<T extends Record<string, unknown>>(row: T): Omit<T, (typeof ADMIN_ONLY_FIELDS)[number]> {
  const out: Record<string, unknown> = { ...row };
  for (const f of ADMIN_ONLY_FIELDS) delete out[f];
  return out as Omit<T, (typeof ADMIN_ONLY_FIELDS)[number]>;
}
