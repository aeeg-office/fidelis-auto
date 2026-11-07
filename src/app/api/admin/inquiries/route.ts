import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth";

// GET /api/admin/inquiries — list all inquiries (guard: admin session; non-admins get 403)
export async function GET() {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;

  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(inquiries);
}
