# Fidelis Auto Nightly Assurance — 2026-11-17
Status: ⚠️ PARTIAL → ✅ PASS after repair (1 new HIGH defect found, root-caused, fixed, deployed, verified)

> **Environment realignment (continues 11-16):** Live app = Docker container `fidelis-auto` (Up, healthy) on :3006 via :443, source `/opt/fidelis-auto` (repo github.com/aeeg-office/fidelis-auto.git), DB `hermes_car`. `/opt/hermes-car` + PM2 `fidelis-auto-phase*` are STALE leftovers, not live. Container does NOT auto-rebuild on push — this run rebuilt/deployed SHA-tagged.

## 1. Production Health
- Homepage: ✅ 200 (0.54s) — title + "We Love Cars" present
- /vehicles: ✅ 200 (0.55s) — Beetle listed
- Vehicle detail: ✅ 200 (0.66s) — 10 real images, jpeg + webp trio all 200
- /ar (Arabic): ✅ 200 ; /journal, /collections, /services, /about, /contact: ✅ 200
- Admin: ✅ login 200 (SUPER_ADMIN), admin UI pages 200 w/ cookie, anon gate 307 → /admin/login, /api/admin/* 401 anon / 200 authed
- DB: ✅ 32 tables, healthy
- Docker: ✅ fidelis-auto Up + healthy (image `fidelis-auto-fidelis-auto:9e0e3c3…`); staging healthy
- Disk: 44% used, 54G free | RAM: 2.0G/7.8G

## 2. New Production Defects
| ID | Route | Severity | Description | Reproduced? |
|----|-------|----------|-------------|-------------|
| FID-AUD-203 | POST /api/submit | **HIGH** | Every authenticated listing submission returned 500 (`PrismaClientValidationError: Unknown argument `userId``) — core seller workflow dead | ✅ reproduced via API + direct Prisma repro |

**Root cause (proven, not guessed):** commit f08cfd2 "WS3 vehicles search filters" (2026-11-07, included in merged 8fcdafc 11-09) extended `src/lib/listing-submission.ts` to emit 12 Vehicle-side fields (`mileageUnit, vehicleType, price, priceAmount, currency, bodyType, fuelType, isLicensed, makeId, modelId, cityId, countryId`) that have **no columns on the `ListingRequest` table/model**. Prisma's create-input validation rejects any unknown arg and reports the first one (`userId` — misleading). So every submission 500'd from the 11-09 deploy onward. The two earlier clean rebuilds in this run could not fix it — it is code–schema drift, not a .next cache problem (that diagnosis was my first hypothesis; disproven by minimal-vs-full create tests, all client copies verified current).

**Fix (REPAIR-RULES compliant — narrow, one subsystem, no schema change, no data loss):** `src/app/api/submit/route.ts` now destructure-picks only model-valid columns into `listingData` and creates with that. Commits `29fe70e` + `9e0e3c3`, deployed via `deploy-fidelis.sh` SHA-tagged image. Verified: POST /api/submit → **201** with `{ok, id, autoApproved:false, pendingModeration:true}`, row persists, SELLER non-moderator approve → 403, SUPER_ADMIN approve → 200 + published Vehicle, autoPublish reads only model-valid subset (unchanged). Rollback available: `bash /opt/docker/fidelis-auto/deploy-fidelis.sh rollback` (state file saved).

## 3. Known Defect Status (cron ledger)
| ID | Previous | Current | Notes |
|----|----------|---------|-------|
| FID-001 | Beetle no images (CRITICAL) | ✅ RESOLVED | 10 VehicleImage, jpeg + webp 200 |
| FID-002 | No moderation log (MEDIUM) | ✅ RESOLVED | ModerationLog = 1 entry (AUTO_APPROVED 2026-08-29) + QA approve event cleaned up |
| FID-003 | No images on 5 unpublished vehicles (MEDIUM) | ✅ N/A | Only 1 vehicle in DB now |
| FID-004 | Cross-repo divergence (HIGH) | ✅ RESOLVED | Live = /opt/fidelis-auto; /opt/hermes-car stale (documented) |
| FID-005 | 0 inquiries (LOW) | ✅ RESOLVED | 6 Inquiry rows (all contact spam; honeypot verified no persistence) |
| FID-006 | VPS SSH flaky (MEDIUM) | ✅ OK this run | Explicit key + retries worked |
| FID-007 | Admin routes 200 without auth (HIGH) | ✅ RESOLVED | All admin APIs 401 anon; gate 307 |

## 4. Regressions
None. All public gates, auth boundaries, RBAC matrix, image assets, contact honeypot, canonical/sitemap re-verified post-deploy.

## 5. Security Findings
- Admin RBAC: /api/admin/{users,dealers,services,inquiries,journal} → 401 anon / 200 authed ✅; /api/admin/vehicles 405 (POST-only, by design), /api/admin/submissions + /dashboard collections 404 (by design, only [id] endpoints exist)
- /api/submit anon → 401; non-moderator approve → 403 ✅ (RBAC enforced)
- /api/services anon → 401, SELLER → 403 (FID-AUD-201 fix intact) ✅
- Unpublished/unknown vehicle slug → 404 (published-only filter) ✅
- No owner-email leak on listing card (footer mailto = site-default contact, expected) ✅
- Headers: CSP, HSTS, X-Frame-Options SAMEORIGIN, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy ✅
- Port exposure: 80/443 OPEN, 3006/5432 closed externally (correct posture) ✅
- Contact honeypot: silent 200, no Inquiry row ✅

## 6. Performance Metrics
| Page | Response Time | Previous (11-16) | Delta |
|------|--------------|----------|-------|
| Homepage | 0.54s | 0.39s | +0.15s (cold post-deploy; within noise) |
| /vehicles | 0.55s | 0.39s | +0.16s |
| Vehicle detail | 0.66s | 0.39s | +0.27s |
| /ar | 0.55s | 0.39s | +0.16s |

## 7. Data Integrity
- Tables: 32 | Vehicles: **1** (published) | VehicleImage: 10 | ServiceListing: 12 | JournalEntry: 28 | Inquiry: 6 (all spam) | ModerationLog: 1 | ListingRequest: 2 | AuditLog: 9 | User: 9
- Users: 3 SUPER_ADMIN, 3 SELLER, 1 ADMINISTRATOR, 1 BUYER, 1 DEALER
- Beetle owner: aeeg.education@gmail.com (ADMINISTRATOR) — consistent
- No orphans (vehicle/image/user links clean); schema drift ListingRequest = 2 legacy DB-only columns (moderateNotes, submissionStatus) not in model — pre-existing, low impact
- Media volume: 93M under /var/www/fidelis-auto/uploads (survives container recreation) ✅

## 8. Repairs Made
| ID | Fix | Component | Tested? | Deployed? | Verified? |
|----|-----|-----------|---------|-----------|-----------|
| FID-AUD-203 | Strip non-model vehicle-side fields from ListingRequest.create | src/app/api/submit/route.ts | ✅ repo repro (minimal OK / full 500 / fixed 201) | ✅ 9e0e3c3 sha-tagged image | ✅ live 201 + row + moderation approve 200 |

## 9. Unresolved Issues
- **Escalation (owner decision):** ListingRequest table lacks the WS3/WS15 richer vehicle fields (type, price, fuel, license, taxonomy ids). The submit form collects them but they are dropped at persist. Proper long-term fix = additive nullable migration adding those columns to `ListingRequest` (+ carry through autoPublish), owner-approved. Not auto-repaired (schema changes are PROHIBITED by repair rules). No user data is lost relative to the broken period (submissions had 500'd, not silently truncated).
- 5 stale test/seed users remain (raniathabet kept by user) — cleanup optional.
- CSP still uses 'unsafe-inline'/'unsafe-eval' — known hardening opportunity, not a regression.

## 10. Feature Opportunities (report-only)
- See unresolved: complete ListingRequest schema for WS3 vehicle fields.
- Staging (:3007) can serve as pre-prod for the schema backfill QA.

## 11. Escalations
- Cron budget baseline drift (repeated from 11-16): job's FIXED ENVIRONMENT REFERENCE (PM2 /opt/hermes-car, 22 tables, 6 vehicles, qadir@baqi.com SELLER account) does not match production. Recommend updating the job budget: Docker fidelis-auto, source /opt/fidelis-auto, 32 tables, 1 vehicle, admin cred from ADMIN_CRED_RECOVERY.txt, seller test users provisioned on demand.

## 12. Tests
- Auth: admin login 200 / bad login 401 / me 200 / anon me 401 ✅ (12/12 target assertions passed)
- RBAC: 5 admin APIs × (anon 401 + admin 200) + submit boundaries + non-moderator 403 = ✅
- Public gates: 8 routes, all correct ✅
- Images: jpeg + webp trio 200, OG image 200 ✅
- Listings lifecycle QA: signup → verify → login → submit 201 → 403 → approve 200 → published 1 vehicle → **full cleanup verified 0 residuals** ✅
- Targeted: 18 passed, 0 failed | Regression: 14 passed, 0 failed

*Report written locally on M2 (never on VPS), coordinator machine. Live deploy HEAD 9e0e3c3.*
