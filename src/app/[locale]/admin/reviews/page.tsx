import { redirect } from "next/navigation";
import Link from "next/link";
import { Car, FileText, Inbox, Store, Users, Wrench, Star, LogOut } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import AdminReviewActions from "@/components/AdminReviewActions";

export default async function AdminReviewsPage() {
  if (!(await verifySession())) redirect("/admin/login");

  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true, email: true, verified: true, phoneVerified: true } },
      vehicle: { select: { title: true, slug: true } },
    },
  });

  const pending = reviews.filter((r) => r.status === "under_review").length;
  const published = reviews.filter((r) => r.status === "published").length;

  const statusBadge: Record<string, { label: string; cls: string }> = {
    published: { label: "Published", cls: "bg-green-100 text-green-800" },
    under_review: { label: "Under review", cls: "bg-yellow-100 text-yellow-800" },
    removed: { label: "Removed", cls: "bg-red-100 text-red-800" },
  };

  return (
    <AdminLayout title="Reviews">
      <p className="text-sm text-[var(--color-text-secondary)] mb-4">
        {pending} pending · {published} published · {reviews.length} total
      </p>
      <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
        <div className="divide-y divide-[var(--color-border)]">
          {reviews.length === 0 ? (
            <p className="p-6 text-sm text-[var(--color-text-secondary)]">No reviews yet.</p>
          ) : reviews.map((r) => {
            const badge = statusBadge[r.status] ?? statusBadge.under_review;
            return (
              <div key={r.id} className="p-4 px-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.cls}`}>{badge.label}</span>
                      <span className="text-sm font-medium text-[var(--color-text-primary)]">
                        {r.author.name || r.author.email}
                      </span>
                      {!r.author.verified && !r.author.phoneVerified && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">unverified</span>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 my-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} size={13} className={n <= r.rating ? "fill-[var(--color-accent)] text-[var(--color-accent)]" : "text-[var(--color-border)]"} />
                      ))}
                      <span className="text-xs text-[var(--color-text-secondary)] ml-2">
                        {r.author.email} · {new Date(r.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-line max-w-2xl">{r.text}</p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                      on <Link href={`/vehicles/${r.vehicle.slug}`} className="underline hover:text-[var(--color-accent)]">{r.vehicle.title || r.vehicle.slug}</Link>
                    </p>
                    {r.providerContext && (
                      <p className="text-xs text-[var(--color-ink)] mt-2 bg-[var(--color-accent)]/10 rounded px-2 py-1">
                        Provider context (admin-only): {r.providerContext}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <AdminReviewActions id={r.id} status={r.status} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}

function AdminLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Sidebar active="reviews" />
      <div className="ml-56 p-8">
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold mb-8">{title}</h1>
        {children}
      </div>
    </div>
  );
}

function Sidebar({ active }: { active: string }) {
  const nav = [
    { href: "/admin", label: "Dashboard", icon: <Car size={16} />, key: "dashboard" },
    { href: "/admin/submissions", label: "Submissions", icon: <FileText size={16} />, key: "submissions" },
    { href: "/admin/vehicles", label: "Vehicles", icon: <Car size={16} />, key: "vehicles" },
    { href: "/admin/inquiries", label: "Inquiries", icon: <Inbox size={16} />, key: "inquiries" },
    { href: "/admin/reviews", label: "Reviews", icon: <Star size={16} />, key: "reviews" },
    { href: "/admin/dealers", label: "Dealers", icon: <Store size={16} />, key: "dealers" },
    { href: "/admin/users", label: "Users", icon: <Users size={16} />, key: "users" },
    { href: "/admin/services", label: "Services", icon: <Wrench size={16} />, key: "services" },
  ];
  return (
    <div className="fixed left-0 top-0 bottom-0 w-56 bg-[var(--color-surface-dark)] text-[var(--color-text-inverse)] p-6">
      <Link href="/admin" className="font-[family-name:var(--font-cormorant)] text-xl font-semibold mb-8 block">Fidelis Auto</Link>
      <nav className="space-y-2">
        {nav.map((n) => (
          <SidebarLink key={n.key} href={n.href} icon={n.icon} label={n.label} active={active === n.key} />
        ))}
      </nav>
      <div className="absolute bottom-6 left-6 right-6">
        <Link href="/" className="text-xs text-white/40 hover:text-white block mb-2">View Site</Link>
        <Link href="/admin/logout" className="flex items-center gap-1 text-xs text-white/40 hover:text-white"><LogOut size={12} /> Logout</Link>
      </div>
    </div>
  );
}

function SidebarLink({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  const base = "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors";
  return (
    <Link href={href} className={`${base} ${active ? "bg-white/10 text-white font-medium" : "text-white/70 hover:text-white hover:bg-white/5"}`}>
      {icon} {label}
    </Link>
  );
}