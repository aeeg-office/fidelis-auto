import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";
import AdminVehicleImageManager from "@/components/AdminVehicleImageManager";

export default async function AdminVehicleEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await verifySession())) redirect("/admin/login");
  const { id } = await params;

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  if (!vehicle) redirect("/admin/vehicles");

  const initialImages = vehicle.images.map((i) => ({
    id: i.id,
    src: i.src,
    cover: i.isPrimary,
  }));

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="p-8 max-w-4xl mx-auto">
        <Link href="/admin/vehicles" className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors mb-6">
          <ArrowLeft size={16} /> Back to vehicles
        </Link>
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold mb-2">
          {vehicle.title}
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mb-8">
          {vehicle.slug} · {vehicle.status} · {vehicle.images.length} image(s)
        </p>

        <section className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6">
          <h2 className="font-[family-name:var(--font-cormorant)] text-xl font-semibold mb-4">Photos</h2>
          <AdminVehicleImageManager
            vehicleId={vehicle.id}
            slug={vehicle.slug}
            initial={initialImages}
          />
        </section>
      </div>
    </div>
  );
}