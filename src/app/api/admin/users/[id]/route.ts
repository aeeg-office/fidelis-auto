import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { can, canManageRole } from "@/lib/authorization";
import type { AccountRole } from "@/lib/authorization";

// PATCH /api/admin/users/[id] — change a user's role and/or suspension status
// (guard: user:manage + role hierarchy). Both mutations are additive:
//   { role }          — reassign role (existing behaviour, unchanged)
//   { isSuspended }   — suspend / reinstate the account (WS10 warning-only policy)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const actor = await getCurrentUser();
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(actor.role, "user:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // ── Role change (existing behaviour, unchanged) ────────────────────────────
  const role = (body as { role?: unknown }).role as AccountRole | undefined;
  if (role !== undefined) {
    if (!["BUYER", "SELLER", "DEALER", "ADMINISTRATOR", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (!canManageRole(actor.role, role)) {
      return NextResponse.json({ error: "Cannot assign a role at or above your own" }, { status: 403 });
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const updated = await prisma.user.update({ where: { id }, data: { role } });
    return NextResponse.json({ ok: true, id: updated.id, role: updated.role });
  }

  // ── Suspension toggle (WS10) ───────────────────────────────────────────────
  const isSuspended = (body as { isSuspended?: unknown }).isSuspended;
  if (typeof isSuspended !== "boolean") {
    return NextResponse.json({ error: "Provide a role or isSuspended boolean" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Hierarchy: an administrator may not suspend another administrator (or a
  // SUPER_ADMIN), and SUPER_ADMIN may not suspend another SUPER_ADMIN.
  if (!canManageRole(actor.role, target.role)) {
    return NextResponse.json({ error: "Cannot manage a role at or above your own" }, { status: 403 });
  }
  if (target.id === actor.id) {
    return NextResponse.json({ error: "You cannot suspend your own account" }, { status: 403 });
  }
  if (target.isSuspended === isSuspended) {
    return NextResponse.json({ ok: true, id: target.id, isSuspended: target.isSuspended });
  }

  const updated = await prisma.user.update({ where: { id }, data: { isSuspended } });

  // Durable audit trail (AuditAction.ACCOUNT_SUSPENDED / ACCOUNT_RESTORED).
  await prisma.auditLog.create({
    data: {
      action: isSuspended ? "ACCOUNT_SUSPENDED" : "ACCOUNT_RESTORED",
      actorId: actor.id,
      targetId: target.id,
      metadata: JSON.stringify({ actorRole: actor.role, targetEmail: target.email }),
    },
  });

  return NextResponse.json({ ok: true, id: updated.id, isSuspended: updated.isSuspended });
}
