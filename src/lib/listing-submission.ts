type ListingPayload = Record<string, unknown>;

type ListingSubmission = {
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  mileage: number | null;
  exteriorColor: string | null;
  interiorColor: string | null;
  engine: string | null;
  transmission: string | null;
  description: string | null;
  photoUrls: string | null;
  videoUrls: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;
};

type SubmissionResult = { ok: true; value: ListingSubmission } | { ok: false; error: string };
type UrlListResult = { ok: true; value: string | null } | { ok: false; error: string };

const asText = (value: unknown): string => typeof value === "string" ? value.trim() : "";
const asOptionalText = (value: unknown): string | null => asText(value) || null;

function serializeUrlList(value: unknown, field: "Photo" | "Video"): UrlListResult {
  if (value == null) return { ok: true, value: null };
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string" && item.trim())) {
    return { ok: false, error: `${field} URLs must be an array.` };
  }
  return { ok: true, value: value.length ? JSON.stringify(value.map((item) => item.trim())) : null };
}

export function normalizeListingSubmission(payload: ListingPayload, authenticatedUserId: string): SubmissionResult {
  const name = asText(payload.name);
  const email = asText(payload.email).toLowerCase();
  const make = asText(payload.make);
  const model = asText(payload.model);
  if (!name || !email || !make || !model) return { ok: false, error: "Name, email, make, and model are required." };

  const year = Number(payload.year);
  if (!Number.isInteger(year) || year < 1886 || year > new Date().getFullYear() + 1) {
    return { ok: false, error: "A valid vehicle year is required." };
  }

  const mileageText = asText(payload.mileage);
  const mileage = mileageText ? Number(mileageText) : null;
  if (mileage !== null && (!Number.isInteger(mileage) || mileage < 0)) {
    return { ok: false, error: "Mileage must be a non-negative whole number." };
  }

  const photoUrls = serializeUrlList(payload.photoUrls, "Photo");
  if (!photoUrls.ok) return photoUrls;
  const videoUrls = serializeUrlList(payload.videoUrls, "Video");
  if (!videoUrls.ok) return videoUrls;

  return {
    ok: true,
    value: {
      userId: authenticatedUserId,
      name,
      email,
      phone: asOptionalText(payload.phone),
      year,
      make,
      model,
      trim: asOptionalText(payload.trim),
      mileage,
      exteriorColor: asOptionalText(payload.exteriorColor),
      interiorColor: asOptionalText(payload.interiorColor),
      engine: asOptionalText(payload.engine),
      transmission: asOptionalText(payload.transmission),
      description: asOptionalText(payload.description),
      photoUrls: photoUrls.value,
      videoUrls: videoUrls.value,
      city: asOptionalText(payload.city),
      state: asOptionalText(payload.state),
      country: asOptionalText(payload.country),
      zipCode: asOptionalText(payload.zipCode),
    },
  };
}
