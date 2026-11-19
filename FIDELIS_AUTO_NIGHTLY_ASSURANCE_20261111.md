# Fidelis Auto Nightly Assurance — 2026-11-11 (run 01:30 EET)
Status: ⚠️ PARTIAL

> **Deployment note:** live app runs on Docker **`fidelis-auto`** :3006 (nginx proxy_pass
> 127.0.0.1:3006). The nightly spec's `/opt/hermes-car` + PM2 `hermes-car/fidelis-auto-phase*`
> are **obsolete / stale** — no such PM2 processes exist. Audited the live deployment.
> Repo HEAD = `8fcdafc` (ar-journal merge), image tagged `8fcdafc68043...`, started 11-09.

## 1. Production Health
- Homepage: ✅ (load 0.51s)
- Arabic /ar: ✅ 200
- Vehicles list: ✅ 200 (0.39s)
- Published vehicle detail (volkswagen-beetle-1959): ✅ 200 (0.79s)
- Admin page: ✅ /admin → 307 redirect to login (guard works)
- DB: ✅ hermes_car, 29 tables, 1 Vehicle / 1 published / 10 VehicleImage
- Container: ✅ fidelis-auto "Up 37 hours (healthy)"
- Disk: 43% used, 56 GB free
- RAM: 2.1/7.8 GiB used

## 2. New Production Defects
| ID | Route | Severity | Description | Reproduced? |
|----|-------|----------|-------------|-------------|
| FID-AUD-210 | POST /api/submit | **HIGH** | SELLER listing submission → **500 PrismaClientValidationError**. Running `.next` bundle embeds an OLD `ListingRequest` model (only id/status/notes/createdAt/updatedAt/user); repo/prisma-generate + DB have the full model (userId, make, model, year…). Sellers **cannot submit any listing**. Root cause: stale build artifact, not code. | ✅ (2 payloads, both 500; logged) |
| FID-AUD-211 | POST /api/auth/login | LOW | Bare empty POST (no body/CT) → **500**, should be 400. `{}` with JSON CT correctly returns 400 {"Email and password required"}. | ✅ |

## 3. Known Defect Status
| ID | Previous | Current | Notes |
|----|----------|---------|-------|
| FID-001 | Beetle no images (Critical) | ✅ RESOLVED | Beetle now serves 10 real JPEGs (200 image/jpeg), all from /uploads/ |
| FID-002 | No ModerationLog (Medium) | ✅ RESOLVED | ModerationLog count now 2 |
| FID-003 | No images on unpublished (Medium) | ✅ N/A | Only 1 vehicle exists (published); no unpublished vehicles to cover |
| FID-004 | Cross-repo divergence (High) | ⚠️ PARTIAL | `/opt/hermes-car` fully obsolete (PM2 gone). Live = `/opt/fidelis-auto` (Docker). Ledger text references old slug `1956-volkswagen-beetle` — real slug is `volkswagen-beetle-1959`. |
| FID-005 | 0 inquiries (Low) | ⚠️ CHANGED | 5 Inquiry rows exist; no new from this run |
| FID-006 | VPS SSH flaky (Medium) | ✅ IMPROVED | SSH stable this run (no retries needed) |
| FID-007 | Admin routes 200 w/o auth (High) | ✅ RESOLVED | /admin→307; admin APIs 401 anon / 403 SELLER / 200 SUPER_ADMIN |

## 4. Regressions
- None. /vehicles, login, admin RBAC, upload (401 anon), services (SELLER 403 per FID-AUD-201 design) all behave correctly.

## 5. Security Findings
- Header posture strong: CSP (frame-ancestors none), HSTS preload, XFO SAMEORIGIN, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy (camera/mic/geolocation blocked).
- RBAC boundary verified against live API: SELLER → 403 on all admin list endpoints (users/dealers/services/inquiries/journal); SUPER_ADMIN → 200.
- /admin → 307 (no anonymous admin panel exposure). .env / server-status → 404 (no leakage).
- Listing-page mailto: only site footer `aeeg.education@gmail.com` (site default, expected) — no per-listing owner-identity leak.

## 6. Performance Metrics
| Page | Response Time | Previous | Delta |
|------|--------------|----------|-------|
| Homepage | 0.51s | — | baseline |
| Vehicles list | 0.39s | — | baseline |
| Vehicle detail | 0.79s | — | baseline |

## 7. Data Integrity
- Vehicle count: 1 — Published: 1 (Beetle 1959)
- Users: 9 total — BUYER 1, SELLER 3, DEALER 1, ADMINISTRATOR 1, SUPER_ADMIN 3
- ServiceListing: 12, JournalEntry: 28, Inquiry: 5, ModerationLog: 2, ListingRequest: 3 (pre-clean)
- No orphan VehicleImage (10 rows all on the single published Vehicle)
- **NOTE:** ledger test accounts (`qadir@baqi.com`, `qadir@fidelisauto.com`) do **not** exist in DB — ledger credentials are stale

## 8. Repairs Made
| ID | Fix | Component | Tested? | Deployed? | Verified? |
|----|-----|-----------|---------|-----------|-----------|
| QA cleanup | Removed qa.seller@fidelis.test user + ListingRequest + ModerationLog | DB | ✅ (residue 0) | — | ✅ psql count 0 |

No production code repairs this run (audit-only; pending approval for the rebuild below).

## 9. Unresolved Issues
- **FID-AUD-210 (HIGH)**: submit → 500. Ready-to-run fix (requires controlled rebuild — NOT auto-executed):
  ```
  ssh -i ~/.ssh/id_ed25519_aeeg_vps root@191.218.165.228
  cd /opt/fidelis-auto && rm -rf .next node_modules/.cache   # clear stale Turbopack artifacts
  # run deploy-fidelis.sh 8fcdafc (npm ci + prisma generate + next build + recreate)
  # rollback available: deploy-fidelis.sh rollback
  ```
  Verify after: `curl -XPOST https://fidelisauto.com/api/submit` (seller session) → 201 pendingModeration.
- **FID-AUD-211 (LOW)**: login bare empty POST → 500; add body-parse guard.

## 10. Feature Opportunities
- (report-only) Beetle listing could add a DealerProfile (currently 0) to enable phone/whatsapp fallback and dealer identity.

## 11. Escalations
- **Stale nightly spec**: the run book points to `/opt/hermes-car` + PM2, but the live deployment is Docker `fidelis-auto` (+staging :3007) at `/opt/fidelis-auto`. The spec's machine/environment reference should be updated to the Docker model or future runs will target the wrong host.
- **FID-AUD-210 needs a human-authorised rebuild** of the production image (safe, rollback-capable, but a full container rebuild/restart).
- Ledger test-credentials are dead; provisioning a real SELLER test account before each run is advised.

## 12. Tests
- Targeted: 14 pass, 1 fail (submit 500), 1 low (empty-login 500)
- Regression: all public routes OK; RBAC boundary holds