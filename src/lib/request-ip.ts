// Resolve an approximate client IP for server-side abuse control.
//
// TRUSTED-PROXY POSTURE (required, see below): the per-IP OTP send cap is the main defense against
// a single authenticated client burning SMS budget across many phone numbers. X-Forwarded-For is
// client-appendable, so we MUST read from a header the edge proxy sets from the real peer and that
// clients cannot override.
//
// Production (Nginx/Caddy in front of Next.js) MUST set BOTH:
//   proxy_set_header X-Real-IP $remote_addr;              # the true client, server-derived
//   proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; # append-on to a chain
// and the proxy MUST overwrite any client-supplied X-Forwarded-For (Nginx does this by default when
// using $proxy_add_x_forwarded_for — it appends to the existing value; if you cannot trust the
// inbound header, strip it in server config). Order of preference:
//   1. X-Real-IP  — server-derived, not client-controllable. Preferred.
//   2. last XFF entry — the hop the trusted proxy connected from (only if X-Real-IP absent).
export function getClientIp(request: Request): string {
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) {
    const parts = fwd.split(",").map((s) => s.trim()).filter(Boolean);
    return parts[parts.length - 1] || "unknown";
  }
  return "unknown";
}

/** True when the client IP is a documented private/loopback range (tests / local dev). */
export function isPrivateIp(ip: string): boolean {
  if (!ip || ip === "unknown") return false;
  return /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.|127\.|::1$)/.test(ip) || ip === "localhost";
}