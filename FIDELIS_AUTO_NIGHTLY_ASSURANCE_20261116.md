# Fidelis Auto Nightly Assurance — 2026-11-16
Status: ✅ PASS (with ledger corrections — audit baseline realigned to live deployment)

> **Env correction (important):** The cron budget's fixed-env assumed the live app runs from `/opt/hermes-car` under PM2. The live-status probe (per fidelis-role-matrix-qa) confirms the REAL deployment is the **Docker container `fidelis-auto` (Up 6 days, healthy)** on port 3006, source `/opt/fidelis-auto` (HEAD `8fcdafc`), database `hermes_car`. `/opt/hermes-car` (HEAD c3d0f6b) and all PM2 `fidelis-auto-phase*` processes are STALE leftovers from an earlier deploy path. All findings below reflect the live Docker deployment.

## 1. Production Health
- Homepage: ✅ 200 (rt: 0.39s) — title + "We Love Cars" content present
- /vehicles: ✅ 200 (0.39s) — lists Beetle
- Vehicle detail: ✅ 200 (0.39s) — 10 real images rendered
- /ar (Arabic): ✅ 200
- Admin: ✅ login works (SUPER_ADMIN); anon gate 307 → /admin/login; admin APIs 401 anon / 200 authed
- DB: ✅ 32 tables, healthy
- Docker: ✅ fidelis-auto Up 6 days (healthy); fidelis-auto-staging healthy
- Disk: 44% used, 54G free | RAM: 2.0G/7.8G used

## 2. New Production Defects
| ID | Route | Severity | Description | Reproduced? |
|----|-------|----------|-------------|-------------|
| (none confirmed) | | | No new functional defects | |

Minor observations (non-blocking):
- Security headers present but CSP uses `'unsafe-inline' 'unsafe-eval'` in script-src — common for Next.js but a hardening opportunity (already known config; not a regression).
- `www.fidelisauto.com` → 301 to non-www; canonical is `https://fidelisauto.com`. Consistent.

## 3. Known Defect Status (from cron ledger)
| ID | Previous | Current | Notes |
|----|----------|---------|-------|
| FID-001 | Beetle no images (CRITICAL) | ✅ RESOLVED | Beetle now has 10 VehicleImage; jpeg + webp trio all serve 200 |
| FID-002 | No moderation log (MEDIUM) | ✅ RESOLVED | ModerationLog = 2 entries |
| FID-003 | No images on 5 unpublished vehicles (MEDIUM) | ✅ N/A | Those 5 vehicles no longer exist in DB (only 1 vehicle now) |
| FID-004 | Cross-repo divergence (HIGH) | ✅ RESOLVED | Live deploy is `/opt/fidelis-auto` git repo; `/opt/hermes-car` is stale leftover (documented) |
| FID-005 | 0 inquiries (LOW) | ✅ RESOLVED | 6 Inquiry rows (all contact-form spam, vehicleId null — expected) |
| FID-006 | VPS SSH flaky (MEDIUM) | ✅ OK this run | Random retries may still be needed in future |
| FID-007 | Admin routes 200 without auth (HIGH) | ✅ RESOLVED | All /api/admin/* return 401 anon; admin gate 307 |

## 4. Regressions
None.

## 5. Security Findings
- Admin RBAC verified: /api/admin/{users,dealers,services,inquiries,journal} → **401 anon, 200 with SUPER_ADMIN cookie**. ✅
- POST /api/submit anon → 401 ✅ (RBAC enforced)
- POST /api/services → 401 anon / 400 with admin (validation; correct auth boundary) ✅
- /api/auth/login bad creds → 401 ✅; admin recovery login → 200 ✅
- Unpublished vehicle detail → 404 ✅ (published-only filter works)
- CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy all present ✅
- Port exposure: 80/443 OPEN, 3006/5432 closed (correct firewall posture) ✅
- No hardcoded credentials in public pages ✅
- Credential handling: admin password read from mode-0600 ADMIN_CRED_RECOVERY.txt, never printed. Note: `.env` ADMIN_PASSWORD is stale (post-FID-AUD-102 rotation) — recovery file remains the authoritative admin credential.

## 6. Performance Metrics
| Page | Response Time | Previous | Delta |
|------|--------------|----------|-------|
| Homepage | 0.39s | n/a (first metered run this series) | — |
| /vehicles | 0.39s | n/a | — |
| Vehicle detail (Beetle) | 0.39s | n/a | — |
| /ar | 0.39s | n/a | — |

## 7. Data Integrity
- Tables: 32 | Vehicles: **1** (published) | VehicleImage: 10 | ServiceListing: 12 | JournalEntry: 28 | Inquiry: 6 (all spam) | ModerationLog: 2 | ListingRequest: 2
- Users: 9 total = 3 SUPER_ADMIN (admin, superadmin, newadmin), 1 ADMINISTRATOR, 1 DEALER, 3 SELLER (raniathabet1100 kept by user + 2 test), 1 BUYER
- Beetle owner: aeeg.education@gmail.com (ADMINISTRATOR role) — cross-checked consistent
- Media volume on host: 93M persisted under /var/www/fidelis-auto/uploads (survives container recreation) ✅
- No orphans detected in vehicle/image/user linkage

## 8. Repairs Made
| ID | Fix | Component | Tested? | Deployed? | Verified? |
|----|-----|-----------|---------|-----------|-----------|
| (none this run) | — | — | — | — | — |

## 9. Unresolved Issues
None (all cron-ledger defects verified resolved or N/A; audit baseline realigned to Docker deployment).

## 10. Feature Opportunities (report-only)
- CSP hardening: remove `'unsafe-inline'`/`'unsafe-eval'` (needs next.config nonce strategy) — engineering effort, not a defect.
- 5 stale test/seed SELLER + test users remain in DB (raniathabet kept by user); cleanup optional.

## 11. Escalations
- **Cron job baseline drift:** The scheduled job's FIXED ENVIRONMENT REFERENCE (PM2 `/opt/hermes-car`, 22 tables, 6 vehicles) no longer matches production. Recommend updating the job budget to reflect: Docker `fidelis-auto` (:3006 via :443), source `/opt/fidelis-auto`, 32 tables, 1 published vehicle, admin cred from ADMIN_CRED_RECOVERY.txt. Otherwise each run will re-discover the same drift.

## 12. Tests
- Auth: admin login 200 ✅ / bad login 401 ✅ / me 200 ✅ / anon me 401 ✅
- RBAC: 5 admin APIs x (anon 401 + admin 200) = 10/10 ✅
- Public gates: 7 routes all correct ✅
- Images: 3 sample asset URLs all 200 (jpeg + webp) ✅
- Targeted: 12 passed, 0 failed | Regression: 12 passed, 0 failed

*Report written locally on M2 (never on VPS), coordinator machine.*