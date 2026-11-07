import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth";

// GET /api/admin/dealers — list dealer applications with owner info (guard: dealer:manage; non-admins get 403)
export async function GET() {
  const guard = await requireAdminApi("dealer:manage");
  if (guard.response) return guard.response;

  const dealers = await prisma.dealerProfile.findMany({
    include: {
      owner: { select: { id: true, name: true, email: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(dealers);
}
