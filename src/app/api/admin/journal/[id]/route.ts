import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { can } from "@/lib/authorization";

// PATCH /api/admin/journal/[id] — publish / unpublish (guard: seo:manage)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const actor = await getCurrentUser();
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(actor.role, "seo:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const existing = await prisma.journalEntry.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Journal entry not found" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (typeof body.publish === "boolean") {
    data.isPublished = body.publish;
    data.publishedAt = body.publish ? (existing.publishedAt ?? new Date()) : existing.publishedAt;
  }
  for (const field of ["title", "excerpt", "contentEn", "contentAr", "category", "coverImage", "author"] as const) {
    if (body[field] !== undefined) data[field] = body[field] === "" ? null : body[field];
  }

  const updated = await prisma.journalEntry.update({ where: { id }, data });
  return NextResponse.json({ ok: true, id: updated.id, isPublished: updated.isPublished });
}

// DELETE /api/admin/journal/[id] — remove an entry (guard: seo:manage)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const actor = await getCurrentUser();
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(actor.role, "seo:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const existing = await prisma.journalEntry.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Journal entry not found" }, { status: 404 });
  await prisma.journalEntry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}