"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Images } from "lucide-react";
import VehicleGallery, { type GalleryImage } from "./VehicleGallery";
import StudioCoverStage from "./StudioCoverStage";

interface VehicleDetailGalleryProps {
  images: GalleryImage[];
  title?: string;
  fallbackSrc?: string;
}

/**
 * Detail-page photo block: standard gallery (with the opt-in per-photo
 * Original / Enhanced / Blur-plate previews) plus the opt-in "Studio Cover"
 * display mode for the primary photo.
 *
 * Everything here is presentation-only and reversible:
 *  - the studio cover is a labelled self-hosted illustration backdrop
 *    composited behind the untouched original (one tap back to the real photo);
 *  - the enhance/blur previews are additive server-side derivatives; if a
 *    derivative is missing (older uploads) or offline, the image falls back to
 *    the original automatically.
 */
export default function VehicleDetailGallery({ images, title, fallbackSrc }: VehicleDetailGalleryProps) {
  const t = useTranslations("studioCover");
  const [view, setView] = useState<"gallery" | "studio">("gallery");

  const hasPhotos = Array.isArray(images) && images.length > 0;
  const coverSrc = hasPhotos ? images[0].src : null;

  return (
    <div>
      {hasPhotos && coverSrc && (
        <div className="mb-2 flex items-center justify-between gap-3">
          <div
            role="group"
            aria-label={t("viewToggleLabel")}
            className="inline-flex items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-0.5 text-xs"
          >
            {(
              [
                { key: "gallery", label: t("galleryView") },
                { key: "studio", label: t("studioView") },
              ] as const
            ).map((opt) => (
              <button
                key={opt.key}
                type="button"
                aria-pressed={view === opt.key}
                onClick={() => setView(opt.key)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
                  view === opt.key
                    ? "bg-[var(--color-accent)] text-[var(--color-surface-dark)] font-medium"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-ink)]"
                }`}
              >
                {opt.key === "studio" && <Images size={13} />}
                {opt.label}
              </button>
            ))}
          </div>
          <p className="hidden sm:block text-xs text-[var(--color-text-secondary)]">{t("viewToggleHint")}</p>
        </div>
      )}

      {view === "studio" && coverSrc ? (
        <StudioCoverStage src={coverSrc} alt={title} onExit={() => setView("gallery")} />
      ) : (
        <VehicleGallery images={images} title={title} fallbackSrc={fallbackSrc} effects />
      )}
    </div>
  );
}
