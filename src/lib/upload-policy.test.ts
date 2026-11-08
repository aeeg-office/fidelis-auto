import { describe, expect, it } from "vitest";
import {
  validateUpload,
  cappedOriginalFilename,
  capOriginalDimensions,
  MAX_ORIGINAL_DIM,
  enhancedDerivativeFilename,
  blurredDerivativeFilename,
  plateBlurRegion,
  colorCastMatrix,
} from "./upload-policy";

describe("upload policy", () => {
  it("accepts bounded image, video, and sound uploads", () => {
    expect(validateUpload({ type: "image/jpeg", size: 2_000_000 })).toEqual({ ok: true, extension: "jpg", kind: "image" });
    expect(validateUpload({ type: "video/mp4", size: 25_000_000 })).toEqual({ ok: true, extension: "mp4", kind: "video" });
    expect(validateUpload({ type: "video/webm", size: 30_000_000 })).toEqual({ ok: true, extension: "webm", kind: "video" });
    expect(validateUpload({ type: "audio/mpeg", size: 9_000_000 })).toEqual({ ok: true, extension: "mp3", kind: "sound" });
    expect(validateUpload({ type: "audio/wav", size: 10_000_000 })).toEqual({ ok: true, extension: "wav", kind: "sound" });
    expect(validateUpload({ type: "audio/ogg", size: 500_000 })).toEqual({ ok: true, extension: "ogg", kind: "sound" });
  });

  it("rejects unknown MIME types and oversized files", () => {
    expect(validateUpload({ type: "application/pdf", size: 10 })).toEqual({ ok: false, error: "Only JPEG, PNG, WebP, AVIF, MP4, WebM, and MP3/WAV/OGG uploads are allowed." });
    expect(validateUpload({ type: "image/png", size: 10_000_001 })).toEqual({ ok: false, error: "Images must be 10 MB or smaller. Received 10.0 MB." });
    expect(validateUpload({ type: "video/mp4", size: 30_000_001 })).toEqual({ ok: false, error: "Videos must be 30 MB or smaller. Received 30.0 MB." });
    expect(validateUpload({ type: "audio/mpeg", size: 10_000_001 })).toEqual({ ok: false, error: "Sound clips must be 10 MB or smaller. Received 10.0 MB." });
  });
});

describe("capped original copy (Spec L)", () => {
  it("names the capped copy <base>-2560.webp regardless of source extension", () => {
    expect(cappedOriginalFilename("abc123.jpg")).toBe("abc123-2560.webp");
    expect(cappedOriginalFilename("abc123.png")).toBe("abc123-2560.webp");
    expect(cappedOriginalFilename("abc.123.webp")).toBe("abc.123-2560.webp");
  });

  it("leaves images exactly at the cap boundary unchanged", () => {
    expect(capOriginalDimensions(MAX_ORIGINAL_DIM, 1440)).toEqual({ width: 2560, height: 1440 });
    expect(capOriginalDimensions(1440, MAX_ORIGINAL_DIM)).toEqual({ width: 1440, height: 2560 });
  });

  it("leaves images below the cap unchanged (never upscales)", () => {
    expect(capOriginalDimensions(800, 600)).toEqual({ width: 800, height: 600 });
    expect(capOriginalDimensions(1, 1)).toEqual({ width: 1, height: 1 });
  });

  it("scales larger images down to the cap preserving the aspect ratio", () => {
    // 4000x3000 (4:3) → longest side 2560 → 2560x1920 (still 4:3).
    expect(capOriginalDimensions(4000, 3000)).toEqual({ width: 2560, height: 1920 });
    // Landscape 3000x2000 → 2560x1707 (rounds to whole pixels).
    expect(capOriginalDimensions(3000, 2000)).toEqual({ width: 2560, height: 1707 });
    // Tall portrait 2000x4000 → 1280x2560.
    expect(capOriginalDimensions(2000, 4000)).toEqual({ width: 1280, height: 2560 });
  });
});

describe("studio derivatives (enhanced / blurred)", () => {
  it("names the enhanced copy <base>-enhanced.webp regardless of source extension", () => {
    expect(enhancedDerivativeFilename("abc123.jpg")).toBe("abc123-enhanced.webp");
    expect(enhancedDerivativeFilename("abc123.png")).toBe("abc123-enhanced.webp");
    expect(enhancedDerivativeFilename("abc.123.webp")).toBe("abc.123-enhanced.webp");
  });

  it("names the blurred copy <base>-blurred.webp", () => {
    expect(blurredDerivativeFilename("abc123.jpg")).toBe("abc123-blurred.webp");
    expect(blurredDerivativeFilename("abc123.jpeg")).toBe("abc123-blurred.webp");
  });
});

describe("plate blur region heuristic", () => {
  it("picks a centred lower band for a 16:9 landscape", () => {
    const r = plateBlurRegion(1600, 900);
    expect(r).not.toBeNull();
    expect(r).toMatchObject({ left: 320, top: 702, width: 960, height: 126, sigma: 14 });
    // Region must stay inside the canvas.
    expect(r!.left + r!.width).toBeLessThanOrEqual(1600);
    expect(r!.top + r!.height).toBeLessThanOrEqual(900);
  });

  it("clamps the region inside narrow or short frames", () => {
    const portrait = plateBlurRegion(1000, 2000)!;
    expect(portrait.left + portrait.width).toBeLessThanOrEqual(1000);
    expect(portrait.top + portrait.height).toBeLessThanOrEqual(2000);
    const narrow = plateBlurRegion(300, 1200)!;
    expect(narrow.left).toBe(60);
    expect(narrow.top + narrow.height).toBeLessThanOrEqual(1200);
  });

  it("returns null for degenerate or too-small frames (nothing to blur)", () => {
    expect(plateBlurRegion(0, 100)).toBeNull();
    expect(plateBlurRegion(-5, -5)).toBeNull();
    expect(plateBlurRegion(200, 100)).toBeNull();
    expect(plateBlurRegion(80, 80)).toBeNull();
  });

  it("honours a custom sigma", () => {
    expect(plateBlurRegion(1600, 900, { sigma: 6 })?.sigma).toBe(6);
  });
});

describe("gentle gray-world colour correction", () => {
  it("returns null for a perfectly neutral sample", () => {
    expect(colorCastMatrix({ r: 120, g: 120, b: 120 })).toBeNull();
  });

  it("returns null for degenerate samples (clipped or zero channels)", () => {
    expect(colorCastMatrix({ r: 0, g: 120, b: 120 })).toBeNull();
    expect(colorCastMatrix({ r: 255, g: 128, b: 128 })).toBeNull();
    expect(colorCastMatrix({ r: NaN, g: 120, b: 120 })).toBeNull();
  });

  it("scales a warm cast toward neutral, clamped to ±4%", () => {
    // Red-heavy cast: red is boosted down, blue lifted up — softly.
    const m = colorCastMatrix({ r: 210, g: 180, b: 150 });
    expect(m).not.toBeNull();
    expect(m![0][0]).toBeCloseTo(0.96, 5);
    expect(m![1][1]).toBeCloseTo(1, 5);
    expect(m![2][2]).toBeCloseTo(1.04, 5);
  });

  it("never over-corrects an extreme cast (clamp holds)", () => {
    const m = colorCastMatrix({ r: 240, g: 100, b: 100 })!;
    expect(m[0][0]).toBe(0.96);
    expect(m[1][1]).toBe(1.04);
    expect(m[2][2]).toBe(1.04);
  });
});
