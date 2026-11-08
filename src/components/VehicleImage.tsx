"use client";

import Image from "next/image";
import type { ImageProps } from "next/image";
import { useState } from "react";

/**
 * Lightweight blur placeholder shown while the SVG placeholder loads.
 * A tiny dark data-URI so it renders fast and signals image content.
 */
const BLUR_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxMCI+PHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjEwIiBmaWxsPSIjMWExYTFhIi8+PC9zdmc+";

type VehicleImageProps = Omit<ImageProps, "unoptimized" | "placeholder" | "blurDataURL"> & {
  /**
   * Studio pipeline preview variant for /uploads/* rasters:
   *  - "enhanced" → the additive colour-corrected derivative (-enhanced.webp set)
   *  - "blurred"  → the enhanced derivative with the plate region blurred
   *    (-blurred.webp set)
   * Defaults to the original photo. If the derivative is missing (older
   * uploads) or fails offline, the image silently falls back to the original
   * — the source file is never modified by any of these variants.
   */
  variant?: "original" | "enhanced" | "blurred";
};

// /uploads/* rasters (JPEG/PNG/WebP/AVIF) are served directly by nginx, so
// next/image cannot optimize them at runtime. Every one gets a set of WebP
// derivatives named <basename>-thumb.webp / -800.webp / -1600.webp.
const RASTER_SRC_EXT = /\.(jpe?g|png|webp|avif)$/i;

/**
 * VehicleImage renders vehicle photos with responsive WebP derivatives.
 *
 * Behavior:
 *  - /uploads/* raster files → plain <img> with a WebP srcSet (thumb/800/1600)
 *    plus the original as the src fallback. Lazy-loaded by default; when
 *    `priority` is set it becomes eager with fetchpriority="high" (first/LCP).
 *  - All other sources (SVGs, external) → next/image. SVGs are deliberately
 *    not optimized (next/image can't rasterize them) and get the blur
 *    placeholder, matching prior behavior.
 */
export default function VehicleImage({
  src,
  alt,
  fill,
  priority,
  sizes,
  width,
  height,
  className,
  style,
  loading,
  fetchPriority,
  variant = "original",
  onError,
  ...rest
}: VehicleImageProps) {
  const srcStr = typeof src === "string" ? src : "";
  const isUploadRaster = srcStr.startsWith("/uploads/") && RASTER_SRC_EXT.test(srcStr);
  const isSvg = srcStr.endsWith(".svg");

  // Studio preview variants swap to the additive -enhanced / -blurred
  // derivative sets. Missing files (older uploads pre-dating the pipeline) or
  // offline failures drop back to the original photo — never a broken image.
  // Failure is keyed by (src, variant) so switching photo or variant
  // automatically returns to a fresh attempt (no effect needed).
  const [failedKey, setFailedKey] = useState<string | null>(null);
  const variantKey = `${srcStr}|${variant}`;
  const variantFailed = failedKey === variantKey;

  if (isUploadRaster) {
    const base = srcStr.replace(RASTER_SRC_EXT, "");
    const useVariant = variant !== "original" && !variantFailed;
    const variantBase = useVariant ? `${base}-${variant}` : null;
    const srcSet = variantBase
      ? `${variantBase}-thumb.webp 320w, ${variantBase}-800.webp 800w, ${variantBase}-1600.webp 1600w`
      : `${base}-thumb.webp 320w, ${base}-800.webp 800w, ${base}-1600.webp 1600w`;

    // next/image emulate `fill` for the plain <img>: absolutely position it so
    // aspect-ratio containers and object-cover cropping still work when callers
    // pass `fill` (the gallery's main view).
    let resolvedStyle = style ?? {};
    if (fill) {
      resolvedStyle = {
        ...resolvedStyle,
        position: "absolute",
        height: "100%",
        width: "100%",
        inset: "0px",
        color: "transparent",
      };
    }

    return (
      <img
        src={variantBase ?? srcStr}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        className={className}
        style={resolvedStyle}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        loading={priority ? "eager" : loading ?? "lazy"}
        fetchPriority={priority ? "high" : fetchPriority}
        decoding={priority ? "sync" : "async"}
        draggable={false}
        onError={
          variantBase || onError
            ? (e) => {
                if (variantBase) setFailedKey(variantKey);
                onError?.(e);
              }
            : undefined
        }
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      priority={priority}
      sizes={sizes}
      width={width}
      height={height}
      className={className}
      style={style}
      loading={loading}
      {...rest}
      unoptimized={isSvg}
      placeholder={isSvg ? "blur" : "empty"}
      blurDataURL={isSvg ? BLUR_PLACEHOLDER : undefined}
    />
  );
}