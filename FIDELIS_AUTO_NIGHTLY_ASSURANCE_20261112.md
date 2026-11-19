# Fidelis Auto Nightly Assurance — 2026-11-12 (run 01:30 EET)
Status: ⚠️ PARTIAL — one HIGH defect (seller submit 500) blocks the core listing workflow; requires an authorized production image rebuild.

> **Deployment note:** live app runs on Docker **`fidelis-auto`** :3006 (nginx proxy_pass 127.0.0.1:3006). The nightly spec's `/opt/hermes-car` + PM2 `hermes-car/fidelis-auto-phase*` are **obsolete / stale** (no such PM2 processes). Audited the live deployment. Live repo `/opt/fidelis-auto` HEAD = `8fcdafc` (ar-journal merge), image tagged `8fcdafc68043...`, started 11-09. Both prod (:3006) and staging (:3007) containers Up/healthy.

## 1. Production Health
- Homepage: ✅ 200 (0.62s)
- Arabic /ar: ✅ 200 (0.55s)
- Vehicles list: ✅ 200 (0.54s)
- Published vehicle detail (volkswagen-beetle-1959): ✅ 200 (0.55s)
- Admin: ✅ /admin → 307 → /admin/login (guard works)
- DB: ✅ hermes_car, 29 tables, 1 Vehicle / 1 published / 10 VehicleImage
- Containers: ✅ fidelis-auto + fidelis-auto-staging "Up 2 days (healthy)"
- Disk: 43% used, 55 GB free
- RAM: 2.3/7.8 GiB
- Backup: ✅ pg_dump → /opt/backups/nightly_20261112.sql (456K)

## 2. New Production Defects
| ID | Route | Severity | Description | Reproduced? |
|----|-------|----------|-------------|-------------|
| — | (none new this run) | — | All findings are carry-overs; no previously-unknown defects introduced | — |

> **Note:** Audited the seller + admin + public workflows completely. No NEW defect surfaced beyond the two known ones below.

## 3. Known Defect Status
| ID | Previous | Current | Notes |
|----|----------|---------|-------|
| **FID-AUD-210** | HIGH, not fixed | ⚠️ **STILL HIGH — reproduce + root cause confirmed** | POST /api/submit → **500** for a verified SELLER. **Root cause (proven from container stderr):** running `.next` bundle embeds an OLD Prisma `ListingRequest` client (only `id/status/notes/createdAt/updatedAt/user`). `normalizeListingSubmission()` produces the current shape (`userId`, `make`, `model`, `year`, `mileageUnit`, `vehicleType`…) → `prisma.listingRequest.create()` throws `Unknown argument 'userId'`. DB has the full 28-column model; repo schema has the full model; only the **compiled client in the running image is stale**. Fix = controlled image rebuild (`rm -rf .next node_modules/.cache && npm ci && npx prisma generate && npm run build` via deploy-fidelis.sh). **NOT auto-executed — blocked for human authorization** (production container rebuild). |
| FID-AUD-211 | LOW, not fixed | ⚠️ LOW — still present | Bare empty POST to /api/auth/login (no Content-Type) → **500**; `{}` with JSON CT → 400 (correct). Add body-parse guard. Non-blocking. |
| FID-001 | Beetle no images (Critical) | ✅ RESOLVED | Beetle serves 10 real JPEGs (all 200 image/jpeg, from /uploads). Verified each URL. |
| FID-002 | No ModerationLog | ⚠️ CHANGED | ModerationLog = 1 (was 2 last run). Requires human review of moderation history integrity. Was previously "resolved" at 2. Inference: prior QA/test moderation entries may have been cleaned; logged for attention. |
| FID-003 | No images on unpublished | ✅ N/A | Only 1 vehicle exists (published); no unpublished vehicles to cover. |
| FID-004 | Cross-repo divergence (High) | ⚠️ PARTIAL | `/opt/hermes-car` fully obsolete (PM2 gone). Live = `/opt/fidelis-auto` (Docker). Ledger/spec text references old slug `1956-volkswagen-beetle`, `FeaturedListing`, `ModerationLog` counts, PM2 names, and `/dashboard/vehicles` + `/dashboard/submit` routes — all non-existent in this build. |
| FID-005 | 0 inquiries | ⚠️ CHANGED | 5 Inquiry rows persist; no new from this run. |
| FID-006 | VPS SSH flaky | ✅ IMPROVED | SSH stable this run; only 1 transient scp warning (file still landed). |
| FID-007 | Admin routes 200 w/o auth (High) | ✅ RESOLVED | /admin→307; all admin APIs 401 anon / 403 SELLER / 200 SUPER_ADMIN. Full matrix re-verified this run. |

