import { describe, expect, it } from "vitest";
import { normalizeListingSubmission } from "./listing-submission";

describe("listing submission normalization", () => {
  const validPayload = {
    userId: "attacker-controlled-user-id",
    name: "Amina Seller",
    email: "amina@example.com",
    phone: "+971500000000",
    year: "2023",
    make: "Porsche",
    model: "911",
    mileage: "1200",
    photoUrls: ["/uploads/00000000-0000-4000-8000-000000000001.jpg"],
    videoUrls: ["/uploads/video-00000000-0000-4000-8000-000000000002.mp4"],
    audioUrl: "/uploads/audio-00000000-0000-4000-8000-000000000003.mp3",
    city: "Dubai",
    country: "United Arab Emirates",
  };

  it("uses the authenticated owner and ignores a client supplied user id", () => {
    const result = normalizeListingSubmission(validPayload, "authenticated-owner-id");

    expect(result).toMatchObject({
      ok: true,
      value: {
        userId: "authenticated-owner-id",
        year: 2023,
        mileage: 1200,
      },
    });
    expect(result.ok && result.value).not.toHaveProperty("clientUserId");
  });

  it("rejects malformed numeric values and unapproved media URLs", () => {
    expect(normalizeListingSubmission({ ...validPayload, year: "invalid" }, "owner")).toEqual({
      ok: false,
      error: "A valid vehicle year is required.",
    });
    expect(normalizeListingSubmission({ ...validPayload, photoUrls: "not-an-array" }, "owner")).toEqual({
      ok: false,
      error: "Photo URLs must reference approved uploaded media.",
    });
    expect(normalizeListingSubmission({ ...validPayload, photoUrls: ["https://example.invalid/untrusted.jpg"] }, "owner")).toEqual({
      ok: false,
      error: "Photo URLs must reference approved uploaded media.",
    });
  });

  it("rejects unapproved or malformed audio (engine sound) URLs", () => {
    expect(normalizeListingSubmission({ ...validPayload, audioUrl: "https://example.invalid/untrusted.mp3" }, "owner")).toEqual({
      ok: false,
      error: "Engine sound must reference approved uploaded media.",
    });
    expect(normalizeListingSubmission({ ...validPayload, audioUrl: "/uploads/somecarp.ogg" }, "owner")).toEqual({
      ok: false,
      error: "Engine sound must reference approved uploaded media.",
    });
    // audioUrl is a single string — arrays/objects are rejected.
    expect(normalizeListingSubmission({ ...validPayload, audioUrl: ["/uploads/audio-00000000-0000-4000-8000-000000000003.mp3"] }, "owner")).toEqual({
      ok: false,
      error: "Engine sound must reference approved uploaded media.",
    });
  });

  it("still accepts legacy unprefixed video URLs", () => {
    const result = normalizeListingSubmission(
      { ...validPayload, videoUrls: ["/uploads/00000000-0000-4000-8000-000000000002.mp4"] },
      "owner",
    );
    expect(result).toMatchObject({ ok: true });
  });

  it("carries the engine sound path through normalization", () => {
    const result = normalizeListingSubmission(validPayload, "owner");
    expect(result).toMatchObject({
      ok: true,
      value: {
        audioUrl: "/uploads/audio-00000000-0000-4000-8000-000000000003.mp3",
        videoUrls: JSON.stringify(["/uploads/video-00000000-0000-4000-8000-000000000002.mp4"]),
      },
    });
  });
});
