import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth";

// PATCH /api/admin/inquiries/[id] — mark read/unread
// DELETE /api/admin/inquiries/[id] — remove an inquiry
// (guard: admin session; non-admins get 403)
export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;

  const { id } = await params;
  const existing = await prisma.inquiry.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
  }
  const next = await prisma.inquiry.update({
    where: { id },
    data: { isRead: !existing.isRead },
  });
  return NextResponse.json({ ok: true, isRead: next.isRead });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;

  const { id } = await params;
  await prisma.inquiry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
