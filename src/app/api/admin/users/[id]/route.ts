import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { can, canManageRole } from "@/lib/authorization";
import type { AccountRole } from "@/lib/authorization";

// PATCH /api/admin/users/[id] — change a user's role (guard: user:manage + role hierarchy)
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
  const role = body?.role as AccountRole | undefined;
  if (!role || !["BUYER", "SELLER", "DEALER", "ADMINISTRATOR", "SUPER_ADMIN"].includes(role)) {
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