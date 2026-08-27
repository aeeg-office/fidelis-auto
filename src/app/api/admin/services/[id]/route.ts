import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { can } from "@/lib/authorization";

// PATCH /api/admin/services/[id] — publish / unpublish a service listing (guard: service:manage)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const actor = await getCurrentUser();
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(actor.role, "service:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const publish = typeof body?.publish === "boolean" ? body.publish : null;
  if (publish === null) return NextResponse.json({ error: "Missing publish flag" }, { status: 400 });

  const existing = await prisma.serviceListing.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Service listing not found" }, { status: 404 });

  const updated = await prisma.serviceListing.update({
    where: { id },
    data: { isPublished: publish },
  });
  return NextResponse.json({ ok: true, id: updated.id, isPublished: updated.isPublished });
}