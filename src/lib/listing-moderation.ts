export type ListingModerationDecision =
  | {
      ok: true;
      status: "approved" | "rejected";
      notes: string | null;
      auditAction: "LISTING_APPROVED" | "LISTING_REJECTED";
    }
  | { ok: false; error: string };

const MAX_NOTES_LENGTH = 2_000;

export function listingModerationDecision(action: unknown, notes: unknown): ListingModerationDecision {
  const normalizedNotes = typeof notes === "string" ? notes.trim() : "";
  if (normalizedNotes.length > MAX_NOTES_LENGTH) {
    return { ok: false, error: `Moderation notes must be ${MAX_NOTES_LENGTH} characters or fewer.` };
  }

  if (action === "approve") {
    return { ok: true, status: "approved", notes: normalizedNotes || null, auditAction: "LISTING_APPROVED" };
  }
  if (action === "reject") {
    return { ok: true, status: "rejected", notes: normalizedNotes || null, auditAction: "LISTING_REJECTED" };
  }
  return { ok: false, error: "Invalid listing moderation action." };
}
