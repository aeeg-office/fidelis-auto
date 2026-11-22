type UploadDescriptor = { type: string; size: number };
type UploadKind = "image" | "video" | "sound";
type UploadValidation =
  | { ok: true; extension: string; kind: UploadKind }
  | { ok: false; error: string };

/**
 * Strict MIME allow-list. Each entry maps a MIME type to its on-disk
 * extension, a bounded maximum size, and the media kind. The kind is the
 * source of truth for file naming and downstream handling — a client cannot
 * request that audio be stored as a video because validation derives the kind
 * from the MIME type itself (never from a caller-supplied field).
 *
 * Spec P2 free-listing media:
 *  - one video  (MP4/WebM, ~60s @ 720p, bounded at 30 MB)
 *  - one engine sound clip (MP3/WAV/OGG, bounded at 10 MB)
 */
const MIME_TYPES: Record<string, { extension: string; maximumSize: number; kind: UploadKind }> = {
  // Images — sharp still processes these downstream.
  "image/jpeg": { extension: "jpg", maximumSize: 10_000_000, kind: "image" },
  "image/png": { extension: "png", maximumSize: 10_000_000, kind: "image" },
  "image/webp": { extension: "webp", maximumSize: 10_000_000, kind: "image" },
  "image/avif": { extension: "avif", maximumSize: 10_000_000, kind: "image" },
  // Videos — bounded at 30 MB (60s 720p walkaround clips).
  "video/mp4": { extension: "mp4", maximumSize: 30_000_000, kind: "video" },
  "video/webm": { extension: "webm", maximumSize: 30_000_000, kind: "video" },
  // Engine sound clips — bounded at 10 MB. WAV/OGG aliases guarded to the same allow-list.
  "audio/mpeg": { extension: "mp3", maximumSize: 10_000_000, kind: "sound" },
  "audio/mp3": { extension: "mp3", maximumSize: 10_000_000, kind: "sound" },
  "audio/wav": { extension: "wav", maximumSize: 10_000_000, kind: "sound" },
  "audio/x-wav": { extension: "wav", maximumSize: 10_000_000, kind: "sound" },
  "audio/ogg": { extension: "ogg", maximumSize: 10_000_000, kind: "sound" },
};

const UNIT_LABEL: Record<UploadKind, string> = {
  image: "Images",
  video: "Videos",
  sound: "Sound clips",
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

// ─── Studio photo pipeline (additive derivatives) ────────────────────────────
//
// The studio pipeline writes *additional* derivative files next to the standard
// set and never touches the original:
//   <base>-enhanced.webp          gentle auto white-balance + exposure/contrast
//   <base>-enhanced-thumb/-800/-1600.webp   same correction at display widths
//   <base>-blurred.webp           enhanced copy with the plate region blurred
//   <base>-blurred-thumb/-800/-1600.webp    blurred copy at display widths
// Both variants are opt-in previews in the UI; deleting the files (or not
// generating them for old uploads) reverts every surface to the original.

/**
 * Derivative filename for the enhanced (colour-corrected) full-size copy.
 * Given `abc123.jpg` returns `abc123-enhanced.webp`.
 */
export function enhancedDerivativeFilename(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "");
  return `${base}-enhanced.webp`;
}

/**
 * Derivative filename for the enhanced + plate-blurred full-size copy.
 * Given `abc123.jpg` returns `abc123-blurred.webp`.
 */
export function blurredDerivativeFilename(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "");
  return `${base}-blurred.webp`;
}

export interface PlateBlurRegion {
  left: number;
  top: number;
  width: number;
  height: number;
  sigma: number;
}

export interface PlateBlurOptions {
  /** Gaussian blur sigma in pixels. Defaults to 14. */
  sigma?: number;
}

/**
 * Conservative plate-region heuristic: plates sit low and centred (front or
 * rear bumper). Defaults to a centred 60%-wide band that starts 78% down the
 * frame and is 14% tall, leaving a bumper margin below. The region is clamped
 * to the canvas; returns `null` when the image is too small for a meaningful
 * blur band (nothing to blur), so callers can skip cleanly.
 */
export function plateBlurRegion(
  width: number,
  height: number,
  opts: PlateBlurOptions = {}
): PlateBlurRegion | null {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null;
  const MIN_REGION_PX = 24;
  const regionWidth = Math.round(width * 0.6);
  const regionHeight = Math.round(height * 0.14);
  if (regionWidth < MIN_REGION_PX || regionHeight < MIN_REGION_PX) return null;
  const clampedLeft = Math.max(0, Math.min(Math.round(width * 0.2), width - regionWidth));
  const clampedTop = Math.max(0, Math.min(Math.round(height * 0.78), height - regionHeight));
  return {
    left: clampedLeft,
    top: clampedTop,
    width: regionWidth,
    height: regionHeight,
    sigma: opts.sigma ?? 14,
  };
}

export interface ChannelMeans {
  r: number;
  g: number;
  b: number;
}

