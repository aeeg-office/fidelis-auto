/**
 * auto-publish.ts
 * Publishes an admin-approved ListingRequest as a live Vehicle owned by the submitting
 * user, linking its uploaded photos. Invoked only from the admin moderation "approve"
 * action (never on submission) — no submission auto-publishes (FID-AUD-202). The audit
 * trail is written by the caller (`LISTING_APPROVED`); this helper does not record any
 * fake "auto-approval" event.
 */
import { prisma } from "@/lib/prisma";
import type { BodyType, FuelType } from "@prisma/client";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Ensure a unique slug by appending a short suffix when a collision exists. */
async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let i = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.vehicle.findUnique({ where: { slug }, select: { id: true } });
    if (!existing) return slug;
    slug = `${base}-${i++}`;
  }
}

function parseUrls(json: string | null | undefined): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.filter((u): u is string => typeof u === "string") : [];
  } catch {
    return [];
  }
}

export interface AutoPublishResult {
  ok: true;
  vehicleId: string;
  listingId: string;
  published: boolean;
}

/**
 * Publish a listing submission as a real Vehicle.
 * @param submission the normalized ListingRequest row payload
 * @param listingId the ListingRequest id to mark approved
 */
export async function autoPublish(
  submission: {
    userId: string | null;
    name: string;
    year: number;
    make: string;
    model: string;
    trim?: string | null;
    mileage?: number | null;
    mileageUnit?: string;
    vehicleType?: string | null;
    price?: string | null;
    priceAmount?: number | null;
    currency?: string | null;
    bodyType?: string | null;
    fuelType?: string | null;
    isLicensed?: boolean | null;
    makeId?: string | null;
    modelId?: string | null;
    cityId?: string | null;
    countryId?: string | null;
    expiresAt?: Date | null;
    exteriorColor?: string | null;
    interiorColor?: string | null;
    engine?: string | null;
    transmission?: string | null;
    description?: string | null;
    photoUrls?: string | null;
    videoUrls?: string | null;
    audioUrl?: string | null;
  },
  listingId: string,
): Promise<AutoPublishResult> {
  const ownerId = submission.userId ?? undefined;

  // Normalize the taxonomy ids to undefined when absent so Prisma doesn't set them NULL/nullable-0.
  const makeId = submission.makeId ?? undefined;
  const modelId = submission.modelId ?? undefined;
  const cityId = submission.cityId ?? undefined;
  const countryId = submission.countryId ?? undefined;

  // bodyType / fuelType come from the submission as validated strings; only carry
  // values that are real Prisma enum members (safe cast), drop anything else.
  const BODY_TYPES = ["SEDAN","HATCHBACK","SUV","PICKUP","VAN","COUPE","CONVERTIBLE","WAGON","MPV","OTHER"] as const;
  const FUEL_TYPES = ["PETROL","DIESEL","ELECTRIC","HYBRID","LPG","CNG","OTHER"] as const;
  const bodyType = (submission.bodyType && (BODY_TYPES as readonly string[]).includes(submission.bodyType) ? submission.bodyType : null) as BodyType | null;
  const fuelType = (submission.fuelType && (FUEL_TYPES as readonly string[]).includes(submission.fuelType) ? submission.fuelType : null) as FuelType | null;

  // Title + slug from make/model/year/trim.
  const titleParts = [String(submission.year), submission.make, submission.model];
  if (submission.trim) titleParts.push(submission.trim);
  const title = titleParts.join(" ");
  const baseSlug = slugify(`${submission.make}-${submission.model}-${submission.year}`);
  const slug = await uniqueSlug(baseSlug);

  const vehicle = await prisma.vehicle.create({
    data: {
      ownerId,
      slug,
      title,
      year: submission.year,
      make: submission.make,
      model: submission.model,
      trim: submission.trim ?? null,
      mileage: submission.mileage ?? null,
      mileageUnit: submission.mileageUnit ?? "km",
      vehicleType: (submission.vehicleType === "MOTORCYCLE" || submission.vehicleType === "CAR" ? submission.vehicleType : "CAR"),
      price: submission.price ?? "",
      priceAmount: submission.priceAmount ?? null,
      currency: submission.currency ?? "EGP",
      bodyType,
      fuelType,
      isLicensed: submission.isLicensed ?? null,
      makeId,
      modelId,
      cityId,
      countryId,
      expiresAt: submission.expiresAt ?? null,
      exteriorColor: submission.exteriorColor ?? null,
      interiorColor: submission.interiorColor ?? null,
      engine: submission.engine ?? null,
      transmission: submission.transmission ?? null,
      descriptionEn: submission.description ?? null,
      // WS15 P2 media: carry approved walkaround video(s) + engine sound clip
      // through to the published vehicle verbatim.
      videoUrls: submission.videoUrls ?? null,
      audioUrl: submission.audioUrl ?? null,
      status: "available",
      isPublished: true,
    },
  });

  // Attach uploaded photos as VehicleImage rows (primary = first).
  const photos = parseUrls(submission.photoUrls);
  if (photos.length) {
    await prisma.vehicleImage.createMany({
      data: photos.map((src, idx) => ({
        vehicleId: vehicle.id,
        src,
        isPrimary: idx === 0,
        category: "exterior",
        sortOrder: idx,
      })),
    });
  }

  // Mark the submission approved by administrator.
  await prisma.listingRequest.update({
    where: { id: listingId },
    data: { status: "approved", notes: "Approved and published by an administrator." },
  });

  // NOTE: no moderation/audit row is written here. This helper only runs during an admin
  // approval, and the caller (`/api/admin/submissions/[id]`) already records the accurate
  // LISTING_APPROVED audit + moderation rows. Writing an "AUTO_APPROVED" row here would
  // fabricate an auto-approval event that never happens (FID-AUD-202).

  return { ok: true, vehicleId: vehicle.id, listingId, published: true };
}
