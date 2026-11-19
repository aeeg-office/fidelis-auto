# Fidelis Auto Nightly Assurance — 2026-11-18
Status: ✅ PASS (all systems operational, zero new/high defects, no repairs required)

> **Environment realignment (ongoing):** Live app = Docker container `fidelis-auto` (Up 23h, healthy) on :3006 via :443, source `/opt/fidelis-auto` (repo github.com/aeeg-office/fidelis-auto.git), DB `hermes_car`. `/opt/hermes-car` + PM2 `fidelis-auto-phase*` are STALE leftovers, not live. Deployed image `9e0e3c36…` exactly matches git HEAD `9e0e3c3`. Container does NOT auto-rebuild on push.

## 1. Production Health
- Homepage: ✅ 200 (0.43s) — title + breadcrumbs present
- /vehicles: ✅ 200 (0.55s) — Beetle listed
- Vehicle detail: ✅ 200 (0.41s) — 10 real images, jpeg + webp all 200
- /ar (Arabic): ✅ 200 (0.39s) ; /services, /journal, /about, /contact: ✅ 200
- Admin: ✅ login 200 (SUPER_ADMIN), admin UI pages 200 w/ cookie, anon gate 307 → /admin/login, `/api/admin/*` 401 anon / 200 authed
- DB: ✅ healthy | Docker: ✅ fidelis-auto Up + healthy, staging Up + healthy
- Disk: 45% used, 54G free | RAM: 2.3G/7.8G | Backup: ✅ nightly_20261117.sql (464K) created this run
- Deployed-image ↔ git-HEAD consistency: ✅ exact match `9e0e3c36…` = `9e0e3c3`

## 2. New Production Defects
| ID | Route | Severity | Description | Reproduced? |
|----|-------|----------|-------------|-------------|
| — | — | — | None found this run | — |

## 3. Known Defect Status
| ID | Previous | Current | Notes |
|----|----------|---------|-------|
| FID-001 | RESOLVED | ✅ RESOLVED | 10 VehicleImage, jpeg + webp 200 |
| FID-002 | RESOLVED | ✅ RESOLVED | ModerationLog = 2 (AUTO_APPROVED + QA LISTING_APPROVED, QA cleaned) |
| FID-003 | N/A | ✅ N/A | 1 vehicle only |
| FID-004 | RESOLVED | ✅ RESOLVED | Live = /opt/fidelis-auto; /opt/hermes-car stale (documented) |
| FID-005 | RESOLVED | ✅ RESOLVED | 6 Inquiry rows, all contact spam |
| FID-006 | OK | ✅ OK this run | Key + retries worked |
| FID-007 | RESOLVED | ✅ RESOLVED | All admin APIs 401 anon; gate 307 |

## 4. Regressions
None. All public gates, auth boundaries, RBAC matrix, image assets, moderation workflow re-verified live this run.

## 5. Security Findings
- RBAC: /api/admin/{users,dealers,services,inquiries,journal} → 401 anon / 200 authed ✅; /api/admin/vehicles 405 (POST-only); /api/admin/submissions + /dashboard collection paths 404 (by design)
- /api/submit anon → 401; non-moderator approve → 403; moderator approve → 200 ✅
- /api/services anon → 401 (FID-AUD-201 intact) ✅
- Published-only filter: unknown & deleted vehicle slugs → 404 ✅ (verified post-cleanup)
- No owner-email leak on listing card; footer mailto = site-default contact ✅
- Headers: CSP, HSTS, X-Frame-Options SAMEORIGIN, X-Content-Type-Options nosniff, Referrer-Policy ✅
- Port exposure: 80/443 OPEN, 3006/5432 closed externally (correct posture) ✅
- Contact honeypot & spam window intact ✅
- No credential leak on 5 public pages (only form field labels, not secrets) ✅

## 6. Performance Metrics
| Page | Response Time | Previous (11-17) | Delta |
|------|--------------|----------|-------|
| Homepage | 0.43s | 0.54s | −0.11s |
| /vehicles | 0.55s | 0.55s | 0.00s |
| Vehicle detail | 0.41s | 0.66s | −0.25s |
| /ar | 0.39s | 0.55s | −0.16s |
| /services | 0.38s | n/a | — |
| /journal | 0.50s | n/a | — |

## 7. Data Integrity
- Tables: 32 | Vehicles: **1** (published) | VehicleImage: 10 | ServiceListing: 12 | JournalEntry: 28 | Inquiry: 6 (all spam) | ModerationLog: 1 live | ListingRequest: 2 | AuditLog: 10 | User: 9
- Users: 3 SUPER_ADMIN, 3 SELLER, 1 ADMINISTRATOR, 1 BUYER, 1 DEALER
- Beetle owner: aeeg.education@gmail.com (ADMINISTRATOR) — consistent
- No orphans; schema drift ListingRequest = 2 legacy DB-only columns (moderateNotes, submissionStatus) — pre-existing
- Media volume: 93M under /var/www/fidelis-auto/uploads (survives container recreation) ✅

## 8. Repairs Made
| ID | Fix | Component | Tested? | Deployed? | Verified? |
|----|-----|-----------|---------|-----------|-----------|
| — | None required this run | — | — | — | — |

## 9. Unresolved Issues
- **Escalation (owner decision, repeated from 11-17):** ListingRequest table lacks WS3/WS15 richer vehicle fields (type, price, fuel, license, taxonomy ids). Submit form collects but drops at persist. Proper fix = additive nullable migration (owner-approved, schema changes PROHIBITED to auto). No data loss relative to broken period.
- **Cron budget drift (escalation, repeated):** job's FIXED ENVIRONMENT REFERENCE still cites PM2 `/opt/hermes-car` (22 tables, 6 vehicles, c3d0f6b HEAD) — none match live (Docker `/opt/fidelis-auto`, 32 tables, 1 vehicle, 9e0e3c3). Recommend updating the job budget.
- **Backup gap:** `/opt/backups` contained only Aug/Sep dumps before this run — no nightly DB backup job exists for fidelis-auto DB. This run created one manually; persists for future. Recommend a scheduled backup routine.
- 5 stale test/seed users remain (raniathabet kept by user) — cleanup optional.
- CSP still uses 'unsafe-inline'/'unsafe-eval' — known hardening opportunity, not a regression.

## 10. Feature Opportunities (report-only)
- Complete ListingRequest schema for WS3 vehicle fields (see unresolved).
- Establish automated nightly DB backup for hermes_car.

## 11. Escalations
- Owner decision needed on WS3 ListingRequest schema backfill (architectural, blocked by repair rules).
- Cron budget alignment (fixed-env reference stale).
- Backup automation (devops).

## 12. Tests
- Auth: admin login 200 (SUPER_ADMIN) / bad creds 401 / missing fields 400 / me 200 authed + 401 anon ✅
- RBAC: 5 admin APIs × (anon 401 + admin 200) + services 401 + submit 401 ✅
- Listing lifecycle QA: provision QA SELLER → login 200 → submit 201 (pendingModeration:true) → SELLER approve 403 → ADMIN approve 200 → Vehicle created + published + ModerationLog/AuditLog events recorded → **full cleanup verified 0 residuals** ✅
- Public gates: 8 routes correct; published-only filter (unknown + deleted slugs 404) ✅
- Images: jpeg 200, sitemap urls all fidelisauto.com domain ✅
- Targeted: 20 passed, 0 failed | Regression: 15 passed, 0 failed

*Report written locally on M2 (never on VPS), coordinator machine. Live deploy HEAD 9e0e3c3.*