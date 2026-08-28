import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { Car, FileText, Inbox, Users, Store, Wrench, History, LogOut } from "lucide-react";
import AdminUserRole from "@/components/AdminUserRole";

export default async function AdminUsersPage() {
  if (!(await verifySession())) redirect("/admin/login");

  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, role: true, verified: true, createdAt: true,
      _count: { select: { listingRequests: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminLayout title="Users">
      <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
        <div className="divide-y divide-[var(--color-border)]">
          {users.length === 0 ? (
            <p className="p-6 text-sm text-[var(--color-text-secondary)]">No users yet.</p>
          ) : users.map((u) => (
            <div key={u.id} className="p-4 px-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{u.name || "—"}</p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">{u.email}</p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    Joined {new Date(u.createdAt).toLocaleString()} · {u._count.listingRequests} submission(s) · {u.verified ? "Verified" : "Not verified"}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${roleClass(u.role)}`}>{u.role}</span>
                  <AdminUserRole id={u.id} currentRole={u.role} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

function AdminLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Sidebar active="users" />
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
    { href: "/admin/dealers", label: "Dealers", icon: <Store size={16} />, key: "dealers" },
    { href: "/admin/users", label: "Users", icon: <Users size={16} />, key: "users" },
    { href: "/admin/services", label: "Services", icon: <Wrench size={16} />, key: "services" },
    { href: "/admin/activity", label: "Activity", icon: <History size={16} />, key: "activity" },
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

function roleClass(role: string) {
  switch (role) {
    case "SUPER_ADMIN": case "ADMINISTRATOR": return "bg-purple-100 text-purple-800";
    case "DEALER": return "bg-blue-100 text-blue-800";
    case "SELLER": return "bg-green-100 text-green-800";
    default: return "bg-gray-100 text-gray-800";
  }
}