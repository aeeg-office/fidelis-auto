import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { can, type AccountRole } from "@/lib/authorization";
import { normalizeListingSubmission } from "@/lib/listing-submission";
import { getCurrentUser } from "@/lib/user-auth";
import { scanAdText } from "@/lib/ad-scanner";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to submit a vehicle." }, { status: 401 });
  }
  if (!can(user.role as AccountRole, "listing:create")) {
    return NextResponse.json({ error: "Your account is not permitted to submit listings." }, { status: 403 });
  }
  // WS10 warning-only policy: a suspended account cannot submit listings.
  if (user.isSuspended) {
    return NextResponse.json(
      {
        error: "Your account is suspended. Please contact support.",
        errorAr: "تم تعليق حسابك. يرجى التواصل مع الدعم.",
      },
      { status: 403 }
    );
  }

  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "A valid submission is required." }, { status: 400 });
    }

    const submitted = body as Record<string, unknown>;
    const submission = normalizeListingSubmission({ ...submitted, name: user.name, email: user.email }, user.id);
    if (!submission.ok) return NextResponse.json({ error: submission.error }, { status: 400 });

    const listing = await prisma.listingRequest.create({ data: submission.value });

    // Moderation: every submission is routed to the admin moderation queue.
    // No submission auto-publishes — an admin must approve it (FID-AUD-202).
    // The ad-text scanner still runs to surface violations to the moderator, but
    // they never gate publication.
    const scan = scanAdText({
      make: submission.value.make,
      model: submission.value.model,
      trim: submission.value.trim,
      description: submission.value.description,
      city: submission.value.city,
      state: submission.value.state,
      country: submission.value.country,
      zipCode: submission.value.zipCode,
    });

    return NextResponse.json(
      {
        ok: true,
        id: listing.id,
        autoApproved: false,
        pendingModeration: true,
        violations: scan.violations,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
