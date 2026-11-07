import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth";
import { toIdArray } from "@/lib/collections";

// POST /api/admin/collections/[id]/vehicles — add vehicles to a collection (idempotent)
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const vehicleIds = toIdArray(body?.vehicleIds);
  const sortOrder = Number.parseInt(String(body?.sortOrder ?? "0"), 10) || 0;

  const collection = await prisma.collection.findUnique({ where: { id } });
  if (!collection) return NextResponse.json({ error: "Collection not found." }, { status: 404 });
  if (vehicleIds.length === 0) {
    return NextResponse.json({ error: "vehicleIds array is required." }, { status: 400 });
  }

  await prisma.collectionVehicle.createMany({
    data: vehicleIds.map((vehicleId, i) => ({
      collectionId: id,
      vehicleId,
      sortOrder: sortOrder + i,
    })),
    skipDuplicates: true,
  });

  const count = await prisma.collectionVehicle.count({ where: { collectionId: id } });
  return NextResponse.json({ ok: true, count });
}

// DELETE /api/admin/collections/[id]/vehicles — remove vehicles from a collection
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const vehicleIds = toIdArray(body?.vehicleIds);

  const collection = await prisma.collection.findUnique({ where: { id } });
  if (!collection) return NextResponse.json({ error: "Collection not found." }, { status: 404 });
  if (vehicleIds.length === 0) {
    return NextResponse.json({ error: "vehicleIds array is required." }, { status: 400 });
  }

  const result = await prisma.collectionVehicle.deleteMany({
    where: { collectionId: id, vehicleId: { in: vehicleIds } },
  });

  return NextResponse.json({ ok: true, deleted: result.count });
}