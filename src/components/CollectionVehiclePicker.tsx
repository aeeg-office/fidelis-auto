"use client";

import { Check } from "lucide-react";
import { useState } from "react";

export interface PickerVehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  slug: string;
  image?: string | null;
}

export default function CollectionVehiclePicker({
  collectionId,
  vehicles,
  selectedIds,
}: {
  collectionId: string;
  vehicles: PickerVehicle[];
  selectedIds: string[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedIds));
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggle(v: PickerVehicle) {
    const isAdding = !selected.has(v.id);
    setBusyId(v.id);
    setError(null);
    const res = await fetch(`/api/admin/collections/${collectionId}/vehicles`, {
      method: isAdding ? "POST" : "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicleIds: [v.id] }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusyId(null);
    if (!res?.ok) return setError(data.error || "Unable to update collection vehicles.");
    setSelected((prev) => {
      const next = new Set(prev);
      if (isAdding) next.add(v.id);
      else next.delete(v.id);
      return next;
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-[var(--color-text-primary)]">
          {selected.size} vehicle{selected.size === 1 ? "" : "s"} in this collection
        </p>
        <p className="text-xs text-[var(--color-text-secondary)]">Click a vehicle to add or remove it.</p>
      </div>
      {error && <p role="alert" className="text-sm text-red-700 mb-3">{error}</p>}
      <div className="grid gap-2 max-h-[480px] overflow-y-auto pr-1">
        {vehicles.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)] p-4 border border-dashed border-[var(--color-border)] rounded-lg">
            No published vehicles yet. Publish a vehicle first, then come back to curate this collection.
          </p>
        ) : (
          vehicles.map((v) => {
            const isSelected = selected.has(v.id);
            return (
              <button
                key={v.id}
                type="button"
                disabled={busyId === v.id}
                onClick={() => toggle(v)}
                className={`flex items-center gap-3 w-full text-start p-2 rounded-lg border text-sm transition-colors disabled:opacity-60 ${
                  isSelected
                    ? "border-[var(--color-ink)] bg-[var(--color-ink)]/10"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)]/50"
                }`}
                aria-pressed={isSelected}
              >
                {v.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.image} alt="" className="w-16 h-12 object-cover rounded shrink-0" />
                ) : (
                  <span className="w-16 h-12 rounded bg-[var(--color-surface-dark)] shrink-0 flex items-center justify-center text-xs text-[var(--color-text-secondary)]">
                    No img
                  </span>
                )}
                <span className="flex-1 min-w-0">
                  <span className="block truncate font-medium text-[var(--color-text-primary)]">
                    {v.year} {v.make} {v.model}
                  </span>
                  <span className="block truncate text-xs text-[var(--color-text-secondary)]">/{v.slug}</span>
                </span>
                <span
                  className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center ${
                    isSelected ? "bg-[var(--color-ink)] border-[var(--color-ink)] text-[var(--color-text-inverse)]" : "border-[var(--color-border)]"
                  }`}
                >
                  {isSelected && <Check size={12} strokeWidth={3} />}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}