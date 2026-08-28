import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { can, type AccountRole } from "@/lib/authorization";
import { normalizeListingSubmission } from "@/lib/listing-submission";
import { getCurrentUser } from "@/lib/user-auth";
import { scanAdText } from "@/lib/ad-scanner";
import { autoPublish } from "@/lib/auto-publish";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to submit a vehicle." }, { status: 401 });
  }
  if (!can(user.role as AccountRole, "listing:create")) {
    return NextResponse.json({ error: "Your account is not permitted to submit listings." }, { status: 403 });
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

    // Automated moderation: if the ad text is clean, approve AND publish immediately.
    // Note: the seller's own `phone`/`email` contact fields are legitimate and already
    // validated upstream — we scan only the free-text ad body so the phone/email rules
    // catch off-platform harvesting in prose, not the seller's own contact info.
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

    if (scan.clean) {
      try {
        const published = await autoPublish(submission.value, listing.id);
        return NextResponse.json(
          {
            ok: true,
            id: listing.id,
            autoApproved: true,
            vehicleId: published.vehicleId,
            violations: [],
          },
          { status: 201 },
        );
      } catch (publishError) {
        console.error("Auto-publish failed for listing", listing.id, publishError);
        // Fall back to pending so nothing is lost; admin can publish manually.
        return NextResponse.json(
          {
            ok: true,
            id: listing.id,
            autoApproved: false,
            violation: "Auto-publish error; sent to moderation.",
            violations: [],
          },
          { status: 201 },
        );
      }
    }

    // Ad text violations found — route to manual moderation.
    return NextResponse.json(
      {
        ok: true,
        id: listing.id,
        autoApproved: false,
        violations: scan.violations,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
