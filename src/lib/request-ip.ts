// Resolve an approximate client IP for server-side abuse control.
//
// Trusted-proxy posture (Hardening): X-Forwarded-For is client-appendable, so the ORIGINAL client
// address is the LAST hop before our edge proxy — i.e. the rightmost entry a trusted proxy appended.
// If we don't run behind a trusted proxy that overwrites X-Real-IP, an attacker can rotate the header
// and evade the per-IP cap. To keep this safe:
//   - Production ingress (nginx/Caddy) MUST set `X-Forwarded-For $proxy_add_x_forwarded_for` and
//     `X-Real-IP $remote_addr` from the real peer, and MUST strip/overwrite inbound XFF from clients.
//   - We prefer the LAST entry of X-Forwarded-For (the trusted proxy's appended real peer) rather than
//     the leftmost (client-controlled), so a trusting attacker header cannot spoof a fresh IP.
export function getClientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) {
    const parts = fwd.split(",").map((s) => s.trim()).filter(Boolean);
    // Rightmost entry = the peer the trusted proxy connected from (unless proxy overwrites it).
    return parts[parts.length - 1] || "unknown";
  }
  return request.headers.get("x-real-ip") || "unknown";
}

/** True when the client IP is a documented private/loopback range (tests / local dev). */
export function isPrivateIp(ip: string): boolean {
  if (!ip || ip === "unknown") return false;
  return /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.|127\.|::1$)/.test(ip) || ip === "localhost";
}