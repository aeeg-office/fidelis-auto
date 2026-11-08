import { copyFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import {
  MAX_ORIGINAL_DIM,
  capOriginalDimensions,
  enhancedDerivativeFilename,
  blurredDerivativeFilename,
  plateBlurRegion,
  colorCastMatrix,
  type ChannelMeans,
} from "./upload-policy";

// ─── Studio / photo-enhancement derivatives ───────────────────────────────────
//
// Additive, reversible, and never destructive:
//  - `<base>-enhanced.webp` (+ -thumb/-800/-1600): a GENTLE auto white-balance
//    (gray-world recomb, ±4% clamp) plus slight exposure/contrast. Every
//    variant derives from the original upload buffer only — the stored source
//    file is never read or rewritten here.
//  - `<base>-blurred.webp` (+ -thumb/-800/-1600): the enhanced copy with a
//    heuristic plate region gaussian-blurred (plateBlurRegion). The region is
//    *selected* (lower-centre band), not detected — it is a preview aid,
//    clearly labelled in the UI, and the UI immediately falls back to the
//    original if the derivative is missing or offline.
//
// Both sets are invoked from the upload route inside their own try/catch, so a
// failure here can never fail the upload or disturb the standard WebP pipeline.

/** Mean per RGB channel over a raw sample buffer (rows of 3). */
function channelMeans(raw: Buffer): ChannelMeans {
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  for (let i = 0; i + 2 < raw.length; i += 3) {
    r += raw[i];
    g += raw[i + 1];
    b += raw[i + 2];
    n += 1;
  }
  if (n === 0) return { r: 0, g: 0, b: 0 };
  return { r: r / n, g: g / n, b: b / n };
}

/** Scale sigma for a reduced-size derivative (blur strength tracks pixel size). */
function scaledSigma(baseSigma: number, sourceLongest: number, targetLongest: number): number {
  if (!Number.isFinite(targetLongest) || targetLongest <= 0) return baseSigma;
  return Math.max(5, Math.round(baseSigma * (targetLongest / sourceLongest)));
}

export async function generateStudioDerivatives(buffer: Buffer, uploadDir: string, filename: string): Promise<void> {
  const base = filename.replace(/\.[^.]+$/, "");
  const source = sharp(buffer);
  const meta = await source.metadata();
  if (!meta.width || !meta.height) return;

  // Gentle gray-world white-balance: sample a tiny preview, derive a clamped
  // per-channel correction, then apply with a slight exposure/saturation lift
  // and a light contrast curve. Gains are deliberately small (see
  // colorCastMatrix) — this corrects, it never reinvents the photo.
  const sample = await source
    .clone()
    .resize({ width: 64, height: 64, fit: "inside", withoutEnlargement: true })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const matrix = colorCastMatrix(channelMeans(sample.data));
  let enhanced = source.clone();
  if (matrix) enhanced = enhanced.recomb(matrix);
  enhanced = enhanced
    .modulate({ brightness: 1.03, saturation: 1.05 })
    .linear(1.06, -128 * 0.06); // contrast pivot: out = in*1.06 − 7.68

  const longSide = Math.max(meta.width, meta.height);
  const capped = capOriginalDimensions(meta.width, meta.height, MAX_ORIGINAL_DIM);

  // Full-size enhanced copy.
  await enhanced
    .clone()
    .resize({ width: capped.width, height: capped.height, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 84 })
    .toFile(path.join(uploadDir, enhancedDerivativeFilename(filename)));

  // Display-width enhanced copies (mirror the standard -thumb/-800/-1600 set).
  const DISPLAY_WIDTHS = [
    { suffix: "-enhanced-thumb", width: 320 },
    { suffix: "-enhanced-800", width: 800 },
    { suffix: "-enhanced-1600", width: 1600 },
  ];
  for (const d of DISPLAY_WIDTHS) {
    await enhanced
      .clone()
      .resize({ width: d.width, withoutEnlargement: true, fit: "inside" })
      .webp({ quality: 82 })
      .toFile(path.join(uploadDir, `${base}${d.suffix}.webp`));
  }

  // Plate blur on the enhanced path: blur the selected region, composite back,
  // then encode once (no double-lossy re-encode of the whole frame).
  const BLURRED_WIDTHS = [
    { suffix: "-blurred-thumb", width: 320 },
    { suffix: "-blurred-800", width: 800 },
    { suffix: "-blurred-1600", width: 1600 },
  ];
  const region = plateBlurRegion(capped.width, capped.height);
  const blurredFull = path.join(uploadDir, blurredDerivativeFilename(filename));
  if (region) {
    const blurredBand = await enhanced
      .clone()
      .resize({ width: capped.width, height: capped.height, fit: "inside", withoutEnlargement: true })
      .extract(region)
      .blur({ sigma: region.sigma })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    await enhanced
      .clone()
      .resize({ width: capped.width, height: capped.height, fit: "inside", withoutEnlargement: true })
      .composite([
        {
          input: blurredBand.data,
          raw: { width: blurredBand.info.width, height: blurredBand.info.height, channels: blurredBand.info.channels },
          left: region.left,
          top: region.top,
        },
      ])
      .webp({ quality: 84 })
      .toFile(blurredFull);
  } else {
    // Frame too small for a meaningful plate blur: ship an exact copy of the
    // enhanced file under the blurred name, so the UI toggle still resolves
    // (and its label already explains the blur is region-based).
    await copyFile(path.join(uploadDir, enhancedDerivativeFilename(filename)), blurredFull);
  }

  // Display-width blurred copies. For frames (or widths) too small to host a
  // meaningful blur band, emit the enhanced-corrected copy instead so the
  // srcset stays consistent — the full-size blurred file carries the effect.
  for (const d of BLURRED_WIDTHS) {
    const dims = capOriginalDimensions(meta.width, meta.height, d.width);
    const smallRegion = plateBlurRegion(dims.width, dims.height, {
      sigma: scaledSigma(region?.sigma ?? 14, longSide, d.width),
    });
    if (!smallRegion) {
      await enhanced
        .clone()
        .resize({ width: dims.width, height: dims.height, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(path.join(uploadDir, `${base}${d.suffix}.webp`));
      continue;
    }
    const blurredSmall = await enhanced
      .clone()
      .resize({ width: dims.width, height: dims.height, fit: "inside", withoutEnlargement: true })
      .extract(smallRegion)
      .blur({ sigma: smallRegion.sigma })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    await enhanced
      .clone()
      .resize({ width: dims.width, height: dims.height, fit: "inside", withoutEnlargement: true })
      .composite([
        {
          input: blurredSmall.data,
          raw: {
            width: blurredSmall.info.width,
            height: blurredSmall.info.height,
            channels: blurredSmall.info.channels,
          },
          left: smallRegion.left,
          top: smallRegion.top,
        },
      ])
      .webp({ quality: 82 })
      .toFile(path.join(uploadDir, `${base}${d.suffix}.webp`));
  }
}
