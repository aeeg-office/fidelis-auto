import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth";

// GET /api/admin/services — list service listings (guard: service:manage; non-admins get 403)
export async function GET() {
  const guard = await requireAdminApi("service:manage");
  if (guard.response) return guard.response;

  const services = await prisma.serviceListing.findMany({
    include: {
      owner: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(services);
}
