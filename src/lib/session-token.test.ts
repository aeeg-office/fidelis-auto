import { describe, expect, it } from "vitest";
import { createOpaqueSessionToken, hashSessionToken } from "./session-token";

describe("opaque session tokens", () => {
  it("creates high-entropy opaque values and hashes deterministically", () => {
    const first = createOpaqueSessionToken();
    const second = createOpaqueSessionToken();
    expect(first).not.toBe(second);
    expect(first.length).toBeGreaterThanOrEqual(40);
    expect(hashSessionToken(first)).toMatch(/^[a-f0-9]{64}$/);
    expect(hashSessionToken(first)).toBe(hashSessionToken(first));
  });
});
