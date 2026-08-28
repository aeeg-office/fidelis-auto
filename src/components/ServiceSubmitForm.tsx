"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { slug: "buy-verify", label: "Buy & Verify" },
  { slug: "maintain-repair", label: "Maintain & Repair" },
  { slug: "protect-detail", label: "Protect & Detail" },
  { slug: "restore-upgrade", label: "Restore & Upgrade" },
  { slug: "own-support", label: "Own & Support" },
  { slug: "parts-accessories", label: "Parts & Accessories" },
];

export default function ServiceSubmitForm() {
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
    if (!res?.ok) return setError(data.error || "Unable to submit your service.");
    setDone(true);
    router.refresh();
  }

  if (done) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <h2 className="text-lg font-semibold text-green-800">Thank you — submission received.</h2>
        <p className="mt-2 text-sm text-green-700">Our team will review and publish it shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="businessName" className="block text-sm font-medium mb-2">Business name *</label>
        <input id="businessName" name="businessName" required className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]" />
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-2">Specialty *</label>
        <select id="category" name="category" required className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
          <option value="">Select a specialty</option>
          {CATEGORIES.map((c) => <option key={c.slug} value={c.label}>{c.label}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">Description *</label>
        <textarea id="description" name="description" required rows={4} className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]" />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-2">Phone</label>
          <input id="phone" name="phone" type="tel" className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]" />
        </div>
        <div>
          <label htmlFor="website" className="block text-sm font-medium mb-2">Website</label>
          <input id="website" name="website" type="url" className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]" />
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium mb-2">City</label>
          <input id="city" name="city" className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]" />
        </div>
        <div>
          <label htmlFor="country" className="block text-sm font-medium mb-2">Country</label>
          <input id="country" name="country" className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]" />
        </div>
      </div>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={busy} className="bg-[var(--color-accent)] text-[var(--color-surface-dark)] px-4 py-2 rounded-md font-medium disabled:opacity-50">
        {busy ? "Submitting..." : "Submit for Review"}
      </button>
    </form>
  );
}