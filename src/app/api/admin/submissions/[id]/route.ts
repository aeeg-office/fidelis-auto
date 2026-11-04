import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/authorization";
import { getCurrentUser } from "@/lib/user-auth";
import { listingModerationDecision } from "@/lib/listing-moderation";
import { autoPublish } from "@/lib/auto-publish";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const actor = await getCurrentUser();
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(actor.role, "listing:moderate")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const decision = listingModerationDecision(body?.action, body?.notes);
  if (!decision.ok) return NextResponse.json({ error: decision.error }, { status: 400 });

  const submission = await prisma.listingRequest.findUnique({ where: { id } });
  if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  if (submission.status !== "pending") return NextResponse.json({ error: "Only pending submissions can be moderated." }, { status: 409 });

  // Build the autoPublish payload from the full submission row.
  const publishable = {
    userId: submission.userId,
    name: submission.name,
    year: submission.year,
    make: submission.make,
    model: submission.model,
    trim: submission.trim,
    mileage: submission.mileage,
    exteriorColor: submission.exteriorColor,
    interiorColor: submission.interiorColor,
    engine: submission.engine,
    transmission: submission.transmission,
    description: submission.description,
    photoUrls: submission.photoUrls,
    videoUrls: submission.videoUrls,
  };

  if (decision.status === "approved") {
    // Publish the Vehicle from the approved submission, then record the decision.
    let vehicleId: string | undefined;
    try {
      const published = await autoPublish(publishable, submission.id);
      vehicleId = published.vehicleId;
    } catch (publishError) {
      console.error("Moderation approve publish failed for listing", submission.id, publishError);
      return NextResponse.json({ error: "Approval failed while publishing the vehicle; submission remains pending." }, { status: 500 });
    }

    await prisma.auditLog.create({
      data: {
        action: "LISTING_APPROVED",
        actorId: actor.id,
        targetId: submission.userId,
        metadata: JSON.stringify({ listingRequestId: submission.id, result: decision.status, vehicleId }),
      },
    });
    await prisma.moderationLog.create({
      data: {
        listingRequestId: submission.id,
        vehicleId,
        moderatorId: actor.id,
        targetUserId: submission.userId,
        action: "LISTING_APPROVED",
        previousStatus: submission.status,
        newStatus: "approved",
        notes: decision.notes ?? "Approved by administrator.",
      },
    });

    return NextResponse.json({ ok: true, status: "approved", notes: decision.notes, vehicleId });
  }

  // Rejected: flip status + log, no vehicle created.
  await prisma.auditLog.create({
    data: {
      action: "LISTING_REJECTED",
      actorId: actor.id,
      targetId: submission.userId,
      metadata: JSON.stringify({ listingRequestId: submission.id, result: "rejected" }),
    },
  });
  await prisma.moderationLog.create({
    data: {
      listingRequestId: submission.id,
      moderatorId: actor.id,
      targetUserId: submission.userId,
      action: "LISTING_REJECTED",
      previousStatus: submission.status,
      newStatus: "rejected",
      notes: decision.notes ?? null,
    },
  });
  await prisma.listingRequest.update({ where: { id }, data: { status: "rejected", notes: decision.notes } });

  return NextResponse.json({ ok: true, status: "rejected", notes: decision.notes });
}
