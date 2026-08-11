import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/authorization";
import { getCurrentUser } from "@/lib/user-auth";
import { listingModerationDecision } from "@/lib/listing-moderation";

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

  const submission = await prisma.listingRequest.findUnique({ where: { id }, select: { id: true, userId: true, status: true } });
  if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  if (submission.status !== "pending") return NextResponse.json({ error: "Only pending submissions can be moderated." }, { status: 409 });

  const listing = await prisma.$transaction(async (tx) => {
    const updated = await tx.listingRequest.update({
      where: { id },
      data: { status: decision.status, notes: decision.notes },
    });
    await tx.auditLog.create({
      data: {
        action: decision.auditAction,
        actorId: actor.id,
        targetId: submission.userId,
        metadata: JSON.stringify({ listingRequestId: submission.id, result: decision.status }),
      },
    });
    return updated;
  });

  return NextResponse.json({ ok: true, status: listing.status, notes: listing.notes });
}
