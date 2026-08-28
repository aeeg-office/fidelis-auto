/**
 * auto-publish.ts
 * Converts a manually-submitted ListingRequest into a live, published Vehicle
 * owned by the submitting user, linking its uploaded photos. Used only when the
 * ad-text scanner deems the submission clean.
 */
import { prisma } from "@/lib/prisma";

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
    exteriorColor?: string | null;
    interiorColor?: string | null;
    engine?: string | null;
    transmission?: string | null;
    description?: string | null;
    photoUrls?: string | null;
    videoUrls?: string | null;
  },
  listingId: string,
): Promise<AutoPublishResult> {
  const ownerId = submission.userId ?? undefined;

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
      exteriorColor: submission.exteriorColor ?? null,
      interiorColor: submission.interiorColor ?? null,
      engine: submission.engine ?? null,
      transmission: submission.transmission ?? null,
      descriptionEn: submission.description ?? null,
      // No explicit price provided by a submission yet — default status available.
      price: "", // filled by owner via edit flow; placeholder to satisfy required field
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

  // Mark the submission approved.
  await prisma.listingRequest.update({
    where: { id: listingId },
    data: { status: "approved", notes: "Auto-approved at submission (no ad text violations)." },
  });

  return { ok: true, vehicleId: vehicle.id, listingId, published: true };
}
