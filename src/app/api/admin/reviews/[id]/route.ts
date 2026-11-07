import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth";

// PATCH /api/admin/reviews/[id] — set moderation status:
//   { status: "published" | "under_review" | "removed" }
// DELETE /api/admin/reviews/[id] — permanently remove a review.
// (guard: admin session; non-admins get 403)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;

  const { id } = await params;
  const existing = await prisma.review.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const status = body?.status;
  if (!["published", "under_review", "removed"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await prisma.review.update({ where: { id }, data: { status } });
  return NextResponse.json({ ok: true, status: updated.status });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;

  const { id } = await params;
  await prisma.review.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}