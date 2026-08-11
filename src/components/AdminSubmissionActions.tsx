"use client";

import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminSubmissionActions({ id }: { id: string }) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function moderate(action: "approve" | "reject") {
    setLoading(action);
    setError(null);
    const response = await fetch(`/api/admin/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    }).catch(() => null);
    const data = response ? await response.json().catch(() => ({})) : {};
    setLoading(null);
    if (!response?.ok) return setError(data.error || "Unable to update this submission.");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-1">
        <button type="button" onClick={() => moderate("approve")} disabled={loading !== null} className="p-1.5 rounded bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50" title="Approve submission" aria-label="Approve submission"><Check size={14} /></button>
        <button type="button" onClick={() => moderate("reject")} disabled={loading !== null} className="p-1.5 rounded bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50" title="Reject submission" aria-label="Reject submission"><X size={14} /></button>
      </div>
      {error && <p role="alert" className="max-w-44 text-right text-xs text-red-700">{error}</p>}
    </div>
  );
}
