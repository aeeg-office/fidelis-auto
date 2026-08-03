import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function GET() {
  if (!(await verifySession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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