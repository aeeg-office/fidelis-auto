# Fidelis Auto Nightly Assurance — 2026-11-19
Status: ✅ PASS (all systems operational, zero new/high defects, no repairs required)

> **Environment realignment:** Live app = Docker container `fidelis-auto` (Up 47h, healthy) on :3006 via :443, source `/opt/fidelis-auto` (repo github.com/aeeg-office/fidelis-auto.git), DB `hermes_car`. `/opt/hermes-car` + PM2 `fidelis-auto-phase*` are STALE leftovers, not live. Deployed git HEAD `9e0e3c3` exactly matches local M2 HEAD `9e0e3c3`. Container does NOT auto-rebuild on push.
> Run on M2 (coordinator). Server clock UTC ⇒ backup file names use UTC date (nightly_20261118.sql); report date = Cairo local 2026-11-19.

## 1. Production Health
- Homepage: ✅ 200 (0.38–0.46s) — title "Fidelis Auto — Premium Collector Vehicle Showroom", "We Love Cars" present
- /vehicles: ✅ 200 (0.55s) — Beetle listed
- Vehicle detail: ✅ 200 (0.45s) — 10 real images, jpeg + webp (thumb/-800/-1600 + blurred/enhanced) all 200
- /ar (Arabic): ✅ 200 ; /services, /journal, /contact, /search: ✅ 200
- Admin: ✅ login 200 (SUPER_ADMIN, redirectPath /admin), admin UI 200 w/ cookie, anon gate 307 → /admin/login, `/api/admin/users` 401 anon / 200 authed
- DB: ✅ healthy | Docker: ✅ fidelis-auto Up + healthy, staging Up 9d + healthy
- Disk: 45% used, 54G free | RAM: 2.1G used / 7.8G, 5.6G available
- Backup: ✅ nightly_20261118.sql (471KB, 231 hermes_car refs) created this run; nightly dumps present 11-16→11-18
- Deployed-image ↔ git-HEAD consistency: ✅ exact match `9e0e3c3`

## 2. New Production Defects
| ID | Route | Severity | Description | Reproduced? |
|----|-------|----------|-------------|-------------|
| — | — | — | None found this run | — |

## 3. Known Defect Status
| ID | Previous | Current | Notes |
|----|----------|---------|-------|
| FID-001 | RESOLVED | ✅ RESOLVED | 10 VehicleImage; jpeg + webp 200; full gallery renders |
| FID-002 | RESOLVED | ✅ RESOLVED | ModerationLog = 1 live (AuditLog shows LISTING_APPROVED/DEALER_APPROVED) |
| FID-003 | N/A | ✅ N/A | 1 vehicle only in DB |
| FID-004 | RESOLVED | ✅ RESOLVED | Live = /opt/fidelis-auto; /opt/hermes-car stale (not served, pm2 clean) |
| FID-005 | RESOLVED | ✅ RESOLVED | 6 Inquiry rows, all contact spam |
| FID-006 | OK | ✅ OK this run | Key + retries worked; first connect succeeded |
| FID-007 | RESOLVED | ✅ RESOLVED | All admin APIs 401 anon; /admin gate 307; authed 200 |

## 4. Regressions
None. All public gates, auth boundaries, RBAC, image assets, moderation state re-verified live this run matching prior PASS.

## 5. Security Findings
- RBAC: /api/admin/users 401 anon / 200 authed ✅; bad login 401 ✅; /api/auth/me 200 authed / anon-gated ✅
- /api/services POST anon → 401 ✅ (FID-AUD-201 intact)
- /api/submit POST anon → 401 ✅
- Published-only filter: unknown/old slugs (`1956-volkswagen-beetle`, `porsche`) → 404 ✅
- Owner-email leak: NONE — vehicle `contactEmail`/`contactPhone` NULL; the single `mailto:aeeg.education@gmail.com` is the site-default footer Contact (expected, separate); `mailto:?subject=` is a share CTA
- WhatsApp on listing: wa.me/201060618899 (digits present) ✅
- Headers: CSP (default-src 'self', frame-ancestors 'none'), HSTS preload, X-Frame-Options SAMEORIGIN, X-Content-Type-Options nosniff, X-XSS, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy ✅
- Port exposure (external probe from M2): 80/443 OPEN, 3006/5432 closed (correct firewall posture) ✅
- No credential leak; admin password never transmitted over Telegram

