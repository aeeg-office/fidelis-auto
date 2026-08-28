"use client";

import { useState, useTransition } from "react";

export default function VehicleStatusControl({
  vehicleId,
  currentStatus,
}: {
  vehicleId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isSold = status === "sold";

  function toggle() {
    const next = isSold ? "available" : "sold";
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/my-vehicle/${vehicleId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: next }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          setError(data.error || "Failed to update status.");
          return;
        }
        setStatus(data.status);
      } catch {
        setError("Network error.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={
          isSold
            ? "text-xs font-medium text-[var(--color-accent)] hover:underline disabled:opacity-50"
            : "text-xs font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-md hover:bg-green-100 transition-colors disabled:opacity-50"
        }
      >
        {pending
          ? "Updating…"
          : isSold
            ? "Mark Available"
            : "Mark as Sold"}
      </button>
      {isSold && (
        <span className="text-[10px] uppercase tracking-wide text-red-600 font-semibold">
          Sold
        </span>
      )}
      {error && <span className="text-[10px] text-red-600">{error}</span>}
    </div>
  );
}
