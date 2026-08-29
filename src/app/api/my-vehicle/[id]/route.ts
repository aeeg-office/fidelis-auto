import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { can, type AccountRole } from "@/lib/authorization";
import { normalizeImageOrder, syncVehicleImages } from "@/lib/vehicle-images";

const EDITABLE = [
  "year", "make", "model", "trim", "vin", "mileage",
  "exteriorColor", "interiorColor", "engine", "transmission",
  "drivetrain", "price", "descriptionEn", "descriptionAr",
] as const;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  if (!vehicle || vehicle.ownerId !== user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(vehicle);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role as AccountRole, "listing:create"))
    return NextResponse.json({ error: "Not permitted" }, { status: 403 });

  const { id } = await params;
  const existing = await prisma.vehicle.findUnique({
    where: { id },
    select: { id: true, ownerId: true, year: true, model: true },
  });
  if (!existing || existing.ownerId !== user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body))
    return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const data = body as Record<string, unknown>;
  const updates: Record<string, unknown> = {};
  for (const k of EDITABLE) {
    if (data[k] !== undefined) {
      const raw = data[k];
      if (k === "year" || k === "mileage") {
        updates[k] = raw === null || raw === "" ? null : parseInt(String(raw));
      } else {
        updates[k] = raw === "" ? null : raw;
      }
    }
  }
  if (data.make !== undefined && updates.make) {
    const year = updates.year ?? existing.year;
    updates.title = `${year} ${updates.make} ${updates.model ?? ""}`.trim();
    if (!updates.model) delete updates.title;
  }

  // Image management: accept either a plain ordered array of URLs (legacy
  // full-replace), or an ordered array of {id?, src, cover?} objects so the
  // owner can reorder, change the cover, delete, and replace images.
  let syncImages: { id?: string | null; src: string; cover?: boolean }[] | null = null;
  let plainReplace: string[] | null = null;
  if (Array.isArray(data.images)) {
    const arr = data.images as unknown[];
    if (arr.length && arr.every((u) => typeof u === "string")) {
      plainReplace = (arr as string[]).slice(0, 30);
    } else {
      const normalized = normalizeImageOrder(arr);
      if (normalized) syncImages = normalized;
    }
  }

  const vehicle = await prisma.$transaction(async (tx) => {
    const updated = await tx.vehicle.update({ where: { id }, data: updates });
    if (syncImages) {
      // New ordered-object format: reorder, set cover, delete dropped ids,
      // and create new (replacement) uploads.
      await syncVehicleImages(tx, id, syncImages, { deleteFiles: true });
    } else if (plainReplace) {
      // Legacy: full replace from a plain URL array.
      await tx.vehicleImage.deleteMany({ where: { vehicleId: id } });
      if (plainReplace.length) {
        await tx.vehicleImage.createMany({
          data: plainReplace.map((src, i) => ({
            vehicleId: id,
            src,
            alt: null,
            isPrimary: i === 0,
            sortOrder: i,
            category: "exterior",
          })),
        });
      }
    }
    return updated;
  });
  return NextResponse.json({ ok: true, id: vehicle.id });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const existing = await prisma.vehicle.findUnique({
    where: { id },
    select: { id: true, ownerId: true, year: true, model: true },
  });
  if (!existing || existing.ownerId !== user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.vehicle.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
