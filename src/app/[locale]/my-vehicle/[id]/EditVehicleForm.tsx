"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2 } from "lucide-react";
import Link from "next/link";
import VehicleImageManager, { type ManagerImage } from "@/components/VehicleImageManager";
import { EXTERIOR_COLORS, INTERIOR_COLORS, TRANSMISSIONS } from "@/lib/car-data";

type Vehicle = {
  id: string;
  slug: string;
  title: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  vin: string | null;
  mileage: number | null;
  exteriorColor: string | null;
  interiorColor: string | null;
  engine: string | null;
  transmission: string | null;
  drivetrain: string | null;
  price: string | null;
  descriptionEn: string | null;
  descriptionAr: string | null;
  isPublished: boolean;
  images: ManagerImage[];
};

export default function EditVehicleForm({
  vehicle,
  slug,
}: {
  vehicle: Vehicle;
  slug: string;
}) {
  const router = useRouter();
  const [images, setImages] = useState<ManagerImage[]>(vehicle.images);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const form = new FormData(e.currentTarget);
    const payload = {
      year: parseInt(form.get("year") as string),
      make: form.get("make"),
      model: form.get("model"),
      trim: form.get("trim"),
      vin: form.get("vin"),
      mileage: form.get("mileage") ? parseInt(form.get("mileage") as string) : null,
      exteriorColor: form.get("exteriorColor"),
      interiorColor: form.get("interiorColor"),
      engine: form.get("engine"),
      transmission: form.get("transmission"),
      drivetrain: form.get("drivetrain"),
      price: form.get("price"),
      descriptionEn: form.get("descriptionEn"),
      descriptionAr: form.get("descriptionAr"),
      images,
    };
    const res = await fetch(`/api/my-vehicle/${vehicle.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    const data = await res.json().catch(() => null);
    if (res.ok) {
      setMessage("Changes saved.");
      router.refresh();
    } else {
      setError(data?.error || "Save failed.");
    }
  }

  async function handleDelete() {
    if (!window.confirm("Remove this listing? This cannot be undone.")) return;
    setDeleting(true);
    setError("");
    const res = await fetch(`/api/my-vehicle/${vehicle.id}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) router.push("/dashboard");
    else setError("Remove failed.");
  }

  return (
    <div className="container-page py-16 md:py-24">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold">
              Edit Your Listing
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              {vehicle.title}{vehicle.isPublished ? " · Published" : " · Unpublished"}
            </p>
          </div>
          <Link href="/dashboard" className="text-sm text-[var(--color-accent)] hover:underline">
            ← Back to dashboard
          </Link>
        </div>

        <form onSubmit={handleSave} className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 space-y-6">
          <fieldset>
            <legend className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 uppercase tracking-wider">
              Vehicle Details
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <F name="year" label="Year *" type="number" defaultValue={vehicle.year} required />
              <F name="make" label="Make *" defaultValue={vehicle.make} required />
              <F name="model" label="Model *" defaultValue={vehicle.model} required />
              <F name="trim" label="Trim" defaultValue={vehicle.trim || ""} />
              <F name="mileage" label="Mileage" type="number" defaultValue={vehicle.mileage ?? ""} />
              <F name="vin" label="VIN" defaultValue={vehicle.vin || ""} />
              <Sel name="transmission" label="Transmission" options={TRANSMISSIONS} value={vehicle.transmission || ""} />
              <Sel name="exteriorColor" label="Exterior Color" options={EXTERIOR_COLORS} value={vehicle.exteriorColor || ""} />
              <Sel name="interiorColor" label="Interior Color" options={INTERIOR_COLORS} value={vehicle.interiorColor || ""} />
              <F name="engine" label="Engine" defaultValue={vehicle.engine || ""} />
              <F name="drivetrain" label="Drivetrain" defaultValue={vehicle.drivetrain || ""} />
              <F name="price" label="Price" defaultValue={vehicle.price || ""} />
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 uppercase tracking-wider">
              Description
            </legend>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Description (English)</label>
                <textarea
                  name="descriptionEn"
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  defaultValue={vehicle.descriptionEn || ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description (العربية)</label>
                <textarea
                  name="descriptionAr"
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  defaultValue={vehicle.descriptionAr || ""}
                />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 uppercase tracking-wider">
              Photos
            </legend>
            <VehicleImageManager
              vehicleId={vehicle.id}
              slug={slug}
              initial={images}
              max={30}
              onChange={setImages}
            />
          </fieldset>

          {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
          {message && <p className="text-sm text-[var(--color-verified)]">{message}</p>}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-[var(--color-accent)] text-[var(--color-surface-dark)] px-6 py-2.5 rounded-lg font-medium hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
            >
              <Check size={16} /> {loading ? "Saving…" : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 text-sm text-[var(--color-error)] hover:underline disabled:opacity-50"
            >
              <Trash2 size={14} /> {deleting ? "Removing…" : "Remove listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function F({
  name, label, defaultValue, required, type = "text",
}: { name: string; label: string; defaultValue?: string | number; required?: boolean; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1" htmlFor={name}>{label}{required ? " *" : ""}</label>
      <input
        id={name} name={name} type={type} defaultValue={defaultValue}
        required={required}
        className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
      />
    </div>
  );
}

function Sel({
  name, label, options, value,
}: { name: string; label: string; options: readonly string[]; value?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1" htmlFor={name}>{label}</label>
      <select
        id={name} name={name} defaultValue={value}
        className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
      >
        <option value="">—</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}