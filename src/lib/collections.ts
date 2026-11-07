/**
 * WS12 — pure helpers for the curated-collections feature (no I/O, unit-testable).
 */

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Normalizes a user-typed slug to lowercase-hyphenated form and validates it.
 * Returns `{ ok: true, slug }` on success or `{ ok: false, error }` otherwise.
 */
export function sanitizeSlug(
  input: string | null | undefined
): { ok: true; slug: string } | { ok: false; error: string } {
  const slug = (input || "").trim().toLowerCase().replace(/\s+/g, "-");
  if (!slug) return { ok: false, error: "Slug is required." };
  if (!SLUG_RE.test(slug)) {
    return { ok: false, error: "Slug may only contain lowercase letters, numbers, and hyphens." };
  }
  return { ok: true, slug };
}

/** Coerces an unknown value to an int, falling back when unparseable. */
export function toInt(value: unknown, fallback = 0): number {
  const n = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(n) ? n : fallback;
}

/** Coerces an unknown value to an array of non-empty trimmed strings. */
export function toIdArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value === "string") return value.trim() ? [value.trim()] : [];
  return [];
}