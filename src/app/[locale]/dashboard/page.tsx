import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { Car, Plus, ArrowRight, Calendar, CheckCircle, Clock, XCircle } from "lucide-react";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/dashboard");

  const [submissions, totalSubmissions, approvedCount, pendingCount, rejectedCount, myVehicles] = await Promise.all([
    prisma.listingRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.listingRequest.count({ where: { userId: user.id } }),
    prisma.listingRequest.count({ where: { userId: user.id, status: "approved" } }),
    prisma.listingRequest.count({ where: { userId: user.id, status: "pending" } }),
    prisma.listingRequest.count({ where: { userId: user.id, status: "rejected" } }),
    prisma.vehicle.findMany({
      where: { ownerId: user.id, isPublished: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  function statusBadge(status: string) {
    const base = "text-xs px-2.5 py-1 rounded-full font-medium";
    switch (status) {
      case "approved":
        return <span className={`${base} bg-green-100 text-green-800`}>Approved</span>;
      case "pending":
        return <span className={`${base} bg-yellow-100 text-yellow-800`}>Pending Review</span>;
      case "rejected":
        return <span className={`${base} bg-red-100 text-red-800`}>Rejected</span>;
      default:
        return <span className={`${base} bg-gray-100 text-gray-800`}>{status}</span>;
    }
  }

  function parsePhotos(photoUrls: string | null): string[] {
    if (!photoUrls) return [];
    try {
      const arr = JSON.parse(photoUrls);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  return (
    <div className="container-page py-16 md:py-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-semibold text-[var(--color-text-primary)]">
              My Dashboard
            </h1>
            <p className="text-[var(--color-text-secondary)] mt-1">
              Welcome back, {user.name}
            </p>
          </div>
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 bg-[var(--color-accent)] text-[var(--color-surface-dark)] px-5 py-2.5 rounded-lg font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            <Plus size={18} /> Submit a Vehicle
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                <Car size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{totalSubmissions}</p>
            <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider mt-1">Total Submissions</p>
          </div>
          <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-50 text-green-700">
                <CheckCircle size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{approvedCount}</p>
            <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider mt-1">Approved</p>
          </div>
          <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-yellow-50 text-yellow-700">
                <Clock size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{pendingCount}</p>
            <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider mt-1">Pending</p>
          </div>
          <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-red-50 text-red-700">
                <XCircle size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{rejectedCount}</p>
            <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider mt-1">Rejected</p>
          </div>
        </div>

        {/* Submissions List */}
        <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
          <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
            <h2 className="font-semibold text-[var(--color-text-primary)] text-lg">My Vehicle Submissions</h2>
          </div>

          {submissions.length === 0 ? (
            <div className="p-12 text-center">
              <Car size={48} className="mx-auto text-[var(--color-text-secondary)]/30 mb-4" />
              <h3 className="font-[family-name:var(--font-cormorant)] text-xl font-semibold text-[var(--color-text-primary)] mb-2">
                No submissions yet
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] mb-6 max-w-sm mx-auto">
                Submit your first vehicle for review and our team will evaluate it.
              </p>
              <Link
                href="/submit"
                className="inline-flex items-center gap-2 bg-[var(--color-accent)] text-[var(--color-surface-dark)] px-5 py-2.5 rounded-lg font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
              >
                <Plus size={18} /> Submit a Vehicle
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {submissions.map((s) => {
                const photos = parsePhotos(s.photoUrls);
                return (
                  <div key={s.id} className="p-4 px-6 flex items-start gap-4 hover:bg-[var(--color-bg)]/50 transition-colors">
                    {/* Thumbnail */}
                    <div className="w-20 h-16 rounded-lg bg-[var(--color-surface-dark)] flex items-center justify-center shrink-0 overflow-hidden">
                      {photos.length > 0 ? (
                        <img
                          src={photos[0]}
                          alt={`${s.year} ${s.make} ${s.model}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Car size={24} className="text-[var(--color-text-inverse)]/30" />
                      )}
                    </div>
                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                        {s.year} {s.make} {s.model}{s.trim ? ` ${s.trim}` : ""}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-text-secondary)]">
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(s.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {s.description && (
                        <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 line-clamp-1">{s.description}</p>
                      )}
                    </div>
                    {/* Status */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {statusBadge(s.status)}
                      <Link href={`/my-listing/${s.id}`} className="text-xs text-[var(--color-accent)] hover:underline">Edit</Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* My Published Listings */}
        {myVehicles.length > 0 && (
          <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] mt-8">
            <div className="p-6 border-b border-[var(--color-border)]">
              <h2 className="font-semibold text-[var(--color-text-primary)] text-lg">My Published Listings</h2>
            </div>
            <div className="divide-y divide-[var(--color-border)]">
              {myVehicles.map((v) => (
                <div key={v.id} className="p-4 px-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{v.title}</p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Published</p>
                  </div>
                  <Link href={`/my-vehicle/${v.id}`} className="text-xs text-[var(--color-accent)] hover:underline">Edit</Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Link to browse vehicles */}
        <div className="mt-8 text-center">
          <Link
            href="/vehicles"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
          >
            Browse the Collection <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}