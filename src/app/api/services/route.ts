import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { can, type AccountRole } from "@/lib/authorization";
import { getCurrentUser } from "@/lib/user-auth";
import { normalizeServiceListing } from "@/lib/service-listing";

export async function GET() {
  const services = await prisma.serviceListing.findMany({
    where: { isPublished: true },
    select: { id: true, businessName: true, category: true, description: true, phone: true, website: true, city: true, country: true },
    orderBy: [{ category: "asc" }, { businessName: "asc" }],
  });
  return NextResponse.json(services);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role as AccountRole, "service:manage")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return NextResponse.json({ error: "A valid service listing is required." }, { status: 400 });
  const listing = normalizeServiceListing(payload as Record<string, unknown>);
  if (!listing.ok) return NextResponse.json({ error: listing.error }, { status: 400 });
  const service = await prisma.serviceListing.create({ data: { ...listing.value, ownerId: user.id } });
  return NextResponse.json({ ok: true, id: service.id, status: "pending" }, { status: 201 });
}
