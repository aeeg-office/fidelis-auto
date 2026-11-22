"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export default function DealerRegistrationPage() {
  const t = useTranslations("dealerRegister");
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/dealers/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    const payload = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(payload.error || t("errorGeneric"));
      return;
    }
    setSuccess(payload.message || t("success"));
    setTimeout(() => router.push("/dashboard"), 1200);
  }

  const inputClass = "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]";
  const optional = <span className="font-normal text-[var(--color-text-secondary)]">{t("optional")}</span>;

  return (
    <div className="container-page py-16 md:py-24">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-semibold text-[var(--color-text-primary)]">{t("title")}</h1>
        <p className="mt-2 text-[var(--color-text-secondary)]">{t("intro")}</p>
        <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-medium">{t("businessName")}<input name="businessName" required className={`${inputClass} mt-1`} /></label>
            <label className="text-sm font-medium">{t("contactPerson")}<input name="contactPerson" required autoComplete="name" className={`${inputClass} mt-1`} /></label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-medium">{t("businessEmail")}<input name="email" required type="email" autoComplete="email" className={`${inputClass} mt-1`} /></label>
            <label className="text-sm font-medium">{t("businessPhone")}<input name="phone" required type="tel" autoComplete="tel" className={`${inputClass} mt-1`} /></label>
          </div>
          <label className="block text-sm font-medium">{t("address")}<input name="address" required autoComplete="street-address" className={`${inputClass} mt-1`} /></label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-medium">{t("city")}<input name="city" required autoComplete="address-level2" className={`${inputClass} mt-1`} /></label>
            <label className="text-sm font-medium">{t("country")}<input name="country" required autoComplete="country-name" className={`${inputClass} mt-1`} /></label>
          </div>
          <label className="block text-sm font-medium">{t("description")}<textarea name="description" required minLength={30} rows={5} className={`${inputClass} mt-1`} aria-describedby="description-hint" /></label>
          <p id="description-hint" className="-mt-3 text-xs text-[var(--color-text-secondary)]">{t("descriptionHint")}</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-medium">{t("website")} {optional}<input name="website" type="url" placeholder="https://" className={`${inputClass} mt-1`} /></label>
            <label className="text-sm font-medium">{t("logoUrl")} {optional}<input name="logoUrl" type="url" placeholder="https://" className={`${inputClass} mt-1`} /></label>
          </div>
          {error && <p role="alert" className="text-sm text-[var(--color-error)]">{error}</p>}
          {success && <p role="status" className="text-sm text-[var(--color-verified)]">{success}</p>}
          <button disabled={loading} className="rounded-lg bg-[var(--color-verified)] px-6 py-3 font-medium text-[var(--color-text-inverse)] transition-colors hover:bg-[var(--color-green-hover)] disabled:opacity-50">
            {loading ? t("submitting") : t("submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
