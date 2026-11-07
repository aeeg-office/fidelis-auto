"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";

// WS10 warning-only policy: admin suspend/reinstate toggle for a user account.
export default function AdminUserSuspend({ id, isSuspended }: { id: string; isSuspended: boolean }) {
  const t = useTranslations("admin.users");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function toggle() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isSuspended: !isSuspended }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (!res?.ok) return setError(data.error || t("suspendError"));
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors disabled:opacity-40 ${
          isSuspended
            ? "border-green-600 text-green-700 hover:bg-green-50"
            : "border-red-600 text-red-700 hover:bg-red-50"
        }`}
      >
        {busy ? "…" : isSuspended ? t("reinstate") : t("suspend")}
      </button>
      {error && <p role="alert" className="max-w-44 text-right text-xs text-red-700">{error}</p>}
    </div>
  );
}
