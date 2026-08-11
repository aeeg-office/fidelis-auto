import { describe, expect, it } from "vitest";
import { buildListingAssistancePrompt, sanitizeAssistedDescription } from "./ai-listing-assistant";

describe("listing writing assistant", () => {
  it("builds a fact-bounded prompt", () => {
    const result = buildListingAssistancePrompt({ year: 1993, make: "Porsche", model: "911", notes: "One owner" });
    expect(result).toMatchObject({ ok: true });
    if (result.ok) expect(result.prompt).toContain("Do not invent provenance");
  });

  it("requires vehicle identity and bounds generated text", () => {
    expect(buildListingAssistancePrompt({ year: 1993, make: "", model: "911" })).toEqual({
      ok: false,
      error: "Year, make, and model are required for writing assistance.",
    });
    expect(sanitizeAssistedDescription("  A well-presented car. \n ")).toBe("A well-presented car.");
    expect(sanitizeAssistedDescription("x".repeat(2_001))).toBeNull();
  });
});
