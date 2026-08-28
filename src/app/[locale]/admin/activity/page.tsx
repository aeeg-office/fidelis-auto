import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { Car, FileText, Inbox, Users, Store, Wrench, History, LogOut } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminActivityPage() {
  if (!(await verifySession())) redirect("/admin/login");

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const actorIds = [...new Set(logs.map((l) => l.actorId ?? "").filter(Boolean))];
  const actors = await prisma.user.findMany({
    where: { id: { in: actorIds } },
    select: { id: true, name: true, email: true },
  });
  const actorMap = new Map(actors.map((a) => [a.id, a.name || a.email]));

  // Resolve listing-request targets from metadata (polymorphic targetId not linkable on the model).
  const targetReqIds = [
    ...new Set(
      logs
        .flatMap((l) => {
          if (!l.metadata) return [];
          try {
            const m = JSON.parse(l.metadata);
            return m?.listingRequestId ? [m.listingRequestId as string] : [];
          } catch {
            return [];
          }
        })
        .filter(Boolean) as string[],
    ),
  ];
  const targetRequests = await prisma.listingRequest.findMany({
    where: { id: { in: targetReqIds } },
    select: { id: true, year: true, make: true, model: true },
  });
  const targetMap = new Map(targetRequests.map((r) => [r.id, `${r.year} ${r.make} ${r.model}`]));

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Sidebar active="activity" />
      <div className="ml-56 p-8">
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold mb-8">Activity Log</h1>
        <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
          {logs.length === 0 ? (
            <p className="p-6 text-sm text-[var(--color-text-secondary)]">No moderation activity recorded yet.</p>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {logs.map((l) => {
                let meta: Record<string, unknown> | string | null = null;
                if (l.metadata) {
                  try {
                    meta = JSON.parse(l.metadata);
                  } catch {
                    meta = l.metadata;
                  }
                }
                let targetLabel = targetMap.get(l.targetId ?? "") ?? null;
                if (!targetLabel && meta && typeof meta === "object" && !Array.isArray(meta) && meta.listingRequestId) {
                  targetLabel = targetMap.get(String(meta.listingRequestId)) ?? null;
                }
                return (
                  <div key={l.id} className="p-4 px-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${actionClass(l.action)}`}>
                            {readableAction(l.action)}
                          </span>
                          <span className="text-sm text-[var(--color-text-primary)]">
                            {actorMap.get(l.actorId ?? "") ?? (l.actorId ? "Unknown actor" : "System")}
                          </span>
                          {targetLabel ? (
                            <span className="text-xs text-[var(--color-text-secondary)]">on {targetLabel}</span>
                          ) : null}
                        </div>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                          {new Date(l.createdAt).toLocaleString()}
                        </p>
                        {meta ? (
                          <pre className="mt-2 text-[11px] text-[var(--color-text-secondary)] whitespace-pre-wrap break-all bg-black/5 rounded p-2 overflow-x-auto">
                            {JSON.stringify(meta, null, 2)}
                          </pre>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function actionClass(action: string) {
  if (action.includes("APPROVED") || action.includes("VERIFIED")) return "bg-green-100 text-green-800";
  if (action.includes("REJECTED") || action.includes("DELETE") || action.includes("REMOVE")) return "bg-red-100 text-red-800";
  if (action.includes("ROLE") || action.includes("UPDATE")) return "bg-blue-100 text-blue-800";
  return "bg-gray-100 text-gray-800";
}

function readableAction(action: string) {
  return action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
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