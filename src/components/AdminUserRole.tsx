"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const ROLES = ["BUYER", "SELLER", "DEALER", "ADMINISTRATOR"] as const;

export default function AdminUserRole({ id, currentRole }: { id: string; currentRole: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function change(role: string) {
    setBusy(true); setError(null);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (!res?.ok) return setError(data.error || "Unable to change role.");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <select
        value={currentRole}
        disabled={busy || currentRole === "SUPER_ADMIN"}
        onChange={(e) => change(e.target.value)}
        aria-label="Change user role"
        className="text-xs border border-[var(--color-border)] rounded px-2 py-1 bg-transparent text-[var(--color-text-primary)] disabled:opacity-40"
      >
        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>
      {error && <p role="alert" className="max-w-44 text-right text-xs text-red-700">{error}</p>}
    </div>
  );
}