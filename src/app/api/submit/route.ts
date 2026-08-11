import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { can, type AccountRole } from "@/lib/authorization";
import { normalizeListingSubmission } from "@/lib/listing-submission";
import { getCurrentUser } from "@/lib/user-auth";

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

    const submission = normalizeListingSubmission(body as Record<string, unknown>, user.id);
    if (!submission.ok) return NextResponse.json({ error: submission.error }, { status: 400 });

    const listing = await prisma.listingRequest.create({ data: submission.value });
    return NextResponse.json({ ok: true, id: listing.id }, { status: 201 });
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
