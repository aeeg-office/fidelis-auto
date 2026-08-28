# Fidelis Auto — Security Notes

## Authentication & authorization
- Server-side sessions: opaque token in `fidelis_session` cookie (httpOnly, sameSite=lax, secure in prod); stored as SHA-256 hash in `AuthSession`.
- RBAC hierarchy enforced via `lib/authorization.ts` (`can`, `canManageRole`): SUPER_ADMIN > ADMINISTRATOR > DEALER > SELLER > BUYER.
- **Admin API** endpoints return `401` when unauthenticated; **admin pages** redirect `307` to `/admin/login`. Verified live (Phase 4/9).
- Role escalation guarded: `PATCH /api/admin/users/[id]` enforces `user:manage` + `canManageRole` (cannot self-escalate / elevate above actor).

## Ownership / authorization seams
- `/api/my-listing/[id]`, `/api/my-vehicle/[id]`, `/api/my-vehicle/[id]/status` all verify `ownerId === current user` (403 otherwise).
- `/api/vehicles/[slug]/favorite` requires login to save.

## Listing moderation (anti-abuse)
- `lib/ad-scanner.ts` scans free-text ad content for: contact harvesting (emails, phones, wa.me/whatsapp/telegram, "@"/"dot com"), spam filler (profanity, "contact/call now/best price/limited time"), malformed essentials (empty model, suspicious year, external URLs).
- **Seller's own validated `phone`/`email` fields are excluded** from the scan (they are legitimate and validated upstream) — otherwise every clean submission was flagged (fixed 2026-08-28, commit `2dd7781`).
- Clean → auto-approve + auto-publish; violations → `pending` manual review.
- Every moderation decision logged to `ModerationLog` (audit trail).

## Secrets
- `.env` on VPS at `/opt/fidelis-auto/.env`; never committed. `.env.example` committed as secret-safe template.
- No API keys / connection strings / credentials are surfaced in reports, logs, or docs.

## Current posture
- 0 critical / 0 high open defects (Phase 9 verified).
- Closed: unauthed `/admin` (FID-007), admin back-office (FID-013), hardcoded mock inventory (FID-010), media volume root-owned (FID-001/FID-009).
- Known low-level notes: shared `hermes_car` DB across platforms (FID-006, documented); flaky VPS SSH (FID-006, operational).