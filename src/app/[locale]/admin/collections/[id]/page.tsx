import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import CollectionForm from "@/components/CollectionForm";
import CollectionVehiclePicker, { type PickerVehicle } from "@/components/CollectionVehiclePicker";

function primaryImage(images: { src: string; isPrimary: boolean }[]): string | null {
  if (!images || images.length === 0) return null;
  const primary = images.find((i) => i.isPrimary) ?? images[0];
  return primary ? primary.src : null;
}

export default async function EditCollectionPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await verifySession())) redirect("/admin/login");
  const { id } = await params;

  const collection = await prisma.collection.findUnique({
    where: { id },
    include: { vehicles: { orderBy: { sortOrder: "asc" } } },
  });
  if (!collection) notFound();

  const publishedVehicles = await prisma.vehicle.findMany({
    where: { isPublished: true },
    include: { images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] } },
    orderBy: { createdAt: "desc" },
  });

  const pickerVehicles: PickerVehicle[] = publishedVehicles.map((v) => ({
    id: v.id,
    year: v.year,
    make: v.make,
    model: v.model,
    slug: v.slug,
    image: primaryImage(v.images as { src: string; isPrimary: boolean }[]),
  }));
  const selectedIds = collection.vehicles.map((cv) => cv.vehicleId);

  return (
    <div className="min-h-screen">
      <div className="mb-8">
        <Link href="/admin/collections" className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-3">
          <ArrowLeft size={14} /> Back to Collections
        </Link>
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold">Edit Collection</h1>
      </div>

      <div className="max-w-2xl bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6 mb-8">
        <h2 className="text-sm font-medium text-[var(--color-text-primary)] mb-4">Details</h2>
        <CollectionForm
          mode="edit"
          id={collection.id}
          initial={{
            slug: collection.slug,
            titleEn: collection.titleEn,
            titleAr: collection.titleAr ?? "",
            descriptionEn: collection.descriptionEn ?? "",
            descriptionAr: collection.descriptionAr ?? "",
            coverImage: collection.coverImage ?? "",
            sortOrder: collection.sortOrder,
            isVisible: collection.isVisible,
          }}
        />
      </div>

      <div className="max-w-2xl bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6">
        <h2 className="text-sm font-medium text-[var(--color-text-primary)] mb-4">Vehicles</h2>
        <CollectionVehiclePicker
          collectionId={collection.id}
          vehicles={pickerVehicles}
          selectedIds={selectedIds}
        />
      </div>
    </div>
  );
}