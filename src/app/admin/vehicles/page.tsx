import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { Car, FileText, Plus } from "lucide-react";

export default async function AdminVehiclesPage() {
  if (!(await verifySession())) redirect("/admin/login");

  const vehicles = await prisma.vehicle.findMany({
    orderBy: { createdAt: "desc" },
    include: { images: { take: 1, where: { isPrimary: true } } },
  });

  return (
    <AdminLayout title="Vehicles">
      <div className="flex justify-end mb-4">
        <Link href="/admin/vehicles/new" className="flex items-center gap-2 bg-[var(--color-accent)] text-[var(--color-surface-dark)] px-4 py-2 rounded-lg text-sm font-medium">
          <Plus size={16} /> Add Vehicle
        </Link>
      </div>
      <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
        <div className="divide-y divide-[var(--color-border)]">
          {vehicles.length === 0 ? (
            <p className="p-6 text-sm text-[var(--color-text-secondary)]">No vehicles yet.</p>
          ) : vehicles.map((v: any) => (
            <div key={v.id} className="flex items-center gap-4 p-4 px-6">
              <div className="w-16 h-12 bg-[var(--color-surface-dark)] rounded flex items-center justify-center shrink-0">
                <Car size={20} className="text-[var(--color-text-inverse)]/30" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--color-text-primary)]">{v.year} {v.make} {v.model}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">Slug: {v.slug} | {v.status} | {v.images.length} image(s)</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${v.isPublished ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                {v.isPublished ? "Published" : "Draft"}
              </span>
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
        <SidebarLink href="/admin/submissions" icon={<FileText size={16} />} label="Submissions" />
        <SidebarLink href="/admin/vehicles" icon={<Car size={16} />} label="Vehicles" active />
      </nav>
      <div className="absolute bottom-6 left-6 right-6">
        <a href="/" className="text-xs text-white/40 hover:text-white block mb-2">View Site</a>
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