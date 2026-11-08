"use client";

import { FormEvent, useState } from "react";
import { serviceCategories, SPECIALIST_TAGS, SERVICE_LANGUAGES } from "@/lib/service-listing";

export default function ServiceListingForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

  function toggleTag(tag: string) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessName: form.get("businessName"),
        category: form.get("category"),
        city: form.get("city"),
        country: form.get("country"),
        phone: form.get("phone"),
        website: form.get("website"),
        description: form.get("description"),
        specialties: tags,
        languages: form.get("languages"),
        coverageArea: form.get("coverageArea"),
        whatsapp: form.get("whatsapp"),
      }),
    }).catch(() => null);
    const data = response ? await response.json().catch(() => ({})) : {};
    setLoading(false);
    if (!response?.ok) return setMessage(data.error || "Unable to submit your service listing.");
    event.currentTarget.reset();
    setTags([]);
    setMessage("Your service listing was submitted for Fidelis review.");
  }

  const inputClass = "mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2.5";

  return (
    <form onSubmit={submit} className="mt-8 space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <div><h2 className="text-xl font-semibold">Add a specialist service</h2><p className="mt-1 text-sm text-[var(--color-text-secondary)]">New directory listings are reviewed before publication.</p></div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm">Business name<input required name="businessName" className={inputClass} /></label>
        <label className="text-sm">Category<select required name="category" defaultValue="" className={inputClass}><option value="" disabled>Select a category</option>{serviceCategories.map((category) => <option key={category}>{category}</option>)}</select></label>
        <label className="text-sm">City<input name="city" className={inputClass} /></label>
        <label className="text-sm">Country<input name="country" className={inputClass} /></label>
        <label className="text-sm">Phone<input name="phone" type="tel" className={inputClass} /></label>
        <label className="text-sm">WhatsApp<input name="whatsapp" type="tel" className={inputClass} /></label>
        <label className="text-sm">Coverage area<input name="coverageArea" className={inputClass} /></label>
        <label className="text-sm">Languages spoken<select name="languages" defaultValue="" className={inputClass}><option value="">Select languages</option>{SERVICE_LANGUAGES.map((lang) => <option key={lang} value={lang}>{lang}</option>)}</select></label>
      </div>
      <div>
        <span className="text-sm">Specialist tags</span>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {SPECIALIST_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              aria-pressed={tags.includes(tag)}
              className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                tags.includes(tag)
                  ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-text-inverse)]"
                  : "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)]"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      <label className="block text-sm">Description<textarea required name="description" rows={4} maxLength={2000} className={inputClass} /></label>
      {message && <p role="status" className="text-sm text-[var(--color-text-secondary)]">{message}</p>}
      <button disabled={loading} className="rounded-[var(--radius-control)] bg-[var(--color-ink)] px-5 py-2.5 font-medium text-[var(--color-text-inverse)] hover:bg-[var(--color-ink-hover)] disabled:opacity-50">{loading ? "Submitting…" : "Submit service"}</button>
    </form>
  );
}
