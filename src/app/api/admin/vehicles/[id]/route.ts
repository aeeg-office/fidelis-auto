import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { normalizeImageOrder, syncVehicleImages } from "@/lib/vehicle-images";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifySession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await request.json();
    const { isFeatured, images } = body;

    const data: Record<string, unknown> = {};
    if (typeof isFeatured === "boolean") data.isFeatured = isFeatured;
    if (body.featuredUntil !== undefined) {
      if (body.featuredUntil === null) data.featuredUntil = null;
      else {
        const until = new Date(body.featuredUntil);
        if (Number.isNaN(until.getTime())) {
          return NextResponse.json({ error: "Invalid featuredUntil date" }, { status: 400 });
        }
        data.featuredUntil = until;
      }
    }

    const ordered = Array.isArray(images) ? normalizeImageOrder(images) : null;

    const vehicle = await prisma.$transaction(async (tx) => {
      const updated = await tx.vehicle.update({ where: { id }, data });
      if (ordered) {
        await syncVehicleImages(tx, id, ordered, { deleteFiles: true });
      }
      return updated;
    });

    return NextResponse.json({ ok: true, isFeatured: vehicle.isFeatured });
  } catch (error) {
    console.error("Vehicle update error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}