"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer > 0) { const t = setTimeout(() => setTimer(timer - 1), 1000); return () => clearTimeout(t); }
  }, [timer]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    setLoading(false);
    if (res.ok) router.push("/submit");
    else { const d = await res.json(); setError(d.error || "Wrong code"); setCode(""); }
  }

  async function resendCode() {
    setTimer(30); setError("");
    const res = await fetch("/api/auth/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) { const d = await res.json(); setError(d.error || "Failed to resend"); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="code" className="block text-sm font-medium mb-1">Verification Code</label>
        <input id="code" type="text" inputMode="numeric" maxLength={6}
          value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} required
          placeholder="000000"
          className="w-full px-4 py-3 text-center text-2xl tracking-[8px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" />
        {email && <p className="text-xs text-[var(--color-text-secondary)] mt-2 text-center">Code sent to <strong>{email}</strong></p>}
      </div>

      {error && <p className="text-sm text-[var(--color-error)] text-center">{error}</p>}

      <button type="submit" disabled={loading || code.length !== 6}
        className="w-full bg-[var(--color-accent)] text-[var(--color-surface-dark)] py-2.5 rounded-lg font-medium hover:bg-[var(--color-accent-hover)] disabled:opacity-50">
        {loading ? "Verifying..." : "Verify Email"}
      </button>

      <div className="text-center">
        <button type="button" onClick={resendCode} disabled={timer > 0}
          className="text-sm text-[var(--color-accent)] hover:underline disabled:opacity-40 disabled:no-underline">
          {timer > 0 ? `Resend code in ${timer}s` : "Resend code"}
        </button>
      </div>
    </form>
  );
}