import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AddVehiclePage() {
  if (!(await verifySession())) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="fixed left-0 top-0 bottom-0 w-56 bg-[var(--color-surface-dark)] text-[var(--color-text-inverse)] p-6">
        <Link href="/admin" className="font-[family-name:var(--font-cormorant)] text-xl font-semibold mb-8 block">Fidelis Auto</Link>
        <nav className="space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 text-sm">Dashboard</Link>
          <Link href="/admin/vehicles" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/10 text-white font-medium text-sm">Vehicles</Link>
        </nav>
      </div>
      <div className="ml-56 p-8 max-w-2xl">
        <Link href="/admin/vehicles" className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] mb-6">
          <ArrowLeft size={14} /> Back
        </Link>
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold mb-8">Add Vehicle</h1>

        <form action="/api/admin/vehicles" method="POST" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-1">Year</label><input name="year" type="number" required className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]" /></div>
            <div><label className="block text-sm font-medium mb-1">Make</label><input name="make" required className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]" /></div>
            <div><label className="block text-sm font-medium mb-1">Model</label><input name="model" required className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]" /></div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-1">Trim</label><input name="trim" className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]" /></div>
            <div><label className="block text-sm font-medium mb-1">Mileage</label><input name="mileage" type="number" className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]" /></div>
            <div><label className="block text-sm font-medium mb-1">VIN</label><input name="vin" className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]" /></div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-1">Exterior Color</label><input name="exteriorColor" className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]" /></div>
            <div><label className="block text-sm font-medium mb-1">Interior Color</label><input name="interiorColor" className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]" /></div>
            <div><label className="block text-sm font-medium mb-1">Price</label><input name="price" className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]" /></div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-1">Engine</label><input name="engine" className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]" /></div>
            <div><label className="block text-sm font-medium mb-1">Transmission</label><input name="transmission" className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]" /></div>
            <div><label className="block text-sm font-medium mb-1">Drivetrain</label><input name="drivetrain" className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Description (English)</label><textarea name="descriptionEn" rows={4} className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]" /></div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2"><input name="isFeatured" type="checkbox" className="rounded" /> Featured</label>
            <label className="flex items-center gap-2"><input name="isPublished" type="checkbox" className="rounded" defaultChecked /> Published</label>
          </div>
          <button type="submit" className="bg-[var(--color-accent)] text-[var(--color-surface-dark)] px-6 py-2.5 rounded-lg font-medium hover:bg-[var(--color-accent-hover)]">Save Vehicle</button>
        </form>
      </div>
    </div>
  );
}