"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const t = useTranslations("auth");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });

    setLoading(false);
    const data = await res.json();
    if (res.ok) {
      router.push(data.redirectPath || "/dashboard");
    } else if (data.needsVerification) {
      setNeedsVerification(true);
      setVerifyEmail(data.email);
      setError(t("emailNotVerifiedDesc"));
    } else {
      setError(data.error || t("invalidCredentials"));
    }
  }

  if (needsVerification) {
    return (
      <div className="container-page py-16 md:py-24">
        <div className="max-w-sm mx-auto text-center">
          <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold mb-3">{t("emailNotVerified")}</h1>
          <p className="text-[var(--color-text-secondary)] mb-3">
            {t("emailNotVerifiedDesc")}
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">
            {t("verificationSent")} <strong>{verifyEmail}</strong>.
          </p>
          <Link href={`/verify?email=${encodeURIComponent(verifyEmail)}`}
            className="bg-[var(--color-ink)] text-[var(--color-text-inverse)] px-6 py-2.5 rounded-lg font-medium hover:bg-[var(--color-ink-hover)]">
            {t("enterCode")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-16 md:py-24">
      <div className="max-w-sm mx-auto">
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-center mb-2">{t("signIn")}</h1>
        <p className="text-sm text-[var(--color-text-secondary)] text-center mb-8">
          {t("signInDescription")}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">{t("email")}</label>
            <input id="email" name="email" type="email" required className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">{t("password")}</label>
            <div className="relative">
              <input id="password" name="password" type={showPassword ? "text" : "password"} required className="w-full px-4 py-2.5 pe-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-[var(--color-verified)] text-[var(--color-text-inverse)] py-2.5 rounded-lg font-medium hover:bg-[var(--color-green-hover)] disabled:opacity-50">
            {loading ? t("signingIn") : t("signIn")}
          </button>
        </form>
        <p className="text-sm text-[var(--color-text-secondary)] text-center mt-6">
          {t("noAccount")} <Link href="/signup" className="text-[var(--color-accent)] hover:underline">{t("registerHere")}</Link>
        </p>
      </div>
    </div>
  );
}
