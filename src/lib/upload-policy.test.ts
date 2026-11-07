import { describe, expect, it } from "vitest";
import { validateUpload, cappedOriginalFilename, capOriginalDimensions, MAX_ORIGINAL_DIM } from "./upload-policy";

describe("upload policy", () => {
  it("accepts bounded image and video uploads", () => {
    expect(validateUpload({ type: "image/jpeg", size: 2_000_000 })).toEqual({ ok: true, extension: "jpg" });
    expect(validateUpload({ type: "video/mp4", size: 80_000_000 })).toEqual({ ok: true, extension: "mp4" });
  });

  it("rejects unknown MIME types and oversized files", () => {
    expect(validateUpload({ type: "application/pdf", size: 10 })).toEqual({ ok: false, error: "Only JPEG, PNG, WebP, AVIF, MP4, and WebM uploads are allowed." });
    expect(validateUpload({ type: "image/png", size: 10_000_001 })).toEqual({ ok: false, error: "Images must be 10 MB or smaller. Received 10.0 MB." });
    expect(validateUpload({ type: "video/mp4", size: 100_000_001 })).toEqual({ ok: false, error: "Videos must be 100 MB or smaller. Received 100.0 MB." });
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
