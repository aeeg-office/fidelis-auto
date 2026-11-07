import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth";
import { sanitizeSlug, toInt } from "@/lib/collections";

// GET /api/admin/collections — list all collections with vehicle counts
export async function GET() {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;

  const collections = await prisma.collection.findMany({
    include: { _count: { select: { vehicles: true } } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(collections);
}

// POST /api/admin/collections — create a collection
export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!body.titleEn || typeof body.titleEn !== "string" || !body.titleEn.trim()) {
    return NextResponse.json({ error: "English title is required." }, { status: 400 });
  }
  const slugResult = sanitizeSlug(body.slug ?? "");
  if (!slugResult.ok) return NextResponse.json({ error: slugResult.error }, { status: 400 });

  try {
    const collection = await prisma.collection.create({
      data: {
        slug: slugResult.slug,
        titleEn: body.titleEn.trim(),
        titleAr: body.titleAr ? String(body.titleAr).trim() : null,
        descriptionEn: body.descriptionEn ? String(body.descriptionEn).trim() : null,
        descriptionAr: body.descriptionAr ? String(body.descriptionAr).trim() : null,
        coverImage: body.coverImage ? String(body.coverImage).trim() : null,
        isVisible: body.isVisible !== false,
        sortOrder: toInt(body.sortOrder),
      },
      include: { _count: { select: { vehicles: true } } },
    });
    return NextResponse.json(collection, { status: 201 });
  } catch (err) {
    // P2002 = unique constraint (slug)
    if ((err as { code?: string })?.code === "P2002") {
      return NextResponse.json({ error: "A collection with this slug already exists." }, { status: 409 });
    }
    throw err;
  }
}
