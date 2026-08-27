"use client";

import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminDealerActions({ id }: { id: string }) {
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function decide(action: "approve" | "reject") {
    setBusy(action); setError(null);
    const res = await fetch(`/api/admin/dealers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(null);
    if (!res?.ok) return setError(data.error || "Unable to update this application.");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-1">
        <button type="button" onClick={() => decide("approve")} disabled={busy !== null}
          className="p-1.5 rounded bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50"
          title="Approve dealer" aria-label="Approve dealer"><Check size={14} /></button>
        <button type="button" onClick={() => decide("reject")} disabled={busy !== null}
          className="p-1.5 rounded bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
          title="Reject dealer" aria-label="Reject dealer"><X size={14} /></button>
      </div>
      {error && <p role="alert" className="max-w-44 text-right text-xs text-red-700">{error}</p>}
    </div>
  );
}