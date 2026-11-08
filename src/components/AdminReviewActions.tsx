"use client";

import { Check, RotateCcw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  id: string;
  status: string;
};

export default function AdminReviewActions({ id, status }: Props) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function setStatus(next: "published" | "removed") {
    setBusy(next);
    setError(null);
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(null);
    if (!res?.ok) return setError(data.error || "Unable to update review.");
    router.refresh();
  }

  async function remove() {
    setBusy("delete");
    setError(null);
    const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(null);
    if (!res?.ok) return setError(data.error || "Unable to delete review.");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-1">
        {status !== "published" && (
          <button type="button" onClick={() => setStatus("published")} disabled={busy !== null}
            className="p-1.5 rounded bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50"
            title="Publish" aria-label="Publish"><Check size={14} /></button>
        )}
        {status !== "removed" && (
          <button type="button" onClick={() => setStatus("removed")} disabled={busy !== null}
            className="p-1.5 rounded bg-[var(--color-ink)]/10 text-[var(--color-ink)] hover:bg-[var(--color-ink)]/20 disabled:opacity-50"
            title="Remove" aria-label="Remove"><RotateCcw size={14} /></button>
        )}
        <button type="button" onClick={remove} disabled={busy !== null}
          className="p-1.5 rounded bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
          title="Delete review" aria-label="Delete review"><Trash2 size={14} /></button>
      </div>
      {error && <p role="alert" className="max-w-44 text-right text-xs text-red-700">{error}</p>}
    </div>
  );
}