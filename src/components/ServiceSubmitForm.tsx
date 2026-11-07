"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const CATEGORIES = [
  { slug: "buy-verify", label: "Buy & Verify" },
  { slug: "maintain-repair", label: "Maintain & Repair" },
  { slug: "protect-detail", label: "Protect & Detail" },
  { slug: "restore-upgrade", label: "Restore & Upgrade" },
  { slug: "own-support", label: "Own & Support" },
  { slug: "parts-accessories", label: "Parts & Accessories" },
];

export default function ServiceSubmitForm() {
  const tf = useTranslations("services.form");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessName: fd.get("businessName"),
        category: fd.get("category"),
        description: fd.get("description"),
        phone: fd.get("phone"),
        website: fd.get("website"),
        city: fd.get("city"),
        country: fd.get("country"),
      }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (!res?.ok) return setError(data.error || tf("error"));
    setDone(true);
    router.refresh();
  }

  if (done) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <h2 className="text-lg font-semibold text-green-800">{tf("successTitle")}</h2>
        <p className="mt-2 text-sm text-green-700">{tf("successDesc")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="businessName" className="block text-sm font-medium mb-2">{tf("businessName")}</label>
        <input id="businessName" name="businessName" required className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]" />
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-2">{tf("specialty")}</label>
        <select id="category" name="category" required className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
          <option value="">{tf("selectSpecialty")}</option>
          {CATEGORIES.map((c) => <option key={c.slug} value={c.label}>{c.label}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">{tf("description")}</label>
        <textarea id="description" name="description" required rows={4} className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]" />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-2">{tf("phone")}</label>
          <input id="phone" name="phone" type="tel" className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]" />
        </div>
        <div>
          <label htmlFor="website" className="block text-sm font-medium mb-2">{tf("website")}</label>
          <input id="website" name="website" type="url" className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]" />
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium mb-2">{tf("city")}</label>
          <input id="city" name="city" className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]" />
        </div>
        <div>
          <label htmlFor="country" className="block text-sm font-medium mb-2">{tf("country")}</label>
          <input id="country" name="country" className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]" />
        </div>
      </div>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
<button type="submit" disabled={busy} className="bg-[var(--color-ink)] text-[var(--color-text-inverse)] px-4 py-2 rounded-[var(--radius-control)] font-medium hover:bg-[var(--color-ink-hover)] disabled:opacity-50">
        {busy ? tf("submitting") : tf("submit")}
      </button>
    </form>
  );
}
