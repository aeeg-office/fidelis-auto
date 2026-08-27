"use client";

import { Check, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminInquiryActions({ id, isRead }: { id: string; isRead: boolean }) {
  const [busy, setBusy] = useState<"read" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function markRead() {
    setBusy("read"); setError(null);
    const res = await fetch(`/api/admin/inquiries/${id}`, { method: "PATCH" }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(null);
    if (!res?.ok) return setError(data.error || "Unable to update.");
    router.refresh();
  }

  async function remove() {
    setBusy("delete"); setError(null);
    const res = await fetch(`/api/admin/inquiries/${id}`, { method: "DELETE" }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(null);
    if (!res?.ok) return setError(data.error || "Unable to delete.");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-1">
        {!isRead && (
          <button type="button" onClick={markRead} disabled={busy !== null}
            className="p-1.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50"
            title="Mark as read" aria-label="Mark as read"><Check size={14} /></button>
        )}
        <button type="button" onClick={remove} disabled={busy !== null}
          className="p-1.5 rounded bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
          title="Delete inquiry" aria-label="Delete inquiry"><Trash2 size={14} /></button>
      </div>
      {error && <p role="alert" className="max-w-44 text-right text-xs text-red-700">{error}</p>}
    </div>
  );
}