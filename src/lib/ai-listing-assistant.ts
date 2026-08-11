type AssistanceInput = {
  year?: unknown;
  make?: unknown;
  model?: unknown;
  trim?: unknown;
  mileage?: unknown;
  exteriorColor?: unknown;
  interiorColor?: unknown;
  engine?: unknown;
  transmission?: unknown;
  notes?: unknown;
};

type AssistanceResult = { ok: true; prompt: string } | { ok: false; error: string };

const text = (value: unknown, max = 120) => typeof value === "string" ? value.trim().slice(0, max) : "";

export function buildListingAssistancePrompt(input: AssistanceInput): AssistanceResult {
  const year = Number(input.year);
  const make = text(input.make);
  const model = text(input.model);
  if (!Number.isInteger(year) || year < 1886 || year > new Date().getFullYear() + 1 || !make || !model) {
    return { ok: false, error: "Year, make, and model are required for writing assistance." };
  }

  const details = [
    `${year} ${make} ${model}`,
    text(input.trim) && `trim: ${text(input.trim)}`,
    text(input.mileage) && `mileage: ${text(input.mileage)}`,
    text(input.exteriorColor) && `exterior: ${text(input.exteriorColor)}`,
    text(input.interiorColor) && `interior: ${text(input.interiorColor)}`,
    text(input.engine) && `engine: ${text(input.engine)}`,
    text(input.transmission) && `transmission: ${text(input.transmission)}`,
    text(input.notes, 1_500) && `seller notes: ${text(input.notes, 1_500)}`,
  ].filter(Boolean).join("; ");

  return {
    ok: true,
    prompt: `Write a concise, premium vehicle-listing description using only these supplied facts: ${details}. Do not invent provenance, service history, ownership, condition, options, price, or certifications. If information is missing, omit it. Use plain text, 90–150 words, and avoid hype.`,
  };
}

export function sanitizeAssistedDescription(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const description = value.trim().replace(/\s+/g, " ");
  return description && description.length <= 2_000 ? description : null;
}
