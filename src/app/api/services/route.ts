import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { SERVICE_CATEGORIES } from "@/lib/fidelisTaxonomy";

// POST /api/services — submit a specialist service listing (guard: any authenticated user)
// New listings start unpublished and are approved by an admin in /admin/services.
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to submit a service." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const { businessName, category, description, phone, website, city, country } = body || {};
  if (!businessName || !category || !description) {
    return NextResponse.json({ error: "Business name, category, and description are required." }, { status: 400 });
  }
  const validCategory = SERVICE_CATEGORIES.some((c) => c.label === category);
  if (!validCategory) {
    const labels = SERVICE_CATEGORIES.map((c) => c.label).join(", ");
    return NextResponse.json({ error: `Invalid category. Choose one of: ${labels}` }, { status: 400 });
  }

  const listing = await prisma.serviceListing.create({
    data: {
      ownerId: user.id,
      businessName,
      category,
      description,
      phone: phone || null,
      website: website || null,
      city: city || null,
      country: country || null,
      isPublished: false,
    },
  });
  return NextResponse.json({ ok: true, id: listing.id, isPublished: false }, { status: 201 });
}