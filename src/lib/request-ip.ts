// Resolve an approximate client IP from request headers (used for server-side abuse control).
// Trusted reverse proxies set X-Forwarded-For; fall back to X-Real-IP, else a sentinel.
export function getClientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}