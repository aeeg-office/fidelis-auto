import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { SERVICE_CATEGORIES } from "@/lib/fidelisTaxonomy";
import { SPECIALIST_TAGS, SERVICE_LANGUAGES } from "@/lib/service-listing";

// POST /api/services — submit a specialist service listing.
// Gate (WS11 L+): ANY verified user (email-verified, `user.verified`) may post a
// provider profile; new listings start unpublished and are approved by an admin
// in /admin/services (moderation pipeline).
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to submit a service." }, { status: 401 });
  }
  if (!user.verified) {
    return NextResponse.json({ error: "Verify your email to submit a service listing." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const { businessName, category, description, phone, website, city, country, specialties, languages, coverageArea, whatsapp } = body || {};
  if (!businessName || !category || !description) {
    return NextResponse.json({ error: "Business name, category, and description are required." }, { status: 400 });
  }
  const validCategory = SERVICE_CATEGORIES.some((c) => c.label === category);
  if (!validCategory) {
    const labels = SERVICE_CATEGORIES.map((c) => c.label).join(", ");
    return NextResponse.json({ error: `Invalid category. Choose one of: ${labels}` }, { status: 400 });
  }
  const rawTags = Array.isArray(specialties)
    ? (specialties as unknown[])
        .map((t) => (typeof t === "string" ? t.trim().slice(0, 40) : ""))
        .filter((t) => t.length > 0 && (SPECIALIST_TAGS as readonly string[]).includes(t))
        .slice(0, 12)
    : [];
  const validLanguages = SERVICE_LANGUAGES.includes(languages as (typeof SERVICE_LANGUAGES)[number]);
  if (languages && !validLanguages) {
    return NextResponse.json({ error: `Invalid languages. Choose one of: ${SERVICE_LANGUAGES.join(", ")}` }, { status: 400 });
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
      specialties: rawTags.length ? JSON.stringify(rawTags) : null,
      languages: validLanguages ? languages : null,
      coverageArea: coverageArea || null,
      whatsapp: whatsapp || null,
      isPublished: false,
    },
  });
  return NextResponse.json({ ok: true, id: listing.id, isPublished: false }, { status: 201 });
}
