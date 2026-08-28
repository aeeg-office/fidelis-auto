import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

// GET /api/admin/activity — read the moderation/audit trail (admin only)
export async function GET() {
  if (!(await verifySession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  // Resolve actor + target names in one pass (ids may reference users OR
  // listings — AuditLog.targetId is polymorphic, so resolve defensively).
  const actorIds = [...new Set(logs.map((l) => l.actorId ?? "").filter(Boolean))];
  const targetReqIds = [...new Set(
    logs
      .filter((l) => l.metadata && l.metadata.includes("listingRequestId"))
      .map((l) => {
        try {
          return JSON.parse(l.metadata!).listingRequestId as string;
        } catch {
          return "";
        }
      })
      .filter(Boolean)
  )];

  const [actors, targetRequests] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: actorIds } },
      select: { id: true, name: true, email: true, role: true },
    }),
    prisma.listingRequest.findMany({
      where: { id: { in: targetReqIds } },
      select: { id: true, year: true, make: true, model: true },
    }),
  ]);

  const actorMap = new Map(actors.map((a) => [a.id, a.name || a.email]));
  const targetMap = new Map(targetRequests.map((r) => [r.id, `${r.year} ${r.make} ${r.model}`]));

  const rows = logs.map((l) => {
    let targetLabel = targetMap.get(l.targetId ?? "") ?? null;
    if (!targetLabel && l.metadata) {
      try {
        const meta = JSON.parse(l.metadata);
        if (meta?.listingRequestId) targetLabel = targetMap.get(meta.listingRequestId) ?? null;
      } catch {
        /* ignore malformed metadata */
      }
    }
    let metadata = null;
    if (l.metadata) {
      try {
        metadata = JSON.parse(l.metadata);
      } catch {
        metadata = l.metadata;
      }
    }
    return {
      id: l.id,
      action: l.action,
      actor: actorMap.get(l.actorId ?? "") ?? (l.actorId ? { id: l.actorId } : null),
      target: targetLabel ? { id: l.targetId, label: targetLabel } : null,
      metadata,
      createdAt: l.createdAt,
    };
  });

  return NextResponse.json(rows);
}