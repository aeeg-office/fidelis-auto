"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import VehicleImage from "./VehicleImage";

export interface GalleryImage {
  src: string;
  alt?: string | null;
}

interface VehicleGalleryProps {
  images: GalleryImage[];
  /** Vehicle title, used for alt text and lightbox heading. */
  title?: string;
  /** Fallback shown when no images exist (e.g. slug placeholder). */
  fallbackSrc?: string;
}

/**
 * Responsive vehicle photo gallery.
 *
 * Features:
 *  - Main image with crossfade transition on change
 *  - Thumbnail strip (horizontally scrollable; active thumb auto-scrolls into view)
 *  - Prev / Next controls on desktop
 *  - Swipe support on touch devices (also works with mouse drag)
 *  - Keyboard navigation (← / → / Esc)
 *  - Full-screen lightbox with its own Prev / Next / Close / Esc
 *  - Lazy loading for off-screen images
 *  - Optimized thumbnails via small next/image widths
 */
export default function VehicleGallery({
  images: propImages,
  title = "Vehicle",
  fallbackSrc,
}: VehicleGalleryProps) {
  const images = useMemo(
    () =>
      Array.isArray(propImages)
        ? propImages.filter((i) => i && typeof i.src === "string")
        : [],
    [propImages],
  );

  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const thumbRef = useRef<HTMLDivElement>(null);
  const activeThumbRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);

  const total = images.length;
  // Derive a safe index at render (avoids setState-in-effect when total shrinks).
  const index = total === 0 ? 0 : Math.min(active, total - 1);

  const goTo = useCallback((n: number) => {
    if (total === 0) return;
    setActive(((n % total) + total) % total);
  }, [total]);

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // Keep the active thumbnail visible.
  useEffect(() => {
    activeThumbRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [index]);

  // Keyboard navigation (close lightbox on Escape).
  useEffect(() => {
    if (total < 2 && !lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxOpen(false);
        return;
      }
      if (!lightboxOpen) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(index + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(index - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, index, goTo, total]);

  // Touch + mouse drag swipe on the main image area.
  const handlePointerDown = (e: React.PointerEvent) => {
    touchX.current = e.clientX;
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    if (touchX.current === null) return;
    const dx = e.clientX - touchX.current;
    if (Math.abs(dx) > 48) {
      if (dx < 0) goTo(index + 1);
      else goTo(index - 1);
    }
    touchX.current = null;
  };

  if (total === 0) {
    return (
      <div className="relative aspect-[21/9] bg-[var(--color-surface-dark)] rounded-lg overflow-hidden">
        <VehicleImage
          src={fallbackSrc || `/images/placeholder-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.svg`}
          alt={title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 90vw"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <>
      <div className="mb-3">
        {/* Main image */}
        <div
          key={images[index].src}
          className="relative aspect-[21/9] bg-[var(--color-surface-dark)] rounded-lg overflow-hidden cursor-zoom-in select-none"
          onClick={() => setLightboxOpen(true)}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          <VehicleImage
            src={images[index].src}
            alt={images[index].alt || `${title} — photo ${index + 1}`}
            fill
            priority={index === 0}
            sizes="(max-width: 768px) 100vw, 90vw"
            className="object-cover transition-transform duration-200 animate-[fadeIn_.25s_ease]"
          />
          {/* Counter */}
          <span className="absolute bottom-3 left-3 z-10 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
            {index + 1} / {total}
          </span>
          {/* Zoom affordance */}
          <span className="absolute bottom-3 right-3 z-10 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full inline-flex items-center gap-1">
            <ZoomIn size={12} /> Full screen
          </span>

          {/* Prev / Next controls */}
          {total > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/85 text-white rounded-full p-2 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/85 text-white rounded-full p-2 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        {total > 1 && (
          <div
            ref={thumbRef}
            className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-thin"
          >
            {images.map((img, i) => (
              <button
                key={img.src + i}
                ref={i === index ? activeThumbRef : undefined}
                type="button"
                aria-label={`View photo ${i + 1}`}
                aria-current={i === index}
                onClick={() => goTo(i)}
                className={`relative w-24 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                  i === index
                    ? "border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/30"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <VehicleImage
                  src={img.src}
                  alt=""
                  fill
                  loading={i === index ? "eager" : "lazy"}
                  sizes="96px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} gallery`}
          className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            aria-label="Close full screen"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 text-white/80 hover:text-white p-2"
          >
            <X size={28} />
          </button>

          <div
            className="relative max-w-[92vw] max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {total > 1 && (
              <button
                type="button"
                aria-label="Previous photo"
                onClick={prev}
                className="absolute -left-2 z-10 bg-black/40 hover:bg-black/70 text-white rounded-full p-3 transition-colors"
              >
                <ChevronLeft size={28} />
              </button>
            )}
            <VehicleImage
              src={images[index].src}
              alt={images[index].alt || `${title} — photo ${index + 1}`}
              className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded"
              sizes="90vw"
            />
            {total > 1 && (
              <button
                type="button"
                aria-label="Next photo"
                onClick={next}
                className="absolute -right-2 z-10 bg-black/40 hover:bg-black/70 text-white rounded-full p-3 transition-colors"
              >
                <ChevronRight size={28} />
              </button>
            )}
          </div>

          <p className="text-white/70 text-sm mt-4">
            {title} — {index + 1} / {total}
          </p>
        </div>
      )}
    </>
  );
}
