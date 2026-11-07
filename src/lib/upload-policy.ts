type UploadDescriptor = { type: string; size: number };
type UploadValidation = { ok: true; extension: string } | { ok: false; error: string };

const MIME_TYPES: Record<string, { extension: string; maximumSize: number; kind: "image" | "video" }> = {
  "image/jpeg": { extension: "jpg", maximumSize: 10_000_000, kind: "image" },
  "image/png": { extension: "png", maximumSize: 10_000_000, kind: "image" },
  "image/webp": { extension: "webp", maximumSize: 10_000_000, kind: "image" },
  "image/avif": { extension: "avif", maximumSize: 10_000_000, kind: "image" },
  "video/mp4": { extension: "mp4", maximumSize: 100_000_000, kind: "video" },
  "video/webm": { extension: "webm", maximumSize: 100_000_000, kind: "video" },
};

const UNIT_LABEL: Record<"image" | "video", string> = {
  image: "Images",
  video: "Videos",
};

/**
 * Cap for the persisted original raster, in pixels on the longest side.
 *
 * Spec L ("Automatic compression to WebP sizes ... plus a capped original copy
 * (about 2,560 px)"): the stored original must never exceed this bound so a
 * huge full-resolution master is never served or kept. A raster larger on its
 * longest side than MAX_ORIGINAL_DIM is scaled down (aspect preserved, never
 * enlarged) to a WebP copy named `<base>-2560.webp` stored alongside the
 * original; images already at or below the cap are left untouched.
 */
export const MAX_ORIGINAL_DIM = 2560;

/**
 * Compute the capped-original copy's filename for a given upload filename.
 *
 * Given an original such as `abc123.jpg`, returns `abc123-2560.webp` — the
 * WebP variant capped to MAX_ORIGINAL_DIM px on its longest side. Used by the
 * upload pipeline and the WebP backfill so new and existing uploads converge on
 * the same naming scheme.
 */
export function cappedOriginalFilename(filename: string, maxDim: number = MAX_ORIGINAL_DIM): string {
  const base = filename.replace(/\.[^.]+$/, "");
  return `${base}-${maxDim}.webp`;
}

/**
 * Scale a raster's (width, height) to fit within `maxDim` px on the longest
 * side, preserving aspect ratio and never upscaling. Images already within the
 * cap are returned unchanged. Dimensions are rounded to whole pixels (>= 1).
 */
export function capOriginalDimensions(
  width: number,
  height: number,
  maxDim: number = MAX_ORIGINAL_DIM
): { width: number; height: number } {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return { width, height };
  }
  const longest = Math.max(width, height);
  if (longest <= maxDim) return { width, height };
  const scale = maxDim / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export function validateUpload(file: UploadDescriptor): UploadValidation {
  const definition = MIME_TYPES[file.type];
  if (!definition) {
    return { ok: false, error: "Only JPEG, PNG, WebP, AVIF, MP4, and WebM uploads are allowed." };
  }
  if (!Number.isFinite(file.size) || file.size <= 0) {
    return { ok: false, error: "The uploaded file is empty or invalid." };
  }
  if (file.size > definition.maximumSize) {
    const limitMb = (definition.maximumSize / 1_000_000).toFixed(0);
    const receivedMb = (file.size / 1_000_000).toFixed(1);
    return {
      ok: false,
      error: `${UNIT_LABEL[definition.kind]} must be ${limitMb} MB or smaller. Received ${receivedMb} MB.`,
    };
  }
  return { ok: true, extension: definition.extension };
}