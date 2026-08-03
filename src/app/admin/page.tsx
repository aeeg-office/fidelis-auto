import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { Car, FileText, MessageSquare, Plus, Eye, Check, X } from "lucide-react";
import { cookies } from "next/headers";

export default async function AdminDashboard() {
  const isAuth = await verifySession();
  if (!isAuth) redirect("/admin/login");

  const [pendingSubmissions, totalVehicles, totalInquiries] = await Promise.all([
    prisma.listingRequest.count({ where: { status: "pending" } }),
    prisma.vehicle.count(),
    prisma.inquiry.count(),
  ]);

  const submissions = await prisma.listingRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-56 bg-[var(--color-surface-dark)] text-[var(--color-text-inverse)] p-6">
        <Link href="/admin" className="font-[family-name:var(--font-cormorant)] text-xl font-semibold mb-8 block">
          Fidelis Auto
        </Link>
        <nav className="space-y-2">
          <a href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/10 text-sm font-medium">
            <Eye size={16} /> Dashboard
          </a>
          <a href="/admin/submissions" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-white/70 hover:text-white transition-colors">
            <FileText size={16} /> Submissions
          </a>
          <a href="/admin/vehicles" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-white/70 hover:text-white transition-colors">
            <Car size={16} /> Vehicles
          </a>
          <a href="/admin/inquiries" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-white/70 hover:text-white transition-colors">
            <MessageSquare size={16} /> Inquiries
          </a>
        </nav>
        <div className="absolute bottom-6 left-6 right-6">
          <a href="/admin/logout" className="text-xs text-white/40 hover:text-white">Logout</a>
        </div>
      </div>

      {/* Main */}
      <div className="ml-56 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold">Dashboard</h1>
          <Link href="/admin/vehicles/new" className="flex items-center gap-2 bg-[var(--color-accent)] text-[var(--color-surface-dark)] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-accent-hover)]">
            <Plus size={16} /> Add Vehicle
          </Link>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6">
            <p className="text-sm text-[var(--color-text-secondary)] mb-1">Pending Submissions</p>
            <p className="text-3xl font-semibold text-[var(--color-text-primary)]">{pendingSubmissions}</p>
          </div>
          <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6">
            <p className="text-sm text-[var(--color-text-secondary)] mb-1">Live Vehicles</p>
            <p className="text-3xl font-semibold text-[var(--color-text-primary)]">{totalVehicles}</p>
          </div>
          <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6">
            <p className="text-sm text-[var(--color-text-secondary)] mb-1">Inquiries</p>
            <p className="text-3xl font-semibold text-[var(--color-text-primary)]">{totalInquiries}</p>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
          <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
            <h2 className="font-semibold text-[var(--color-text-primary)]">Recent Submissions</h2>
            <Link href="/admin/submissions" className="text-sm text-[var(--color-accent)] hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {submissions.length === 0 ? (
              <p className="p-6 text-sm text-[var(--color-text-secondary)]">No submissions yet.</p>
            ) : (
              submissions.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-4 px-6">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{s.year} {s.make} {s.model}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">{s.name} &middot; {new Date(s.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    s.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                    s.status === "approved" ? "bg-green-100 text-green-800" :
                    "bg-red-100 text-red-800"
                  }`}>{s.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}