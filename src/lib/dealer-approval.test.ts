import { describe, expect, it } from "vitest";
import { dealerApprovalDecision } from "./dealer-approval";

describe("dealer application moderation", () => {
  it("approving an application assigns the dealer role and records approval", () => {
    expect(dealerApprovalDecision("approve", "Approved after business verification.")).toEqual({
      ok: true,
      profile: {
        approvalStatus: "APPROVED",
        moderationNotes: "Approved after business verification.",
        approvedAt: expect.any(Date),
      },
      userRole: "DEALER",
      auditAction: "DEALER_APPROVED",
    });
  });

  it("rejecting an application leaves the current account role unchanged", () => {
    expect(dealerApprovalDecision("reject", "Business documents could not be verified.")).toEqual({
      ok: true,
      profile: {
        approvalStatus: "REJECTED",
        moderationNotes: "Business documents could not be verified.",
        approvedAt: null,
      },
      userRole: null,
      auditAction: "DEALER_REJECTED",
    });
  });

  it("refuses unsupported moderation actions", () => {
    expect(dealerApprovalDecision("promote", "")).toEqual({
      ok: false,
      error: "Invalid dealer moderation action.",
    });
  });
});
