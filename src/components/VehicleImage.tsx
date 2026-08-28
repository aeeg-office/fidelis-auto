"use client";

import { useState } from "react";
import Image from "next/image";
import type { ImageProps } from "next/image";

/**
 * Lightweight blur placeholder shown while the SVG placeholder loads.
 * A tiny dark data-URI so it renders fast and signals image content.
 */
const BLUR_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxMCI+PHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjEwIiBmaWxsPSIjMWExYTFhIi8+PC9zdmc+";

/** Neutral car silhouette shown when the real photo file is missing (404/broken). */
const FALLBACK_CAR_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
    <rect width="800" height="500" fill="#1a1a1a"/>
    <g opacity="0.85">
      <path d="M160 320 L220 220 Q235 185 275 182 L560 182 Q600 185 615 220 L665 320 Z" fill="none" stroke="#c9c9c9" stroke-width="6" stroke-linejoin="round"/>
      <circle cx="260" cy="330" r="38" fill="none" stroke="#c9c9c9" stroke-width="6"/>
      <circle cx="560" cy="330" r="38" fill="none" stroke="#c9c9c9" stroke-width="6"/>
      <rect x="240" y="240" width="130" height="70" rx="8" fill="#3a3a3a"/>
      <rect x="400" y="240" width="130" height="70" rx="8" fill="#3a3a3a"/>
    </g>
    <text x="400" y="430" text-anchor="middle" font-family="sans-serif" font-size="26" fill="#8a8a8a">Image unavailable</text>
  </svg>`,
)}`;

type VehicleImageProps = Omit<ImageProps, "unoptimized" | "placeholder" | "blurDataURL" | "onError">;

/**
 * VehicleImage wraps next/Image with SVG-placeholder awareness and a
 * broken-file fallback.
 *
 * - SVG placeholders are served unoptimized (next/image cannot shape them).
 * - If the referenced file is missing (e.g. a photo row whose file was lost),
 *   onError swaps in a neutral car silhouette instead of a broken <img>.
 */
export default function VehicleImage({ alt, src, ...rest }: VehicleImageProps) {
  const srcStr = typeof src === "string" ? src : "";
  const isSvg = srcStr.endsWith(".svg");
  const [failed, setFailed] = useState(false);

  const effectiveSrc = failed ? FALLBACK_CAR_SVG : src;
  const effectiveIsSvg = failed || isSvg;

  return (
    <Image
      src={effectiveSrc}
      alt={alt}
      {...rest}
      onError={() => setFailed(true)}
      unoptimized={effectiveIsSvg}
      placeholder={effectiveIsSvg ? "blur" : "empty"}
      blurDataURL={effectiveIsSvg ? BLUR_PLACEHOLDER : undefined}
    />
  );
}