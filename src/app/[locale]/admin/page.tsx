import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { Car, FileText, MessageSquare, Plus, Eye, Star, Store, Users, Wrench } from "lucide-react";
import AdminSubmissionActions from "@/components/AdminSubmissionActions";

type AdminStats = {
  verifiedUsers: number;
  listings: number;
  pendingSubmissions: number;
  approved: number;
  rejected: number;
  inquiries: number;
  dealers: number;
};

const EMPTY_STATS: AdminStats = {
  verifiedUsers: 0,
  listings: 0,
  pendingSubmissions: 0,
  approved: 0,
  rejected: 0,
  inquiries: 0,
  dealers: 0,
};

// Pulls the report counts from GET /api/admin/stats so the dashboard renders
// the same numbers the admin report API serves (verified users + listing volume).
async function fetchAdminStats(): Promise<AdminStats> {
  try {
    const h = await headers();
    const host = h.get("host") ?? "localhost:3000";
    const proto = h.get("x-forwarded-proto") ?? "http";
    const res = await fetch(`${proto}://${host}/api/admin/stats`, {
      headers: { cookie: (await cookies()).toString() },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`stats API responded ${res.status}`);
    return (await res.json()) as AdminStats;
  } catch {
    return EMPTY_STATS;
  }
}

export default async function AdminDashboard() {
  const isAuth = await verifySession();
  if (!isAuth) redirect("/admin/login");

  const [stats, submissions, featuredVehicles] = await Promise.all([
    fetchAdminStats(),
    prisma.listingRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.vehicle.findMany({
      where: { isFeatured: true },
      select: { id: true, year: true, make: true, model: true, slug: true, isFeatured: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-56 bg-[var(--color-surface-dark)] text-[var(--color-text-inverse)] p-6">
        <Link href="/admin" className="font-[family-name:var(--font-cormorant)] text-xl font-semibold mb-8 block">
          Fidelis Auto
        </Link>
        <nav className="space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/10 text-sm font-medium">
            <Eye size={16} /> Dashboard
          </Link>
          <Link href="/admin/submissions" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-white/70 hover:text-white transition-colors">
            <FileText size={16} /> Submissions
          </Link>
          <Link href="/admin/vehicles" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-white/70 hover:text-white transition-colors">
            <Car size={16} /> Vehicles
          </Link>
          <Link href="/admin/inquiries" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-white/70 hover:text-white transition-colors">
            <MessageSquare size={16} /> Inquiries
          </Link>
          <Link href="/admin/dealers" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-white/70 hover:text-white transition-colors">
            <Store size={16} /> Dealers
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-white/70 hover:text-white transition-colors">
            <Users size={16} /> Users
          </Link>
          <Link href="/admin/services" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-white/70 hover:text-white transition-colors">
            <Wrench size={16} /> Services
          </Link>
        </nav>
        <div className="absolute bottom-6 left-6 right-6">
          <Link href="/" className="text-xs text-white/40 hover:text-white block mb-2">View Site</Link>
          <Link href="/admin/logout" className="text-xs text-white/40 hover:text-white">Logout</Link>
        </div>
      </div>

      {/* Main */}
      <div className="ml-56 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold">Dashboard</h1>
          <Link href="/admin/vehicles/new" className="flex items-center gap-2 bg-[var(--color-ink)] text-[var(--color-text-inverse)] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-ink-hover)]">
            <Plus size={16} /> Add Vehicle
          </Link>
        </div>

        {/* Stats (from /api/admin/stats) */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6">
            <p className="text-sm text-[var(--color-text-secondary)] mb-1">Verified Users</p>
            <p className="text-3xl font-semibold text-[var(--color-text-primary)]">{stats.verifiedUsers}</p>
          </div>
          <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6">
            <p className="text-sm text-[var(--color-text-secondary)] mb-1">Listings</p>
            <p className="text-3xl font-semibold text-[var(--color-text-primary)]">{stats.listings}</p>
          </div>
          <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6">
            <p className="text-sm text-[var(--color-text-secondary)] mb-1">Pending Submissions</p>
            <p className="text-3xl font-semibold text-yellow-600">{stats.pendingSubmissions}</p>
          </div>
          <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6">
            <p className="text-sm text-[var(--color-text-secondary)] mb-1">Approved</p>
            <p className="text-3xl font-semibold text-green-600">{stats.approved}</p>
          </div>
          <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6">
            <p className="text-sm text-[var(--color-text-secondary)] mb-1">Rejected</p>
            <p className="text-3xl font-semibold text-red-600">{stats.rejected}</p>
          </div>
          <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6">
            <p className="text-sm text-[var(--color-text-secondary)] mb-1">Inquiries</p>
            <p className="text-3xl font-semibold text-[var(--color-text-primary)]">{stats.inquiries}</p>
          </div>
        </div>

        {/* Recent Submissions with Actions */}
        <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] mb-8">
          <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
            <h2 className="font-semibold text-[var(--color-text-primary)]">Recent Submissions</h2>
            <Link href="/admin/submissions" className="text-sm text-[var(--color-accent)] hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {submissions.length === 0 ? (
              <p className="p-6 text-sm text-[var(--color-text-secondary)]">No submissions yet.</p>
            ) : (
              submissions.map((s) => (
                <AdminSubmissionRow key={s.id} submission={s} />
              ))
            )}
          </div>
        </div>

        {/* Featured Vehicles */}
        <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
          <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
            <h2 className="font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
              <Star size={16} className="text-[var(--color-accent)]" /> Featured Vehicles
            </h2>
            <Link href="/admin/vehicles" className="text-sm text-[var(--color-accent)] hover:underline">Manage Vehicles</Link>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {featuredVehicles.length === 0 ? (
              <p className="p-6 text-sm text-[var(--color-text-secondary)]">No featured vehicles. Toggle featured status from the Vehicles page.</p>
            ) : (
              featuredVehicles.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-4 px-6">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{v.year} {v.make} {v.model}</p>
                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/30">
                    <Star size={12} className="inline mr-1" />Featured
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Client Action Buttons ──────────────────────

function AdminSubmissionRow({ submission: s }: { submission: { id: string; year: number; make: string; model: string; trim: string | null; name: string; email: string; phone: string | null; description: string | null; mileage: number | null; exteriorColor: string | null; interiorColor: string | null; engine: string | null; transmission: string | null; status: string; createdAt: Date } }) {
  return (
    <div className="p-4 px-6 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-[var(--color-text-primary)]">{s.year} {s.make} {s.model}{s.trim ? ` ${s.trim}` : ""}</p>
        <p className="text-xs text-[var(--color-text-secondary)] mt-1">{s.name} &lt;{s.email}&gt;{s.phone ? ` | ${s.phone}` : ""}</p>
        {s.mileage && <p className="text-xs text-[var(--color-text-secondary)] mt-1">{s.mileage.toLocaleString()} mi | {s.exteriorColor || "?"} ext</p>}
        <p className="text-xs text-[var(--color-text-secondary)] mt-1">Submitted {new Date(s.createdAt).toLocaleString()}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-4">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          s.status === "pending" ? "bg-yellow-100 text-yellow-800" :
          s.status === "approved" ? "bg-green-100 text-green-800" :
          "bg-red-100 text-red-800"
        }`}>{s.status}</span>
        {s.status === "pending" && (
          <AdminSubmissionActions id={s.id} />
        )}
      </div>
    </div>
  );
}
