/* WS2: server-side phone-verified gate for protected actions (contact, save, post).
 *
 * Per PRODUCT_SPEC_v1.2 §5, phone-gated features stay DISABLED in production until an actual
 * Egyptian-number OTP end-to-end test passes, provider-side spend is bounded, and server-side
 * abuse limits are verified. So this gate is turned on by an explicit feature switch:
 *   PHONE_GATE=enabled  -> contact/save/post REQUIRE an authenticated, phone-verified user.
 *   anything else        -> gate OFF (fall back to the pre-existing behavior, e.g. open contact).
 *
 * The gate decision is a pure function so it is unit-testable without a DB.
 */

export type GateUser = { id: string; phoneVerified: boolean } | null;

export interface GateDecision {
  allowed: boolean;
  status: 200 | 401 | 403 | 503;
  reason: "not-authenticated" | "phone-not-verified" | "gate-disabled" | "allowed";
}

/** True only when the operator has explicitly enabled the phone gate for launch safety. */
export function phoneGateEnabled(): boolean {
  return (process.env.PHONE_GATE || "disabled").toLowerCase() === "enabled";
}

/** Decide whether `user` may perform a phone-gated action. Pure (no IO). */
export function decidePhoneGate(user: GateUser): GateDecision {
  if (!phoneGateEnabled()) return { allowed: true, status: 503, reason: "gate-disabled" };
  if (!user) return { allowed: false, status: 401, reason: "not-authenticated" };
  if (!user.phoneVerified) return { allowed: false, status: 403, reason: "phone-not-verified" };
  return { allowed: true, status: 200, reason: "allowed" };
}