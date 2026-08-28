"use client";

import { Eye, EyeOff, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminJournalActions({ id, isPublished }: { id: string; isPublished: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function toggle() {
    setBusy(true); setError(null);
    const res = await fetch(`/api/admin/journal/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publish: !isPublished }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (!res?.ok) return setError(data.error || "Unable to update this entry.");
    router.refresh();
  }

  async function remove() {
    if (!confirm("Delete this journal entry?")) return;
    setBusy(true); setError(null);
    const res = await fetch(`/api/admin/journal/${id}`, { method: "DELETE" }).catch(() => null);
    setBusy(false);
    if (!res?.ok) { const d = res ? await res.json().catch(() => ({})) : {}; return setError(d.error || "Unable to delete."); }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-1">
        <button type="button" onClick={toggle} disabled={busy}
          className={`p-1.5 rounded disabled:opacity-50 ${isPublished ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-green-50 text-green-700 hover:bg-green-100"}`}
          title={isPublished ? "Unpublish" : "Publish"} aria-label={isPublished ? "Unpublish" : "Publish"}>
          {isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
        <button type="button" onClick={remove} disabled={busy}
          className="p-1.5 rounded bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
          title="Delete" aria-label="Delete">
          <Trash2 size={14} />
        </button>
      </div>
      {error && <p role="alert" className="max-w-44 text-right text-xs text-red-700">{error}</p>}
    </div>
  );
}