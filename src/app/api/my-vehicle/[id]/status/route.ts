import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";

// Owner marks their own published vehicle as sold (or back to available).
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (status !== "sold" && status !== "available") {
      return NextResponse.json(
        { error: "Status must be 'sold' or 'available'." },
        { status: 400 }
      );
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found." }, { status: 404 });
    }
    if (vehicle.ownerId !== user.id) {
      return NextResponse.json(
        { error: "You do not own this listing." },
        { status: 403 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const next = await tx.vehicle.update({
        where: { id },
        data: { status },
      });
      await tx.moderationLog.create({
        data: {
          vehicleId: id,
          targetUserId: user.id,
          action: status === "sold" ? "VEHICLE_MARKED_SOLD" : "VEHICLE_MARKED_AVAILABLE",
          previousStatus: vehicle.status,
          newStatus: status,
          notes: `Owner marked vehicle ${status === "sold" ? "as sold" : "as available"}.`,
        },
      });
      return next;
    });

    return NextResponse.json({
      ok: true,
      id: updated.id,
      status: updated.status,
      title: updated.title,
    });
  } catch (err) {
    console.error("mark-status error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
