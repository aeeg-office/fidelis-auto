import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutGrid, Pencil, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import AdminCollectionActions from "@/components/AdminCollectionActions";

export default async function AdminCollectionsPage() {
  if (!(await verifySession())) redirect("/admin/login");

  const collections = await prisma.collection.findMany({
    include: { _count: { select: { vehicles: true } } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  const visible = collections.filter((c) => c.isVisible).length;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold">Collections</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {visible} visible · {collections.length} total
          </p>
        </div>
        <Link
          href="/admin/collections/new"
          className="flex items-center gap-2 bg-[var(--color-ink)] text-[var(--color-text-inverse)] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-ink-hover)]"
        >
          <Plus size={16} /> New Collection
        </Link>
      </div>

      <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
        <div className="divide-y divide-[var(--color-border)]">
          {collections.length === 0 ? (
            <p className="p-6 text-sm text-[var(--color-text-secondary)]">
              No collections yet. Create your first curated collection — Classics, First cars, Family SUVs, Electric, Motorcycles.
            </p>
          ) : (
            collections.map((c) => (
              <div key={c.id} className="p-4 px-6">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      {c.titleEn}
                      {c.titleAr ? <span className="ms-2 text-[var(--color-text-secondary)]" dir="rtl">{c.titleAr}</span> : null}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                      /collections/{c.slug} · {c._count.vehicles} vehicle{c._count.vehicles === 1 ? "" : "s"} · Order {c.sortOrder}
                    </p>
                    {c.descriptionEn && (
                      <p className="text-sm text-[var(--color-text-secondary)] mt-1 max-w-lg truncate">{c.descriptionEn}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0 ml-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${c.isVisible ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                      {c.isVisible ? "Visible" : "Hidden"}
                    </span>
                    <div className="flex gap-1">
                      <Link
                        href={`/admin/collections/${c.id}`}
                        className="p-1.5 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                        title="Edit collection"
                        aria-label="Edit collection"
                      >
                        <Pencil size={14} />
                      </Link>
                      <AdminCollectionActions id={c.id} isVisible={c.isVisible} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  const nav = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/submissions", label: "Submissions" },
    { href: "/admin/vehicles", label: "Vehicles" },
    { href: "/admin/inquiries", label: "Inquiries" },
    { href: "/admin/dealers", label: "Dealers" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/services", label: "Services" },
    { href: "/admin/collections", label: "Collections" },
  ];
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="fixed left-0 top-0 bottom-0 w-56 bg-[var(--color-surface-dark)] text-[var(--color-text-inverse)] p-6">
        <Link href="/admin" className="font-[family-name:var(--font-cormorant)] text-xl font-semibold mb-8 block">Fidelis Auto</Link>
        <nav className="space-y-2">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                n.href === "/admin/collections" ? "bg-white/10 text-white font-medium" : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <LayoutGrid size={16} /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-6 left-6 right-6">
          <Link href="/" className="text-xs text-white/40 hover:text-white block mb-2">View Site</Link>
          <Link href="/admin/logout" className="text-xs text-white/40 hover:text-white">Logout</Link>
        </div>
      </div>
      <div className="ml-56 p-8">{children}</div>
    </div>
  );
}