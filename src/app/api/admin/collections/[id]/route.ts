import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth";
import { sanitizeSlug, toInt } from "@/lib/collections";

// PATCH /api/admin/collections/[id] — update a collection (fields or visibility toggle)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const existing = await prisma.collection.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Collection not found." }, { status: 404 });

  const data: {
    titleEn?: string;
    titleAr?: string | null;
    descriptionEn?: string | null;
    descriptionAr?: string | null;
    coverImage?: string | null;
    isVisible?: boolean;
    sortOrder?: number;
    slug?: string;
  } = {};

  if (body.titleEn !== undefined) {
    if (typeof body.titleEn !== "string" || !body.titleEn.trim()) {
      return NextResponse.json({ error: "English title is required." }, { status: 400 });
    }
    data.titleEn = body.titleEn.trim();
  }
  if (body.slug !== undefined) {
    const slugResult = sanitizeSlug(body.slug ?? "");
    if (!slugResult.ok) return NextResponse.json({ error: slugResult.error }, { status: 400 });
    data.slug = slugResult.slug;
  }
  if (body.titleAr !== undefined) data.titleAr = body.titleAr ? String(body.titleAr).trim() : null;
  if (body.descriptionEn !== undefined) data.descriptionEn = body.descriptionEn ? String(body.descriptionEn).trim() : null;
  if (body.descriptionAr !== undefined) data.descriptionAr = body.descriptionAr ? String(body.descriptionAr).trim() : null;
  if (body.coverImage !== undefined) data.coverImage = body.coverImage ? String(body.coverImage).trim() : null;
  if (body.isVisible !== undefined) data.isVisible = body.isVisible !== false;
  if (body.sortOrder !== undefined) data.sortOrder = toInt(body.sortOrder);

  try {
    const collection = await prisma.collection.update({
      where: { id },
      data,
      include: { _count: { select: { vehicles: true } } },
    });
    return NextResponse.json(collection);
  } catch (err) {
    if ((err as { code?: string })?.code === "P2002") {
      return NextResponse.json({ error: "A collection with this slug already exists." }, { status: 409 });
    }
    throw err;
  }
}

// DELETE /api/admin/collections/[id] — delete a collection (join rows cascade)
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;

  const { id } = await params;
  const existing = await prisma.collection.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Collection not found." }, { status: 404 });

  await prisma.collection.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}