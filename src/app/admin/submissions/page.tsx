import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { Car, FileText, Plus, Check, X } from "lucide-react";
import type { ListingRequest } from "@prisma/client";

export default async function AdminSubmissionsPage() {
  if (!(await verifySession())) redirect("/admin/login");

  const submissions: ListingRequest[] = await prisma.listingRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminLayout title="Submissions">
      <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
        <div className="divide-y divide-[var(--color-border)]">
          {submissions.length === 0 ? (
            <p className="p-6 text-sm text-[var(--color-text-secondary)]">No submissions yet.</p>
          ) : submissions.map((s) => (
            <div key={s.id} className="p-4 px-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{s.year} {s.make} {s.model}{s.trim ? ` ${s.trim}` : ""}</p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">From: {s.name} &lt;{s.email}&gt;{s.phone ? ` | ${s.phone}` : ""}</p>
                  {s.description && <p className="text-sm text-[var(--color-text-secondary)] mt-2 max-w-lg">{s.description}</p>}
                  {s.mileage && <p className="text-xs text-[var(--color-text-secondary)] mt-1">{s.mileage.toLocaleString()} mi | {s.exteriorColor || "?"} ext / {s.interiorColor || "?"} int | {s.engine || "?"} | {s.transmission || "?"}</p>}
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">Submitted {new Date(s.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusClass(s.status)}`}>{s.status}</span>
                  {s.status === "pending" && (
                    <SubmissionActions id={s.id} />
                  )}
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
      <Sidebar />
      <div className="ml-56 p-8">
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold mb-8">{title}</h1>
        {children}
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <div className="fixed left-0 top-0 bottom-0 w-56 bg-[var(--color-surface-dark)] text-[var(--color-text-inverse)] p-6">
      <Link href="/admin" className="font-[family-name:var(--font-cormorant)] text-xl font-semibold mb-8 block">Fidelis Auto</Link>
      <nav className="space-y-2">
        <SidebarLink href="/admin" icon={<Car size={16} />} label="Dashboard" />
        <SidebarLink href="/admin/submissions" icon={<FileText size={16} />} label="Submissions" active />
        <SidebarLink href="/admin/vehicles" icon={<Car size={16} />} label="Vehicles" />
      </nav>
      <div className="absolute bottom-6 left-6 right-6">
        <Link href="/" className="text-xs text-white/40 hover:text-white block mb-2">View Site</Link>
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

function statusClass(status: string) {
  switch (status) {
    case "pending": return "bg-yellow-100 text-yellow-800";
    case "approved": return "bg-green-100 text-green-800";
    case "rejected": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
}

function SubmissionActions({ id }: { id: string }) {
  return (
    <div className="flex gap-1">
      <form
        action={async () => {
          "use server";
          const { verifySession } = await import("@/lib/auth");
          const { prisma } = await import("@/lib/prisma");
          if (!(await verifySession())) return;
          await prisma.listingRequest.update({ where: { id }, data: { status: "approved" } });
        }}
      >
        <button type="submit" className="p-1.5 rounded bg-green-50 text-green-700 hover:bg-green-100 transition-colors" title="Approve">
          <Check size={14} />
        </button>
      </form>
      <form
        action={async () => {
          "use server";
          const { verifySession } = await import("@/lib/auth");
          const { prisma } = await import("@/lib/prisma");
          if (!(await verifySession())) return;
          await prisma.listingRequest.update({ where: { id }, data: { status: "rejected" } });
        }}
      >
        <button type="submit" className="p-1.5 rounded bg-red-50 text-red-700 hover:bg-red-100 transition-colors" title="Reject">
          <X size={14} />
        </button>
      </form>
    </div>
  );
}