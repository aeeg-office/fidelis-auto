import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { can, type AccountRole } from "@/lib/authorization";
import { normalizeListingSubmission } from "@/lib/listing-submission";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const listing = await prisma.listingRequest.findUnique({ where: { id } });
  if (!listing || listing.userId !== user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(listing);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role as AccountRole, "listing:create"))
    return NextResponse.json({ error: "Not permitted" }, { status: 403 });

  const { id } = await params;
  const existing = await prisma.listingRequest.findUnique({
    where: { id },
    select: { id: true, userId: true },
  });
  if (!existing || existing.userId !== user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body))
    return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const normalized = normalizeListingSubmission(
    { ...(body as Record<string, unknown>), name: user.name, email: user.email },
    user.id
  );
  if (!normalized.ok) return NextResponse.json({ error: normalized.error }, { status: 400 });

  const { userId: _userId, name: _name, email: _email, ...updates } = normalized.value;

  const listing = await prisma.listingRequest.update({
    where: { id },
    data: { ...updates, status: "pending" },
  });
  return NextResponse.json({ ok: true, id: listing.id, status: "pending" });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const existing = await prisma.listingRequest.findUnique({
    where: { id },
    select: { id: true, userId: true },
  });
  if (!existing || existing.userId !== user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.listingRequest.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
