"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JournalNewForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: fd.get("title"),
        excerpt: fd.get("excerpt"),
        author: fd.get("author"),
        contentEn: fd.get("contentEn"),
        contentAr: fd.get("contentAr"),
        category: fd.get("category"),
        coverImage: fd.get("coverImage"),
      }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (!res?.ok) return setError(data.error || "Unable to create entry.");
    router.push("/admin/journal");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">Title *</label>
        <input id="title" name="title" required className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]" />
      </div>
      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium mb-2">Excerpt</label>
        <textarea id="excerpt" name="excerpt" rows={2} className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]" />
      </div>
      <div>
        <label htmlFor="author" className="block text-sm font-medium mb-2">Author</label>
        <input id="author" name="author" defaultValue="Fidelis Auto" className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]" />
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-2">Category</label>
        <select id="category" name="category" className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
          <option value="">Uncategorized</option>
          {["Buying Guides","Selling Guides","Valuation & Prices","Inspection Guides","Provenance & Paperwork","Ownership & Running Costs","Maintenance Care","Restoration & Upgrades"].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="coverImage" className="block text-sm font-medium mb-2">Cover image URL</label>
        <input id="coverImage" name="coverImage" placeholder="/uploads/…" className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]" />
      </div>
      <div>
        <label htmlFor="contentEn" className="block text-sm font-medium mb-2">Content (EN) *</label>
        <textarea id="contentEn" name="contentEn" required rows={12} className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]" />
      </div>
      <div>
        <label htmlFor="contentAr" className="block text-sm font-medium mb-2">Content (AR, optional)</label>
        <textarea id="contentAr" name="contentAr" rows={10} dir="rtl" lang="ar" className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]" />
      </div>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={busy} className="bg-[var(--color-accent)] text-[var(--color-surface-dark)] px-4 py-2 rounded-md font-medium disabled:opacity-50">
        {busy ? "Creating..." : "Create Draft"}
      </button>
    </form>
  );
}