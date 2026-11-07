import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { verifySession } from "@/lib/auth";
import CollectionForm from "@/components/CollectionForm";

export default async function NewCollectionPage() {
  if (!(await verifySession())) redirect("/admin/login");

  return (
    <div className="min-h-screen">
      <div className="mb-8">
        <Link href="/admin/collections" className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-3">
          <ArrowLeft size={14} /> Back to Collections
        </Link>
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold">New Collection</h1>
      </div>
      <div className="max-w-2xl bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6">
        <CollectionForm mode="create" />
      </div>
    </div>
  );
}