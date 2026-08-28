"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";

export default function OwnerPhotoManager({
  initial = [],
  max = 30,
  slug,
  onChange,
}: {
  initial?: string[];
  max?: number;
  slug?: string;
  onChange: (urls: string[]) => void;
}) {
  const [urls, setUrls] = useState<string[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFiles(files: FileList | null) {
    if (!files) return;
    const remaining = max - urls.length;
    if (remaining <= 0) {
      setError(`Maximum ${max} photos.`);
      return;
    }
    const toUpload = Array.from(files).slice(0, remaining);
    setBusy(true);
    setError("");
    const added: string[] = [];
    for (const file of toUpload) {
      const fd = new FormData();
      fd.append("file", file);
      if (slug) fd.append("slug", slug);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (res.ok) {
          const j = await res.json();
          if (j && j.url) added.push(j.url);
        } else {
          const j = await res.json().catch(() => null);
          setError(j?.error || "Upload failed");
        }
      } catch {
        setError("Upload failed");
      }
    }
    const next = [...urls, ...added];
    setUrls(next);
    onChange(next);
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeAt(i: number) {
    const next = urls.filter((_, idx) => idx !== i);
    setUrls(next);
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {urls.length === 0 && (
          <p className="text-sm text-[var(--color-text-secondary)]">No photos yet.</p>
        )}
        {urls.map((u, i) => (
          <div
            key={u}
            className="relative w-24 h-20 rounded-lg overflow-hidden border border-[var(--color-border)]"
          >
            <img src={u} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
              aria-label="Remove photo"
              title="Remove photo"
            >
              <X size={12} />
            </button>
            {i === 0 && (
              <span className="absolute bottom-1 left-1 text-[10px] bg-black/70 text-white px-1 rounded">
                Primary
              </span>
            )}
          </div>
        ))}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => uploadFiles(e.target.files)}
      />
      {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
      <button
        type="button"
        disabled={busy || urls.length >= max}
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 text-sm text-[var(--color-accent)] hover:underline disabled:opacity-40"
      >
        <Upload size={14} />
        {busy ? "Uploading…" : `Add photos (${urls.length}/${max})`}
      </button>
    </div>
  );
}