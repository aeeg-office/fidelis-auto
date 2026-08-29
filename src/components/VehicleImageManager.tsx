"use client";

import { useRef, useState } from "react";
import { Crown, GripVertical, Pencil, Plus, Upload, X } from "lucide-react";

export interface ManagerImage {
  /** Existing VehicleImage id (null for brand-new uploads). */
  id?: string | null;
  src: string;
  /** True when this is the cover image. */
  cover?: boolean;
}

interface VehicleImageManagerProps {
  /** Vehicle id (informational; persistence is handled by the parent form). */
  vehicleId?: string;
  slug?: string;
  initial?: ManagerImage[];
  max?: number;
  onChange: (ordered: ManagerImage[]) => void;
}

/**
 * Seller-facing image manager for a published vehicle:
 *  - Previews every image before save
 *  - Set cover image (crown marker)
 *  - Drag-and-drop reorder (HTML5, works with touch via pointer-friendly buttons + arrows)
 *  - Delete image
 *  - Replace an image (remove + upload new in its place)
 *  - Add photos (multi)
 *
 * Emits the full ordered list via onChange; the parent persists it with
 * PATCH /api/my-vehicle/[id] (which syncs isPrimary + sortOrder + deletes removed).
 */
export default function VehicleImageManager({
  slug,
  initial = [],
  max = 30,
  onChange,
}: VehicleImageManagerProps) {
  const [items, setItems] = useState<ManagerImage[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const addInputRef = useRef<HTMLInputElement>(null);
  const replaceRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const emit = (next: ManagerImage[]) => {
    setItems(next);
    onChange(next);
  };

  async function uploadFiles(files: FileList | null, atIdx: number | null, replace: boolean) {
    if (!files) return;
    const room = max - items.length + (replace ? 1 : 0);
    if (!replace && room <= 0) {
      setError(`Maximum ${max} photos.`);
      return;
    }
    setBusy(true);
    setError("");
    const toUpload = Array.from(files).slice(0, replace ? 1 : room);
    const uploaded: ManagerImage[] = [];
    for (const file of toUpload) {
      const fd = new FormData();
      fd.append("file", file);
      if (slug) fd.append("slug", slug);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (res.ok) {
          const j = await res.json();
          if (j && j.url) uploaded.push({ src: j.url });
        } else {
          const j = await res.json().catch(() => null);
          setError(j?.error || "Upload failed");
        }
      } catch {
        setError("Upload failed");
      }
    }
    if (uploaded.length === 0) {
      setBusy(false);
      return;
    }
    if (replace && atIdx !== null) {
      const next = [...items];
      // Replace the existing slot but keep its cover flag.
      const wasCover = next[atIdx]?.cover;
      next[atIdx] = { src: uploaded[0].src, cover: wasCover };
      emit(next);
    } else {
      emit([...items, ...uploaded]);
    }
    setBusy(false);
    if (atIdx !== null && replaceRefs.current[atIdx]) replaceRefs.current[atIdx]!.value = "";
    if (addInputRef.current) addInputRef.current.value = "";
  }

  function setCover(i: number) {
    emit(items.map((it, idx) => ({ ...it, cover: idx === i })));
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= items.length || from === to) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    emit(next);
  }

  function removeAt(i: number) {
    emit(items.filter((_, idx) => idx !== i));
  }

  function onDragStart(i: number) {
    setDragIdx(i);
  }
  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
  }
  function onDrop(e: React.DragEvent, to: number) {
    e.preventDefault();
    if (dragIdx === null) return;
    move(dragIdx, to);
    setDragIdx(null);
  }

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="text-sm text-[var(--color-text-secondary)]">No photos yet.</p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((it, i) => (
          <div
            key={it.src + i}
            draggable
            onDragStart={() => onDragStart(i)}
            onDragOver={(e) => onDragOver(e)}
            onDrop={(e) => onDrop(e, i)}
            className={`group relative aspect-[4/3] rounded-lg overflow-hidden border hover:ring-2 hover:ring-[var(--color-accent)]/40 transition-all ${
              dragIdx === i ? "opacity-50 scale-95" : ""
            } ${it.cover ? "border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/40" : "border-[var(--color-border)]"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={it.src} alt="" className="w-full h-full object-cover" />

            {/* Cover badge */}
            {it.cover && (
              <span className="absolute top-1 left-1 bg-[var(--color-accent)] text-[var(--color-surface-dark)] text-[10px] font-semibold px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 z-10">
                <Crown size={10} /> Cover
              </span>
            )}

            {/* Drag handle */}
            <span className="absolute top-1 right-1 text-white/70 bg-black/40 rounded p-0.5 cursor-grab opacity-0 group-hover:opacity-100 z-10">
              <GripVertical size={12} />
            </span>

            {/* Reorder arrows */}
            <div className="absolute bottom-1 left-1 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                disabled={i === 0}
                onClick={() => move(i, i - 1)}
                aria-label="Move left"
                className="bg-black/60 text-white text-xs px-1.5 py-0.5 rounded disabled:opacity-30"
              >
                ←
              </button>
              <button
                type="button"
                disabled={i === items.length - 1}
                onClick={() => move(i, i + 1)}
                aria-label="Move right"
                className="bg-black/60 text-white text-xs px-1.5 py-0.5 rounded disabled:opacity-30"
              >
                →
              </button>
            </div>

            {/* Actions */}
            <div className="absolute inset-x-0 bottom-0 p-1 flex items-center justify-center gap-1 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              {!it.cover && (
                <button
                  type="button"
                  onClick={() => setCover(i)}
                  className="inline-flex items-center gap-1 text-[10px] bg-[var(--color-accent)] text-[var(--color-surface-dark)] px-1.5 py-0.5 rounded"
                >
                  <Crown size={10} /> Set cover
                </button>
              )}
            </div>

            {/* Replace */}
            <input
              ref={(el) => { replaceRefs.current[i] = el; }}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => uploadFiles(e.target.files, i, true)}
            />
            <button
              type="button"
              onClick={() => replaceRefs.current[i]?.click()}
              aria-label="Replace photo"
              className="absolute -top-1.5 -left-1.5 z-20 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Pencil size={11} />
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={() => removeAt(i)}
              aria-label="Remove photo"
              className="absolute -top-1.5 -right-1.5 z-20 bg-[var(--color-error)] text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={11} />
            </button>
          </div>
        ))}

        {/* Add tile */}
        {items.length < max && (
          <button
            type="button"
            disabled={busy}
            onClick={() => addInputRef.current?.click()}
            className="aspect-[4/3] flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors disabled:opacity-40"
          >
            <Upload size={18} />
            <span className="text-xs">{busy ? "Uploading…" : `Add (${items.length}/${max})`}</span>
          </button>
        )}
      </div>

      <input
        ref={addInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => uploadFiles(e.target.files, null, false)}
      />
      <p className="text-xs text-[var(--color-text-secondary)]">
        Drag to reorder · hover an image to set cover, replace, or remove. The cover shows on the home page, listings, cards, and social previews.
      </p>
      <div className="flex items-center gap-2">
        <Plus size={14} className="text-[var(--color-accent)]" />
        <button
          type="button"
          disabled={busy || items.length >= max}
          onClick={() => addInputRef.current?.click()}
          className="text-sm text-[var(--color-accent)] hover:underline disabled:opacity-40 inline-flex items-center gap-1"
        >
          <Upload size={14} /> Add photos
        </button>
      </div>
      {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
    </div>
  );
}