"use client";

import { useState } from "react";
import VehicleImageManager, { type ManagerImage } from "@/components/VehicleImageManager";

/**
 * Admin wrapper around VehicleImageManager: manages the image list locally and
 * persists the full ordered set to PATCH /api/admin/vehicles/[id] on "Save".
 */
export default function AdminVehicleImageManager({
  vehicleId,
  slug,
  initial = [],
}: {
  vehicleId: string;
  slug: string;
  initial?: ManagerImage[];
}) {
  const [images, setImages] = useState<ManagerImage[]>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaving(true);
    setError("");
    setSaved(false);
    const res = await fetch(`/api/admin/vehicles/${vehicleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images }),
    });
    setSaving(false);
    if (res.ok) setSaved(true);
    else {
      const d = await res.json().catch(() => null);
      setError(d?.error || "Save failed.");
    }
  }

  return (
    <div>
      <VehicleImageManager
        vehicleId={vehicleId}
        slug={slug}
        initial={initial}
        max={30}
        onChange={setImages}
      />
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          disabled={saving}
          onClick={save}
          className="inline-flex items-center gap-2 bg-[var(--color-accent)] text-[var(--color-surface-dark)] px-6 py-2 rounded-lg font-medium hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save image order & cover"}
        </button>
        {saved && <span className="text-sm text-[var(--color-verified)]">Saved.</span>}
        {error && <span className="text-sm text-[var(--color-error)]">{error}</span>}
      </div>
    </div>
  );
}