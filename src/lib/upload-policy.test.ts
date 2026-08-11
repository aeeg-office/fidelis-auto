import { describe, expect, it } from "vitest";
import { validateUpload } from "./upload-policy";

describe("upload policy", () => {
  it("accepts bounded image and video uploads", () => {
    expect(validateUpload({ type: "image/jpeg", size: 2_000_000 })).toEqual({ ok: true, extension: "jpg" });
    expect(validateUpload({ type: "video/mp4", size: 80_000_000 })).toEqual({ ok: true, extension: "mp4" });
  });

  it("rejects unknown MIME types and oversized files", () => {
    expect(validateUpload({ type: "application/pdf", size: 10 })).toEqual({ ok: false, error: "Only JPEG, PNG, WebP, AVIF, MP4, and WebM uploads are allowed." });
    expect(validateUpload({ type: "image/png", size: 10_000_001 })).toEqual({ ok: false, error: "Images must be 10 MB or smaller." });
    expect(validateUpload({ type: "video/mp4", size: 100_000_001 })).toEqual({ ok: false, error: "Videos must be 100 MB or smaller." });
  });
});
