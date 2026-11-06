import { parseAmount } from "../../scripts/price-parser";

type ListingPayload = Record<string, unknown>;

export type VehicleTypeValue = "CAR" | "MOTORCYCLE";

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
  mileageUnit: string;
  vehicleType: VehicleTypeValue;
  price: string | null;            // raw text price (always preserved)
  priceAmount: number | null;      // smallest unit (piastres for EGP); null = unambiguous backfill not possible
  currency: string;
  bodyType: string | null;
  fuelType: string | null;
  isLicensed: boolean;
  makeId: string | null;
  modelId: string | null;
  cityId: string | null;
  countryId: string | null;
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
  const maximum = field === "Photo" ? 30 : 3;
  const allowedExtensions = field === "Photo" ? "(?:jpg|png|webp|avif)" : "(?:mp4|webm)";
  const uploadUrl = new RegExp(`^/uploads/[0-9a-f-]{36}\\.${allowedExtensions}$`, "i");
  if (!Array.isArray(value) || value.length > maximum || !value.every((item) => typeof item === "string" && uploadUrl.test(item))) {
    return { ok: false, error: `${field} URLs must reference approved uploaded media.` };
  }
  return { ok: true, value: value.length ? JSON.stringify(value) : null };
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

  // WS1 vehicle type: CAR | MOTORCYCLE (default CAR; reject unknown values).
  const vehicleTypeRaw = asText(payload.vehicleType).toUpperCase();
  const vehicleType: VehicleTypeValue = vehicleTypeRaw === "MOTORCYCLE" ? "MOTORCYCLE" : "CAR";

  // WS1 numeric price: parse the raw price text with the same strict parser used for backfill, so
  // the submission carry forward the safest amount. Ambiguous/foreign/malformed => priceAmount null
  // but raw price text is still preserved; the submit flow must require a price for publication.
  const price = asOptionalText(payload.price);
  const parsed = price ? parseAmount(price) : { amount: null };
  const priceAmount = parsed?.amount !== undefined && parsed.amount !== null ? parsed.amount : null;
  const currency = asOptionalText(payload.currency) || "EGP";

  // Optional WS1 taxonomy ids (must be plain text ids; validated against DB at the API layer).
  const makeId = asOptionalText(payload.makeId);
  const modelId = asOptionalText(payload.modelId);
  const cityId = asOptionalText(payload.cityId);
  const countryId = asOptionalText(payload.countryId);

  const isLicensed = payload.isLicensed === true || payload.isLicensed === "true";

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
      mileageUnit: asText(payload.mileageUnit) || "km",
      vehicleType,
      price,
      priceAmount,
      currency,
      bodyType: asOptionalText(payload.bodyType),
      fuelType: asOptionalText(payload.fuelType),
      isLicensed,
      makeId,
      modelId,
      cityId,
      countryId,
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