## 6. Performance Metrics
| Page | Response Time | Previous (11-18) | Delta |
|------|--------------|----------|-------|
| Homepage | 0.38s | 0.43s | −0.05s |
| /vehicles | 0.55s | 0.55s | 0.00s |
| Vehicle detail | 0.45s | 0.41s | +0.04s |
| /ar | n/a | 0.39s | — |
| /services | n/a | 0.38s | — |
| /journal | n/a | 0.50s | — |

## 7. Data Integrity
- Tables: 32 | migrations: 22 | Vehicles: **1** (published, volkswagen-beetle-1959, year 1959, 10 images) | ServiceListing: 12 | JournalEntry: 28 | Inquiry: 6 (all spam) | ModerationLog: 1 live | ListingRequest: 2 | AuditLog: 11 (↑1 from 10) | User: 9
- Users: 3 SUPER_ADMIN, 3 SELLER, 1 ADMINISTRATOR, 1 BUYER, 1 DEALER
- Beetle owner: aeeg.education@gmail.com (ADMINISTRATOR) — consistent
- No orphans; no data-integrity findings
- Media volume: 93M under /var/www/fidelis-auto/uploads (host volume, survives container recreation) ✅

## 8. Repairs Made
| ID | Fix | Component | Tested? | Deployed? | Verified? |
|----|-----|-----------|---------|-----------|-----------|
| — | None required this run | — | — | — | — |

## 9. Unresolved Issues
- **Escalation (owner decision, repeated):** ListingRequest table lacks WS3/WS15 richer vehicle fields (type, price, fuel, license, taxonomy ids). Submit collects but drops at persist. Proper fix = additive nullable migration — schema changes PROHIBITED to auto (owner escalation).
- **Cron budget drift (escalation, repeated):** job FIXED ENVIRONMENT REFERENCE still cites PM2 `/opt/hermes-car` (22 tables, 6 vehicles, c3d0f6b). Live = Docker `/opt/fidelis-auto` (32 tables, 1 vehicle, 9e0e3c3). Recommend updating the job budget to stop the drift risk.
- CSP still uses 'unsafe-inline'/'unsafe-eval' — known hardening opportunity, not a regression.
- 5 test/seed users present; raniathabet kept by user. Cleanup optional.

## 10. Feature Opportunities (report-only)
- Owner decision on WS3 ListingRequest schema backfill (architectural, blocked by repair rules).

## 11. Escalations
- WS3 ListingRequest schema backfill (owner decision, architectural).
- Cron budget alignment (fixed-env reference stale).
- Backup: gap now closed — nightly dumps present since 11-16; consider formalizing into a scheduled job.

## 12. Tests
- Auth: admin login 200 (SUPER_ADMIN) / bad creds 401 / me 200 authed / admin-ui 200 w/ cookie / anon gate 307 ✅
- RBAC: /api/admin/users (401 anon / 200 authed), /api/services 401 anon, /api/submit 401 anon ✅
- Public gates: home, /ar, /vehicles, /contact, /services, /journal, /search, detail all 200; published-only filter (old slugs 404) ✅
- Images: jpeg + webp 200 w/ correct content-type; og:image present; sitemap URLs 100% fidelisauto.com ✅
- Targeted: 18 passed, 0 failed | Regression: 15 passed, 0 failed

*Report written locally on M2 (coordinator). Live deploy HEAD 9e0e3c3.*