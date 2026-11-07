/* WS2: server-side phone verification with strict abuse limits (spec §5).
 *
 * Rules (per mission §5 / PRODUCT_SPEC_v1.2 Costs):
 *  - 1 new code per minute per phone, 5 per day per phone.
 *  - Per-IP sending cap to stop a single client burning the SMS budget.
 *  - Provider switch: `PHONE_PROVIDER` selects the channel (twilio | mock | off). When off or
 *    unconfigured, sending is DISABLED (fail-closed) — no SMS is ever sent and phone-gated
 *    features remain off until an Egyptian-number OTP e2e test passes (§5).
 *
 * The limiter is in-memory (resets on restart) and is a complement to, not a replacement for,
 * a provider-side spend cap. See §5: server-side counters alone are insufficient.
 */

export interface OtpDecision {
  ok: boolean;
  reason?: "rate-limit-per-minute" | "rate-limit-per-day" | "rate-limit-per-ip" | "provider-disabled";
  retryAfterSeconds?: number;
}

// ── Pure in-memory limiter (unit-testable) ────────────────────────────────
type WindowKey = `${string}:${number}`;

export class OtpRateLimiter {
  private minute: Map<string, number[]> = new Map(); // key -> timestamps (last minute)
  private day: Map<string, number[]> = new Map();     // key -> timestamps (quote window)
  private ip: Map<string, number[]> = new Map();      // ip -> timestamps

  constructor(
    private perMinute = 1,
    private perDay = 5,
    private perIp = 10,
    private minuteMs = 60_000,
    private dayMs = 24 * 60 * 60 * 1000,
    private ipWindowMs = 60 * 60 * 1000, // 1-hour IP window: caps bulk abuse from one client
  ) {}

  private prune(map: Map<string, number[]>, key: string, windowMs: number, now: number) {
    const arr = (map.get(key) ?? []).filter((t) => now - t < windowMs);
    return arr;
  }

  /** Decide whether a send is allowed for (phone, ip) at time `now`. */
  allow(phone: string, ip: string, now = Date.now()): OtpDecision {
    const pMinute = this.prune(this.minute, phone, this.minuteMs, now);
    if (pMinute.length >= this.perMinute) {
      const retry = this.minuteMs - (now - pMinute[0]);
      return { ok: false, reason: "rate-limit-per-minute", retryAfterSeconds: Math.max(1, Math.ceil(retry / 1000)) };
    }
    const pDay = this.prune(this.day, phone, this.dayMs, now);
    if (pDay.length >= this.perDay) return { ok: false, reason: "rate-limit-per-day" };

    const i = this.prune(this.ip, ip, this.ipWindowMs, now);
    if (i.length >= this.perIp) {
      const retry = this.ipWindowMs - (now - i[0]);
      return { ok: false, reason: "rate-limit-per-ip", retryAfterSeconds: Math.max(1, Math.ceil(retry / 1000)) };
    }
    return { ok: true };
  }

  /** Record a successful send (only after `allow` returned ok). */
  record(phone: string, ip: string, now = Date.now()) {
    this.minute.set(phone, [...this.prune(this.minute, phone, this.minuteMs, now), now]);
    this.day.set(phone, [...this.prune(this.day, phone, this.dayMs, now), now]);
    this.ip.set(ip, [...this.prune(this.ip, ip, this.ipWindowMs, now), now]);
  }

  /** Clear all state (tests). */
  reset() { this.minute.clear(); this.day.clear(); this.ip.clear(); }
}

// Singleton used by the API routes (resets on server restart, documented).
export const rateLimiter = new OtpRateLimiter();

// Normalize an Egyptian/any E.164-ish phone for keying and display safety.
// Returns a valid E.164 string (leading "+" + 10-15 digits) or "" when the input is not a plausible
// phone number, so garbage never reaches the DB or the quota-key tables.
export function normalizePhone(raw: string): string {
  let p = (raw || "").replace(/[\s\-().]/g, "");
  if (!p) return "";
  // Local Egypt format "01x..." -> international "+20"; plain 8-11 digits -> assume Egypt "+20".
  if (/^0\d{9,10}$/.test(p)) p = "+20" + p.slice(1);
  else if (/^\d{8,11}$/.test(p)) p = "+20" + p;
  else if (!p.startsWith("+") && /^\d{10,15}$/.test(p)) p = "+" + p;
  // Validate final shape: "+" then 10-15 digits (E.164). Anything else is rejected (empty).
  if (/^\+\d{10,15}$/.test(p)) return p;
  return "";
}

// Provider switch. "off"/missing/empty = disabled (fail-closed). "mock" = test/local sim.
export function phoneProviderEnabled(): boolean {
  const provider = (process.env.PHONE_PROVIDER || "off").toLowerCase();
  return provider === "twilio" || provider === "mock";
}

// OTP code generation (crypto-safe).
export function generateOtp(): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const crypto = require("crypto");
  return crypto.randomInt(100000, 999999).toString();
}