/** A 3×3 channel-scaling matrix compatible with sharp's `recomb` (Matrix3x3). */
export type ColorBalanceMatrix = [[number, number, number], [number, number, number], [number, number, number]];

/**
 * Diagonal 3×3 recomb matrix for a *gentle* gray-world white-balance: each
 * channel is scaled toward the mean of all three, clamped to ±4% so a strong
 * cast is softened rather than rewritten (nothing fabricated). Returns `null`
 * when the sample is neutral or degenerate so callers can skip the recomb.
 */
export function colorCastMatrix(means: ChannelMeans): ColorBalanceMatrix | null {
  const { r, g, b } = means;
  if (![r, g, b].every((v) => Number.isFinite(v) && v > 1 && v < 254)) return null;
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  const target = (r + g + b) / 3;
  const ratios = [target / r, target / g, target / b].map((x) => clamp(x, 0.96, 1.04));
  if (ratios.every((x) => Math.abs(x - 1) < 0.005)) return null;
  return [
    [ratios[0], 0, 0],
    [0, ratios[1], 0],
    [0, 0, ratios[2]],
  ];
}

export function validateUpload(file: UploadDescriptor): UploadValidation {
  const definition = MIME_TYPES[file.type];
  if (!definition) {
    return {
      ok: false,
      error: "Only JPEG, PNG, WebP, AVIF, MP4, WebM, and MP3/WAV/OGG uploads are allowed.",
    };
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
  return { ok: true, extension: definition.extension, kind: definition.kind };
}
/**
 * Server-side content sniffing for uploads (2026-11-22 audit fix).
 *
 * `validateUpload` only sees the client-supplied MIME type and filename, both of
 * which an attacker controls. An executable renamed `photo.png` with
 * `Content-Type: image/png` therefore passed validation and was written to
 * /uploads. This checks the actual leading bytes and rejects anything that is not
 * a real image/video/audio container, and rejects any file whose sniffed kind
 * disagrees with the declared kind.
 */
export type SniffedKind = "image" | "video" | "audio";

function startsWith(buffer: Buffer, bytes: number[], offset = 0): boolean {
  if (buffer.length < offset + bytes.length) return false;
  return bytes.every((b, i) => buffer[offset + i] === b);
}

function asciiAt(buffer: Buffer, offset: number, text: string): boolean {
  if (buffer.length < offset + text.length) return false;
  return buffer.toString("latin1", offset, offset + text.length) === text;
}

export function sniffUploadBytes(buffer: Buffer): { ok: true; kind: SniffedKind } | { ok: false; error: string } {
  if (buffer.length < 12) {
    return { ok: false, error: "The uploaded file is too small to be a valid image, video or audio file." };
  }

  // Explicitly rejected containers / payloads (defence in depth).
  if (startsWith(buffer, [0x4d, 0x5a])) return { ok: false, error: "Executable files are not allowed." };          // MZ / PE
  if (startsWith(buffer, [0x7f, 0x45, 0x4c, 0x46])) return { ok: false, error: "Executable files are not allowed." }; // ELF
  if (startsWith(buffer, [0xca, 0xfe, 0xba, 0xbe])) return { ok: false, error: "Executable files are not allowed." }; // Mach-O fat
  if (startsWith(buffer, [0x23, 0x21])) return { ok: false, error: "Script files are not allowed." };               // #!
  const first = buffer[0];
  if (first === 0x3c) return { ok: false, error: "Markup files (HTML/SVG) are not allowed." };                      // '<'

  // Images
  if (startsWith(buffer, [0xff, 0xd8, 0xff])) return { ok: true, kind: "image" };                                   // JPEG
  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { ok: true, kind: "image" };    // PNG
  if (asciiAt(buffer, 0, "RIFF") && asciiAt(buffer, 8, "WEBP")) return { ok: true, kind: "image" };                 // WebP
  if (asciiAt(buffer, 4, "ftyp")) {                                                                                 // ISO-BMFF
    const brand = buffer.toString("latin1", 8, 12);
    if (["avif", "avis", "heic", "heix", "mif1", "msf1"].includes(brand)) return { ok: true, kind: "image" };
    return { ok: true, kind: "video" };                                                                             // mp4 / mov
  }
  if (startsWith(buffer, [0x1a, 0x45, 0xdf, 0xa3])) return { ok: true, kind: "video" };                              // Matroska/WebM

  // Audio
  if (asciiAt(buffer, 0, "RIFF") && asciiAt(buffer, 8, "WAVE")) return { ok: true, kind: "audio" };
  if (asciiAt(buffer, 0, "OggS")) return { ok: true, kind: "audio" };
  if (asciiAt(buffer, 0, "ID3")) return { ok: true, kind: "audio" };                                                // MP3 with ID3
  if (first === 0xff && (buffer[1] & 0xe0) === 0xe0) return { ok: true, kind: "audio" };                            // MPEG frame sync

  return { ok: false, error: "File content is not a recognised image, video or audio format." };
}
