"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [error, setError] = useState("");
  const [emailDone, setEmailDone] = useState(false);
  const [phoneDone, setPhoneDone] = useState(false);
  const [loading, setLoading] = useState(false);

  // Resend
  const [timer, setTimer] = useState(0);
  const [resendAttempt, setResendAttempt] = useState(0);
  const [canCall, setCanCall] = useState(false);

  useEffect(() => {
    if (timer > 0) { const t = setTimeout(() => setTimer(timer - 1), 1000); return () => clearTimeout(t); }
  }, [timer]);

  async function verifyEmail(e: FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: emailCode }),
    });
    setLoading(false);
    if (res.ok) { setEmailDone(true); checkBoth(); }
    else { const d = await res.json(); setError(d.error || "Wrong code"); setEmailCode(""); }
  }

  async function verifyPhone(e: FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, phoneCode }),
    });
    setLoading(false);
    if (res.ok) { setPhoneDone(true); checkBoth(); }
    else { const d = await res.json(); setError(d.error || "Wrong code"); setPhoneCode(""); }
  }

  function checkBoth() {
    if (emailDone && phoneDone) router.push("/submit");
  }

  async function resendCode(method: string = "email") {
    setTimer(30);
    setError("");
    const res = await fetch("/api/auth/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, method }),
    });
    const data = await res.json();
    if (data.attempt !== undefined) setResendAttempt(data.attempt);
    if (data.canCall) setCanCall(true);
    if (!res.ok) setError(data.error || "Failed to resend");
  }

  return (
    <div className="space-y-8">
      {/* Email Verification */}
      {!emailDone && (
        <div className="p-6 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)]">
          <h2 className="font-semibold text-[var(--color-text-primary)] mb-1">Step 1: Verify Email</h2>
          <p className="text-xs text-[var(--color-text-secondary)] mb-4">Code sent to <strong>{email}</strong></p>
          <form onSubmit={verifyEmail} className="space-y-3">
            <input type="text" inputMode="numeric" maxLength={6} value={emailCode}
              onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ""))} required
              placeholder="000000"
              className="w-full px-4 py-3 text-center text-2xl tracking-[8px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" />
            <button type="submit" disabled={loading || emailCode.length !== 6}
              className="w-full bg-[var(--color-accent)] text-[var(--color-surface-dark)] py-2.5 rounded-lg font-medium hover:bg-[var(--color-accent-hover)] disabled:opacity-50">
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>
          <div className="mt-3 flex items-center justify-between">
            <button onClick={() => resendCode("email")} disabled={timer > 0}
              className="text-sm text-[var(--color-accent)] hover:underline disabled:opacity-40 disabled:no-underline">
              {timer > 0 ? `Resend in ${timer}s` : "Resend Code"}
            </button>
            {canCall && (
              <button onClick={() => resendCode("call")}
                className="text-sm text-[var(--color-error)] hover:underline">
                Call me with code
              </button>
            )}
          </div>
        </div>
      )}

      {emailDone && !phoneDone && <div className="text-center text-sm text-[var(--color-verified)]">✓ Email verified</div>}

      {/* Phone Verification */}
      {!phoneDone && (
        <div className="p-6 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)]">
          <h2 className="font-semibold text-[var(--color-text-primary)] mb-1">Step 2: Verify Phone</h2>
          <p className="text-xs text-[var(--color-text-secondary)] mb-2">
            SMS sent to your phone. <span className="text-[var(--color-accent)]">Check server logs for code if SMS not received</span>
          </p>
          <form onSubmit={verifyPhone} className="space-y-3">
            <input type="text" inputMode="numeric" maxLength={6} value={phoneCode}
              onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, ""))} required
              placeholder="000000"
              className="w-full px-4 py-3 text-center text-2xl tracking-[8px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" />
            <button type="submit" disabled={loading || phoneCode.length !== 6}
              className="w-full bg-[var(--color-accent)] text-[var(--color-surface-dark)] py-2.5 rounded-lg font-medium hover:bg-[var(--color-accent-hover)] disabled:opacity-50">
              {loading ? "Verifying..." : "Verify Phone"}
            </button>
          </form>
          <div className="mt-3 flex flex-wrap gap-3">
            <button onClick={() => resendCode("sms")} disabled={timer > 0}
              className="text-sm text-[var(--color-accent)] hover:underline disabled:opacity-40 disabled:no-underline">
              {timer > 0 ? `Resend SMS in ${timer}s` : "Resend SMS"}
            </button>
            <button onClick={() => resendCode("whatsapp")} disabled={timer > 0}
              className="text-sm text-[var(--color-accent)] hover:underline disabled:opacity-40 disabled:no-underline">
              Send via WhatsApp
            </button>
            <button onClick={() => resendCode("call")}
              className="text-sm text-[var(--color-error)] hover:underline">
              Call me
            </button>
          </div>
        </div>
      )}

      {phoneDone && <div className="text-center text-sm text-[var(--color-verified)]">✓ Phone verified</div>}

      {error && <p className="text-sm text-[var(--color-error)] text-center">{error}</p>}
    </div>
  );
}