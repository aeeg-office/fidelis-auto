"use client";

import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminServiceActions({ id, isPublished }: { id: string; isPublished: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function toggle() {
    setBusy(true); setError(null);
    const res = await fetch(`/api/admin/services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publish: !isPublished }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (!res?.ok) return setError(data.error || "Unable to update this service.");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button type="button" onClick={toggle} disabled={busy}
        className={`p-1.5 rounded disabled:opacity-50 ${isPublished ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-green-50 text-green-700 hover:bg-green-100"}`}
        title={isPublished ? "Unpublish" : "Publish"} aria-label={isPublished ? "Unpublish" : "Publish"}>
        {isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
      {error && <p role="alert" className="max-w-44 text-right text-xs text-red-700">{error}</p>}
    </div>
  );
}