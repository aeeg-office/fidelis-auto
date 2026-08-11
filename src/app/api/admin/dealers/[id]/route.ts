import { NextResponse } from "next/server";
import { dealerApprovalDecision } from "@/lib/dealer-approval";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/authorization";
import { getCurrentUser } from "@/lib/user-auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const actor = await getCurrentUser();
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(actor.role, "listing:moderate")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const decision = dealerApprovalDecision(body?.action, body?.notes);
  if (!decision.ok) return NextResponse.json({ error: decision.error }, { status: 400 });

  const application = await prisma.dealerProfile.findUnique({
    where: { id },
    include: { owner: { select: { id: true, role: true } } },
  });
  if (!application) return NextResponse.json({ error: "Dealer application not found" }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    await tx.dealerProfile.update({
      where: { id },
      data: { ...decision.profile, approvedById: decision.userRole ? actor.id : null },
    });
    if (decision.userRole && ["BUYER", "SELLER", "DEALER"].includes(application.owner.role)) {
      await tx.user.update({ where: { id: application.owner.id }, data: { role: decision.userRole } });
    }
    await tx.auditLog.create({
      data: {
        action: decision.auditAction,
        actorId: actor.id,
        targetId: application.owner.id,
        metadata: JSON.stringify({ dealerProfileId: application.id }),
      },
    });
  });

  return NextResponse.json({ ok: true, approvalStatus: decision.profile.approvalStatus });
}