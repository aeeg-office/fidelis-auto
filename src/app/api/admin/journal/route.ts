import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { can } from "@/lib/authorization";
import { getCurrentUser } from "@/lib/user-auth";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET /api/admin/journal — list all journal entries (guard: admin session)
export async function GET() {
  if (!(await verifySession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const entries = await prisma.journalEntry.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(entries);
}

// POST /api/admin/journal — create a journal entry (guard: seo:manage)
export async function POST(request: Request) {
  const actor = await getCurrentUser();
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(actor.role, "seo:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const { title, excerpt, contentEn, author } = body || {};
  if (!title || !contentEn) {
    return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
  }
  let slug = slugify(title);
  const existing = await prisma.journalEntry.findUnique({ where: { slug } });
  let i = 2;
  while (existing) {
    slug = `${slugify(title)}-${i++}`;
    const again = await prisma.journalEntry.findUnique({ where: { slug } });
    if (!again) break;
  }

  const entry = await prisma.journalEntry.create({
    data: {
      slug,
      title,
      excerpt: excerpt || null,
      contentEn,
      author: author || "Fidelis Auto",
      isPublished: false,
    },
  });
  return NextResponse.json({ ok: true, id: entry.id, slug: entry.slug }, { status: 201 });
}