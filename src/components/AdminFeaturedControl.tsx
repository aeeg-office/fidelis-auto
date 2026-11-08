"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminFeaturedControl({
  vehicleId,
  initialFeatured,
  initialUntil,
}: {
  vehicleId: string;
  initialFeatured: boolean;
  initialUntil?: Date | string | null;
}) {
  const [featured, setFeatured] = useState(Boolean(initialFeatured));
  const iso = initialUntil instanceof Date ? initialUntil.toISOString() : initialUntil || "";
  const [until, setUntil] = useState<string>(iso.slice(0, 16));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function save() {
    setBusy(true); setError(null);
    const untilDate = until ? new Date(until).toISOString() : null;
    const res = await fetch(`/api/admin/vehicles/${vehicleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured: featured, featuredUntil: untilDate }),
    }).catch(() => null);
    setBusy(false);
    if (!res?.ok) { const d = res ? await res.json().catch(() => ({})) : {}; return setError(d.error || "Unable to update featured status."); }
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="w-4 h-4" />
        <span className="text-sm font-medium">Featured on homepage</span>
      </label>
      <div>
        <label htmlFor="featuredUntil" className="block text-sm font-medium mb-1 text-[var(--color-text-secondary)]">Featured until (optional)</label>
        <input
          id="featuredUntil"
          type="datetime-local"
          value={until}
          onChange={(e) => setUntil(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
        />
        {until && <p className="text-xs text-[var(--color-text-secondary)] mt-1">Feature auto-expires at this time. Leave empty for no expiry.</p>}
      </div>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button type="button" onClick={save} disabled={busy}
        className="bg-[var(--color-ink)] text-[var(--color-text-inverse)] px-4 py-2 rounded-md font-medium disabled:opacity-50">
        {busy ? "Saving..." : "Save Featured"}
      </button>
    </div>
  );
}
