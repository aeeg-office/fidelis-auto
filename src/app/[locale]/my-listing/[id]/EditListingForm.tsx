"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2 } from "lucide-react";
import Link from "next/link";
import OwnerPhotoManager from "@/components/OwnerPhotoManager";
import {
  EXTERIOR_COLORS,
  INTERIOR_COLORS,
  TRANSMISSIONS,
  COUNTRIES,
} from "@/lib/car-data";

type Listing = {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  mileage: number | null;
  exteriorColor: string | null;
  interiorColor: string | null;
  engine: string | null;
  transmission: string | null;
  description: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;
  status: string;
  photoUrls: string[];
};

export default function EditListingForm({ listing }: { listing: Listing }) {
  const router = useRouter();
  const [photos, setPhotos] = useState<string[]>(listing.photoUrls);
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
      mileage: form.get("mileage") ? parseInt(form.get("mileage") as string) : null,
      exteriorColor: form.get("exteriorColor"),
      interiorColor: form.get("interiorColor"),
      engine: form.get("engine"),
      transmission: form.get("transmission"),
      description: form.get("description"),
      city: form.get("city"),
      state: form.get("state"),
      country: form.get("country"),
      zipCode: form.get("zipCode"),
      photoUrls: photos,
    };
    const res = await fetch(`/api/my-listing/${listing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    const data = await res.json().catch(() => null);
    if (res.ok) {
      setMessage("Saved. Your submission is back under review.");
      router.refresh();
    } else {
      setError(data?.error || "Save failed.");
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this submission? This cannot be undone.")) return;
    setDeleting(true);
    setError("");
    const res = await fetch(`/api/my-listing/${listing.id}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) router.push("/dashboard");
    else setError("Delete failed.");
  }

  return (
    <div className="container-page py-16 md:py-24">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold">
              Edit Your Submission
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              Current status: <strong>{listing.status}</strong>. Saving re-opens it for review.
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
              <F name="year" label="Year *" type="number" defaultValue={listing.year} required />
              <F name="make" label="Make *" defaultValue={listing.make} required />
              <F name="model" label="Model *" defaultValue={listing.model} required />
              <F name="trim" label="Trim" defaultValue={listing.trim || ""} />
              <F name="mileage" label="Mileage" type="number" defaultValue={listing.mileage ?? ""} />
              <Sel name="transmission" label="Transmission" options={TRANSMISSIONS} value={listing.transmission || ""} />
              <Sel name="exteriorColor" label="Exterior Color" options={EXTERIOR_COLORS} value={listing.exteriorColor || ""} />
              <Sel name="interiorColor" label="Interior Color" options={INTERIOR_COLORS} value={listing.interiorColor || ""} />
              <F name="engine" label="Engine" defaultValue={listing.engine || ""} />
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 uppercase tracking-wider">
              Location & Notes
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <F name="city" label="City" defaultValue={listing.city || ""} />
              <F name="state" label="State" defaultValue={listing.state || ""} />
              <Sel name="country" label="Country" options={COUNTRIES} value={listing.country || ""} />
              <F name="zipCode" label="Zip / Postal" defaultValue={listing.zipCode || ""} />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                defaultValue={listing.description || ""}
              />
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 uppercase tracking-wider">
              Photos
            </legend>
            <OwnerPhotoManager initial={photos} max={30} onChange={setPhotos} />
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
              <Trash2 size={14} /> {deleting ? "Deleting…" : "Delete submission"}
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