import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { isVerifiedUser, parseReviewInput } from "@/lib/review-validation";

// ─── GET /api/vehicles/[slug]/reviews — public: published reviews only ──
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const vehicle = await prisma.vehicle.findUnique({
      where: { slug, isPublished: true },
      select: { id: true },
    });
    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found." }, { status: 404 });
    }

    const reviews = await prisma.review.findMany({
      where: { vehicleId: vehicle.id, status: "published" },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json(
      reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        text: r.text,
        authorName: r.author.name || [r.author.firstName, r.author.lastName].filter(Boolean).join(" ") || "Verified user",
        createdAt: r.createdAt.toISOString(),
      }))
    );
  } catch {
    return NextResponse.json({ error: "Could not load reviews." }, { status: 500 });
  }
}

// ─── POST /api/vehicles/[slug]/reviews — verified users only; created under_review ──
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to write a review." }, { status: 401 });
    }
    // Spec P2 trust: reviews only from verified users (email OR phone verified).
    if (!isVerifiedUser(user)) {
      return NextResponse.json(
        { error: "Please verify your account (email or phone) before writing a review." },
        { status: 403 }
      );
    }

    const { slug } = await params;
    const vehicle = await prisma.vehicle.findUnique({
      where: { slug, isPublished: true },
      select: { id: true },
    });
    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found." }, { status: 404 });
    }

    const body = await request.json().catch(() => null);
    const parsed = parseReviewInput(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    // One review per (user, vehicle): updating an existing one is not in scope —
    // a repeat submission is rejected so a single user cannot flood a listing.
    const existing = await prisma.review.findFirst({
      where: { vehicleId: vehicle.id, authorId: user.id },
      select: { id: true, status: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "You have already reviewed this vehicle." },
        { status: 409 }
      );
    }

    const review = await prisma.review.create({
      data: {
        vehicleId: vehicle.id,
        authorId: user.id,
        rating: parsed.data.rating,
        text: parsed.data.text,
        providerContext: parsed.data.providerContext,
        status: "under_review",
      },
    });

    return NextResponse.json(
      { ok: true, id: review.id, status: review.status },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Could not submit your review." }, { status: 500 });
  }
}
