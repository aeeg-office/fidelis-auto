import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth";

// GET /api/admin/reviews — list all reviews for moderation (guard: admin session)
export async function GET() {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;

  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true, email: true, verified: true, phoneVerified: true } },
      vehicle: { select: { id: true, title: true, slug: true } },
    },
  });

  return NextResponse.json(reviews);
}