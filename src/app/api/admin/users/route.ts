import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth";

// GET /api/admin/users — list users with listing counts (guard: user:manage; non-admins get 403)
export async function GET() {
  const guard = await requireAdminApi("user:manage");
  if (guard.response) return guard.response;

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      verified: true,
      createdAt: true,
      _count: { select: { listingRequests: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}
