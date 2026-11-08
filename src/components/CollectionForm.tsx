"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface CollectionFormValues {
  slug: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  coverImage: string;
  sortOrder: number;
  isVisible: boolean;
}

const EMPTY: CollectionFormValues = {
  slug: "",
  titleEn: "",
  titleAr: "",
  descriptionEn: "",
  descriptionAr: "",
  coverImage: "",
  sortOrder: 0,
  isVisible: true,
};

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]";
const labelCls = "block text-xs font-medium text-[var(--color-text-secondary)] mb-1";

export default function CollectionForm({
  mode,
  id,
  initial,
}: {
  mode: "create" | "edit";
  id?: string;
  initial?: Partial<CollectionFormValues>;
}) {
  const [values, setValues] = useState<CollectionFormValues>({ ...EMPTY, ...initial, sortOrder: initial?.sortOrder ?? 0 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function set<K extends keyof CollectionFormValues>(key: K, value: CollectionFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch(mode === "edit" ? `/api/admin/collections/${id}` : "/api/admin/collections", {
      method: mode === "edit" ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (!res?.ok) {
      setError(data.error || "Unable to save collection.");
      return;
    }
    if (mode === "create") {
      router.push(`/admin/collections/${data.id}`);
    } else {
      router.refresh();
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Title (English) *</label>
          <input className={inputCls} required value={values.titleEn}
            onChange={(e) => set("titleEn", e.target.value)} placeholder="Classics" />
        </div>
        <div>
          <label className={labelCls}>Title (Arabic)</label>
          <input className={inputCls} value={values.titleAr}
            onChange={(e) => set("titleAr", e.target.value)} placeholder="كلاسيكيات" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Slug *</label>
          <input className={inputCls} required value={values.slug}
            onChange={(e) => set("slug", e.target.value)} placeholder="classics"
            disabled={mode === "edit"} />
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            {mode === "edit" ? "Slug is fixed after creation." : "Lowercase letters, numbers, hyphens."}
          </p>
        </div>
        <div>
          <label className={labelCls}>Cover Image URL</label>
          <input className={inputCls} value={values.coverImage}
            onChange={(e) => set("coverImage", e.target.value)} placeholder="/images/classics-cover.jpg" />
        </div>
      </div>

      <div>
        <label className={labelCls}>Description (English)</label>
        <textarea className={inputCls} rows={3} value={values.descriptionEn}
          onChange={(e) => set("descriptionEn", e.target.value)}
          placeholder="Timeless automobiles from the 1970s to the 1990s." />
      </div>
      <div>
        <label className={labelCls}>Description (Arabic)</label>
        <textarea className={inputCls} rows={3} dir="rtl" value={values.descriptionAr}
          onChange={(e) => set("descriptionAr", e.target.value)}
          placeholder="سيارات خالدة من السبعينيات حتى التسعينيات." />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 items-end">
        <div>
          <label className={labelCls}>Sort Order</label>
          <input className={inputCls} type="number" value={values.sortOrder}
            onChange={(e) => set("sortOrder", Number.parseInt(e.target.value || "0", 10))} />
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">Lower numbers appear first.</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-[var(--color-text-primary)] py-2 cursor-pointer">
          <input type="checkbox" checked={values.isVisible}
            onChange={(e) => set("isVisible", e.target.checked)}
            className="w-4 h-4 accent-[var(--color-accent)]" />
          Visible on public collections page
        </label>
      </div>

      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={busy}
          className="px-4 py-2 rounded-lg bg-[var(--color-ink)] text-[var(--color-text-inverse)] text-sm font-medium hover:bg-[var(--color-ink-hover)] disabled:opacity-50">
          {busy ? "Saving..." : mode === "create" ? "Create Collection" : "Save Changes"}
        </button>
        <button type="button" onClick={() => router.push("/admin/collections")}
          className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]">
          Cancel
        </button>
      </div>
    </form>
  );
}