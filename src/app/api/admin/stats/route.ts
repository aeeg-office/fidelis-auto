import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth";

/**
 * GET /api/admin/stats — admin report counts (guard: admin session; non-admins get 403).
 *
 * Tracks the Spec L report dimensions: verified-user count (`verifiedUsers`) and
 * listing volume (`listings`), alongside the supporting submission/inquiry totals
 * shown on the admin dashboard.
 */
export async function GET() {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;

  const [verifiedUsers, listings, pendingSubmissions, approved, rejected, inquiries, dealers] =
    await Promise.all([
      prisma.user.count({ where: { verified: true } }),
      prisma.vehicle.count(),
      prisma.listingRequest.count({ where: { status: "pending" } }),
      prisma.listingRequest.count({ where: { status: "approved" } }),
      prisma.listingRequest.count({ where: { status: "rejected" } }),
      prisma.inquiry.count(),
      prisma.dealerProfile.count(),
    ]);

  return NextResponse.json({
    verifiedUsers,
    listings,
    pendingSubmissions,
    approved,
    rejected,
    inquiries,
    dealers,
  });
}
