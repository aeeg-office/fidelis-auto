"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    setLoading(false);
    if (res.ok) router.push("/submit");
    else {
      const data = await res.json();
      setError(data.error || "Verification failed");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="code" className="block text-sm font-medium mb-1">Verification Code</label>
        <input
          id="code"
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          required
          placeholder="000000"
          className="w-full px-4 py-3 text-center text-2xl tracking-[8px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
        />
        {email && <p className="text-xs text-[var(--color-text-secondary)] mt-2 text-center">Code sent to <strong>{email}</strong></p>}
      </div>

      {error && <p className="text-sm text-[var(--color-error)] text-center">{error}</p>}

      <button type="submit" disabled={loading || code.length !== 6}
        className="w-full bg-[var(--color-accent)] text-[var(--color-surface-dark)] py-2.5 rounded-lg font-medium hover:bg-[var(--color-accent-hover)] disabled:opacity-50">
        {loading ? "Verifying..." : "Verify Email"}
      </button>
    </form>
  );
}