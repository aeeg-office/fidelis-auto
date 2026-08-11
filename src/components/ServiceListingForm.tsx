"use client";

import { FormEvent, useState } from "react";
import { serviceCategories } from "@/lib/service-listing";

export default function ServiceListingForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    }).catch(() => null);
    const data = response ? await response.json().catch(() => ({})) : {};
    setLoading(false);
    if (!response?.ok) return setMessage(data.error || "Unable to submit your service listing.");
    event.currentTarget.reset();
    setMessage("Your service listing was submitted for Fidelis review.");
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <div><h2 className="text-xl font-semibold">Add a specialist service</h2><p className="mt-1 text-sm text-[var(--color-text-secondary)]">New directory listings are reviewed before publication.</p></div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm">Business name<input required name="businessName" className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2.5" /></label>
        <label className="text-sm">Category<select required name="category" defaultValue="" className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2.5"><option value="" disabled>Select a category</option>{serviceCategories.map((category) => <option key={category}>{category}</option>)}</select></label>
        <label className="text-sm">City<input name="city" className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2.5" /></label>
        <label className="text-sm">Country<input name="country" className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2.5" /></label>
        <label className="text-sm">Phone<input name="phone" type="tel" className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2.5" /></label>
        <label className="text-sm">Website<input name="website" type="url" placeholder="https://" className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2.5" /></label>
      </div>
      <label className="block text-sm">Description<textarea required name="description" rows={4} maxLength={2000} className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2.5" /></label>
      {message && <p role="status" className="text-sm text-[var(--color-text-secondary)]">{message}</p>}
      <button disabled={loading} className="rounded-lg bg-[var(--color-accent)] px-5 py-2.5 font-medium text-[var(--color-surface-dark)] disabled:opacity-50">{loading ? "Submitting…" : "Submit service"}</button>
    </form>
  );
}
