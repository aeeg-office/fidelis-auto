import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifySession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "approve" || action === "reject") {
      const listing = await prisma.listingRequest.update({
        where: { id },
        data: { status: action === "approve" ? "approved" : "rejected" },
      });
      return NextResponse.json({ ok: true, status: listing.status });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Submission update error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}