## 4. Regressions
- None. Public routes, RBAC boundary, admin guard, moderation guards all hold.

## 5. Security Findings
- **Header posture strong** (re-verified): CSP `frame-ancestors 'none'`, HSTS preload, XFO SAMEORIGIN, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy blocks camera/mic/geolocation.
- **RBAC boundary verified live** (API-first): admin endpoints → 200 SUPER_ADMIN / 403 SELLER / 401 anon. Verified for users, dealers, services, inquiries, journal.
- **No owner-identity leak**: listing page renders only site-footer mailto `aeeg.education@gmail.com` (site default, expected); no per-listing owner email.
- **Unpublished/orphan access**: old/incorrect slug 404s correctly.
- No hardcoded credentials exposed in public pages; `.env`/server-status → 404.
- Moderation/workflow guards: approve PATCH anon → 401; services POST anon → 401; upload anon → 401.

## 6. Performance Metrics
| Page | Response Time | Previous (11-11) | Delta |
|------|--------------|------------------|-------|
| Homepage | 0.62s | 0.51s | +0.11s |
| Vehicles list | 0.54s | 0.39s | +0.15s |
| Vehicle detail | 0.55s | 0.79s | −0.24s |
| /ar | 0.55s | — | baseline |
*(All within acceptable range; variance normal.)*

## 7. Data Integrity
- Vehicle count: 1 — Published: 1 (Volkswagen Beetle 1959)
- VehicleImage: 10 (all on the single published vehicle, no orphans)
- Users: 9 — SUPER_ADMIN 3, SELLER 3, ADMINISTRATOR 1, BUYER 1, DEALER 1
- ServiceListing: 12, JournalEntry: 28, Inquiry: 5, ModerationLog: 1, ListingRequest: 2 (pre-clean)
- No orphan VehicleImage; all image URLs resolve 200
- QA account `qa.nightly.seller@fidelis.test` provisioned + deleted; residual 0 (User + ListingRequest + AuthSession)
- **NOTE:** ledger seller creds (`qadir@baqi.com`, `qadir@fidelisauto.com`) do not exist in DB — ledger is stale

## 8. Repairs Made
| ID | Fix | Component | Tested? | Deployed? | Verified? |
|----|-----|-----------|---------|-----------|-----------|
| QA cleanup | Provisioned + deleted verified QA SELLER; scoped deletes to fidelis.test domain | DB | ✅ (residue 0) | — | ✅ psql 0 |

No production code repairs this run (audit-only). FID-AUD-210 remains the single blocking item, pending a human-authorized image rebuild.

## 9. Unresolved Issues
- **FID-AUD-210 (HIGH) — submit 500, root cause proven.** Ready-to-run fix (controlled rebuild, rollback-capable):
  ```
  ssh -i ~/.ssh/id_ed25519_aeeg_vps root@191.218.165.228
  cd /opt/fidelis-auto && rm -rf .next node_modules/.cache
  # run deploy-fidelis.sh 8fcdafc  (npm ci + prisma generate + next build + container recreate)
  # rollback: deploy-fidelis.sh rollback
  ```
  Verify after: seller session → POST /api/submit → **201** (pendingModeration).
- **FID-AUD-211 (LOW)**: login bare empty POST → 500; add body-parse guard.
- **Seller UX routes**: `/dashboard/vehicles` and `/dashboard/submit` → 404 (they do not exist in this build; only `/dashboard`). Confirm whether seller listing management is intentionally single-page or a missing route.

## 10. Feature Opportunities
- (report-only) Beetle listing has 0 DealerProfile despite owner DEALER data existing at user level; wiring a DealerProfile could unlock phone/WhatsApp fallback + dealer identity card.

## 11. Escalations
- **FID-AUD-210 requires a human-authorized production image rebuild** (full container rebuild + restart; safe, rollback-capable, but not auto-executed per audit-first policy).
- **Stale nightly spec**: still points to `/opt/hermes-car` + PM2 `hermes-car/fidelis-auto-phase*`, slugs `1956-volkswagen-beetle`, a `FeaturedListing` table, and `/dashboard/vehicles` + `/dashboard/submit` routes — none exist in the current Docker deployment. Recommend updating the run book to the Docker model.
- **ModerationLog count dropped 2→1** — flagged for review of moderation history integrity.

## 12. Tests
- Targeted: RBAC matrix + auth + moderation + seller-flow + images: **20 pass, 2 known-fail (submit 500 = FID-AUD-210; empty-login 500 = FID-AUD-211)**
- Regression: all public routes OK; RBAC boundary holds (anon 401 / SELLER 403 / SUPER_ADMIN 200)