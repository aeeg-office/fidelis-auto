import Image from "next/image";
import type { ImageProps } from "next/image";

/**
 * Lightweight blur placeholder shown while the SVG placeholder loads.
 * A tiny dark data-URI so it renders fast and signals image content.
 */
const BLUR_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxMCI+PHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjEwIiBmaWxsPSIjMWExYTFhIi8+PC9zdmc+";

type VehicleImageProps = Omit<ImageProps, "unoptimized" | "placeholder" | "blurDataURL">;

/**
 * VehicleImage wraps next/Image with SVG-placeholder awareness.
 *
 * SVG placeholder images cannot be optimized by next/image, so this component
 * sets `unoptimized={true}` for SVGs and provides a subtle blur placeholder.
 * When real raster images replace the SVGs, remove the `unoptimized` and
 * `placeholder` overrides — or simply switch to a direct <Image> import.
 */
export default function VehicleImage({ alt, src, ...rest }: VehicleImageProps) {
  const srcStr = typeof src === "string" ? src : "";
  const isSvg = srcStr.endsWith(".svg");

  return (
    <Image
      src={src}
      alt={alt}
      {...rest}
      unoptimized={isSvg}
      placeholder={isSvg ? "blur" : "empty"}
      blurDataURL={isSvg ? BLUR_PLACEHOLDER : undefined}
    />
  );
}