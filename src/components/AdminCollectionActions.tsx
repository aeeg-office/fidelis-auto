"use client";

import { Eye, EyeOff, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminCollectionActions({
  id,
  isVisible,
}: {
  id: string;
  isVisible: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function toggle() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/collections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVisible: !isVisible }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (!res?.ok) return setError(data.error || "Unable to update this collection.");
    router.refresh();
  }

  async function remove() {
    if (!confirm("Delete this collection permanently? Vehicles are not affected.")) return;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/collections/${id}`, { method: "DELETE" }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (!res?.ok) return setError(data.error || "Unable to delete collection.");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-1">
        <button
          type="button"
          onClick={remove}
          disabled={busy}
          className="p-1.5 rounded bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
          title="Delete collection"
          aria-label="Delete collection"
        >
          <Trash2 size={14} />
        </button>
        <button
          type="button"
          onClick={toggle}
          disabled={busy}
          className={`p-1.5 rounded disabled:opacity-50 ${
            isVisible ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-green-50 text-green-700 hover:bg-green-100"
          }`}
          title={isVisible ? "Hide collection" : "Show collection"}
          aria-label={isVisible ? "Hide collection" : "Show collection"}
        >
          {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      {error && <p role="alert" className="max-w-44 text-right text-xs text-red-700">{error}</p>}
    </div>
  );
}