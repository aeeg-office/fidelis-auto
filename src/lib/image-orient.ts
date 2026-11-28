import sharp, { type Sharp } from "sharp";

/**
 * Photos from phones are usually stored "sideways" in pixels with an EXIF
 * Orientation tag telling viewers how to rotate them. Browsers honour the tag
 * on the original JPEG, but sharp strips metadata when it writes WebP
 * derivatives — so unless the pixels are physically rotated first, every
 * thumbnail/-800/-1600 copy comes out sideways (the live Beetle cover had
 * Orientation=6). Every image pipeline must go through this helper.
 */

/** EXIF orientations 5–8 swap width and height once applied. */
export function orientedDimensions(
  width: number,
  height: number,
  orientation: number | undefined,
): { width: number; height: number } {
  return orientation && orientation >= 5 && orientation <= 8 ? { width: height, height: width } : { width, height };
}

/** True when the file needs rotation to display upright (Orientation tag 2–8). */
export function needsOrientation(orientation: number | undefined): boolean {
  return typeof orientation === "number" && orientation > 1 && orientation <= 8;
}

/**
 * A sharp pipeline whose pixels are rotated upright (EXIF auto-orient), plus
 * the *upright* dimensions. `.rotate()` with no argument applies the EXIF
 * Orientation and drops the tag, so derivatives can never be sideways.
 */
export async function orientedSource(
  input: Buffer | string,
): Promise<{ source: Sharp; width: number; height: number; orientation: number | undefined }> {
  const meta = await sharp(input).metadata();
  if (!meta.width || !meta.height) throw new Error("Unreadable image metadata");
  const dims = orientedDimensions(meta.width, meta.height, meta.orientation);
  return { source: sharp(input).rotate(), ...dims, orientation: meta.orientation };
}
