import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { needsOrientation, orientedDimensions, orientedSource } from "./image-orient";

/** A 40×20 landscape JPEG whose EXIF says "rotate 90° CW to view" (like the live Beetle photo). */
async function sidewaysJpeg(orientation: number): Promise<Buffer> {
  return sharp({ create: { width: 40, height: 20, channels: 3, background: { r: 200, g: 30, b: 30 } } })
    .jpeg()
    .withMetadata({ orientation })
    .toBuffer();
}

describe("orientedDimensions / needsOrientation", () => {
  it("swaps width and height for orientations 5–8 only", () => {
    expect(orientedDimensions(4000, 2252, 6)).toEqual({ width: 2252, height: 4000 });
    expect(orientedDimensions(4000, 2252, 1)).toEqual({ width: 4000, height: 2252 });
    expect(orientedDimensions(4000, 2252, undefined)).toEqual({ width: 4000, height: 2252 });
  });
  it("flags tags 2–8 as needing rotation", () => {
    expect(needsOrientation(6)).toBe(true);
    expect(needsOrientation(1)).toBe(false);
    expect(needsOrientation(undefined)).toBe(false);
  });
});

describe("orientedSource", () => {
  it("writes derivatives with upright pixels and no leftover orientation tag", async () => {
    const input = await sidewaysJpeg(6);
    const { source, width, height } = await orientedSource(input);
    expect({ width, height }).toEqual({ width: 20, height: 40 });

    const out = await source.clone().resize({ width: 10, fit: "inside" }).webp().toBuffer();
    const meta = await sharp(out).metadata();
    expect(meta.width).toBe(10);
    expect(meta.height).toBe(20); // portrait — upright, not sideways
    expect(meta.orientation ?? 1).toBe(1);
  });

  it("leaves already-upright images unchanged", async () => {
    const input = await sidewaysJpeg(1);
    const { width, height } = await orientedSource(input);
    expect({ width, height }).toEqual({ width: 40, height: 20 });
  });
});
