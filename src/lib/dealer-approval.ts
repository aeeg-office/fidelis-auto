export type DealerApprovalDecision =
  | {
      ok: true;
      profile: {
        approvalStatus: "APPROVED" | "REJECTED";
        moderationNotes: string | null;
        approvedAt: Date | null;
      };
      userRole: "DEALER" | null;
      auditAction: "DEALER_APPROVED" | "DEALER_REJECTED";
    }
  | { ok: false; error: string };

export function dealerApprovalDecision(action: unknown, notes: unknown): DealerApprovalDecision {
  const moderationNotes = typeof notes === "string" && notes.trim() ? notes.trim() : null;

  if (action === "approve") {
    return {
      ok: true,
      profile: { approvalStatus: "APPROVED", moderationNotes, approvedAt: new Date() },
      userRole: "DEALER",
      auditAction: "DEALER_APPROVED",
    };
  }

  if (action === "reject") {
    return {
      ok: true,
      profile: { approvalStatus: "REJECTED", moderationNotes, approvedAt: null },
      userRole: null,
      auditAction: "DEALER_REJECTED",
    };
  }

  return { ok: false, error: "Invalid dealer moderation action." };
}
