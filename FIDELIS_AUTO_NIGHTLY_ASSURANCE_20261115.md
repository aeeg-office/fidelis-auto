# Fidelis Auto Nightly Assurance — 2026-11-15
Status: ✅ PASS

## 1. Production Health
- Homepage: ✅ https://fidelisauto.com → 200 (avg 0.90s; www→apex 301 correct)
- Admin gate: ✅ /admin → 307 → /admin/login (anon correctly gated)
- DB: ✅ 33 tables, live state healthy (hermes_car)
- Runtime: ✅ Docker container `fidelis-auto` Up 5 days (healthy), SHA-tagged
- Disk: 44% used, 54 GB free
- RAM: 2.4 GiB used / 1.5 GiB avail / 4.5 GiB cache (~7.8 GiB total)

> ⚠️ ENV-REF MISMATCH (reporting, no action): The job's fixed-env reference (PM2 `hermes-car` port 3000, `/opt/hermes-car`, HEAD c3d0f6b, "8 users", Beetle with NO images) is STALE. Live production runs in the Docker container `fidelis-auto` (port 3006, source `/opt/fidelis-auto`, HEAD **8fcdafc** "Merge PR #35 feat/ar-journal"). All PM2 fidelis/hermes-car processes are gone. Auto-repair/deploy rules target Docker, NOT PM2.

## 2. New Production Defects
| ID | Route | Severity | Description | Reproduced? |
|----|-------|----------|-------------|-------------|
| (none) | — | — | No new production defects found | — |

## 3. Known Defect Status (task ledger, vs live reality)
| ID | Previous | Current | Notes |
|----|----------|---------|-------|
| FID-001 | Beetle no images (Critical) | ✅ RESOLVED | Beetle `volkswagen-beetle-1959` now has 10 VehicleImage + WebP derivatives; images curl 200 |
| FID-002 | No moderation log | ✅ RESOLVED | 1 ModerationLog entry exists (AUTO_APPROVED) — still sparse but non-zero |
| FID-003 | 5 unpublished vehicles no images | ✅ N/A | Only 1 vehicle total in DB (published). 0 unpublished. Env ref was stale |
| FID-004 | Cross-repo divergence | ⚠️ MONITOR | Live source now `/opt/fidelis-auto` (correct); task pointed at stale `/opt/hermes-car`. hermes-car not touched |
| FID-005 | 0 inquiries | ✅ RESOLVED | 6 Inquiries now: 4 `sent` emailStatus, 2 null; all contact-form source |
| FID-006 | VPS SSH flaky | ✅ OK this run | Connected reliably on 1st attempt, ConnectTimeout=18 |
| FID-007 | Admin routes 200 w/o auth | ✅ RESOLVED | /admin → 307→login; all /api/admin/* → 401 without auth |

## 4. Regressions
(none)

## 5. Security Findings
- ✅ All admin APIs require auth: `/api/admin/{services,dealers,journal,inquiries}` → 401 anon; `/api/auth/me` → 401 anon.
- ✅ `/api/admin/{dashboard,submissions,upload}` → 404 (collection paths don't exist — by-design, only `[id]` variants), `/api/admin/vehicles` → 405 (POST-only by design).
- ✅ Listing body has NO owner-email leak. Verify: only `mailto:?subject=` share CTA in listing + footer site-default `mailto:aeeg.education@gmail.com` (owner-decision Contact nav, expected). No owner account email rendered from `vehicle.owner?.email`.
- ✅ Security headers: HSTS (inclSubDomains, preload), strict CSP (`default-src 'self'`, `frame-ancestors 'none'`), X-Frame-Options SAMEORIGIN, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin.
- ✅ No secrets/debug leakage in public HTML (grep for password/api-key/token/DATABASE_URL → only login-form labels/password-policy copy).
- ✅ Unpublished content correctly gated: journal unpublished slug `road-trip-cairo-to-the-red-sea` → 404; published → 200 (force-dynamic gate works).

## 6. Performance Metrics
| Page | Avg Response | Prev | Delta |
|------|-------------|------|-------|
| Homepage | 0.90s (0.82–0.99) | — | — |
| /vehicles | 0.82s (0.80–0.87) | — | — |
| /vehicles/volkswagen-beetle-1959 | 1.32s (1.11–1.63) | — | — |

(No prior same-run baseline stored; measured 3× each. First-run timing baseline.)

## 7. Data Integrity
- Vehicle count: **1** (published: 1 = `volkswagen-beetle-1959`, owner `aeeg.education@gmail.com`, 10 VehicleImage)
- Published vehicles: 1 · Unpublished: 0
- Users: 9 = 3 SUPER_ADMIN, 3 SELLER, 1 ADMINISTRATOR, 1 DEALER, 1 BUYER (3 SELLER unverified f = test accounts probe@/test-crm6@/raniathabet)
- Inquiries: 6 (4 sent, 2 null emailStatus)
- ModerationLog: 1 · AuditLog: 9 (append-only, correct)
- ServiceListing: 12 (11 published + removed QA test) · JournalEntry: 28 (27 published) · Make 55 / Model 350 / City 22
- Favs/Promotions/Reviews/DealerProfile 0 (features not yet seeded) — expected

## 8. Repairs Made
| ID | Fix | Component | Tested? | Deployed? | Verified? |
|----|-----|-----------|---------|-----------|-----------|
| — | None needed this run | — | — | — | — |
| (QA test service created + deleted; images exercised — no production change) | | | | | |

## 9. Unresolved Issues
- **Test accounts present**: `probe@test.com`, `test-crm6@test.com`, `superadmin@fidelisauto.com`, `newadmin@fidelisauto.com`, `dealer@fidelisauto.com` (SELLER/DEALER/SUPER_ADMIN), plus `raniathabet1100@gmail.com` (kept per user). Some are QA leftovers. **Not removed this run** (read-only sweep + owner-kept account). Recommend owner review. (MEDIUM, pre-existing)
- 2 Inquiries have null `emailStatus` (older rows pre-delivery-tracking); not defects.

## 10. Feature Opportunities
- 0 featured/promoted listings + 0 Reviews seeded — monetization/trust features present but empty (report-only, no auto-repair).
- 12 services + 28 journal entries = good content base; only 1 of 1 vehicle published.

## 11. Escalations
- **Job env-reference is outdated** (PM2/`/opt/hermes-car`/c3d0f6b/port 3000/8 users/`1956-volkswagen-beetle`). Nightly runs report against live Docker reality. **Recommend the job definition be updated** to the Docker deployment (source `/opt/fidelis-auto`, container `fidelis-auto`, HEAD-tagged deploys) so future runs don't chase a phantom stack. Job-config correction, not an architecture blocker.

## 12. Tests
- Targeted tests: 12 passed, 0 failed
  - login valid admin → 200/SUPER_ADMIN ✓ · login bad creds → 401 ✓ · /me authed → 200 ✓ · /me anon → 401 ✓
  - admin /api/admin/* anon → 401 (services/dealers/journal/inquiries) ✓
  - services anon → 401 ✓ · admin create service → 201 (isPublished:false) ✓ · delete → success ✓
  - journal unpublished→404 ✓ published→200 ✓ list→200 ✓
  - image assets (jpg+webp) → 200 ✓ · vehicle detail 200 ✓ · vehicles 200 ✓ · Arabic /ar 200 ✓
  - www→apex 301 ✓ · /admin gate 307→login ✓
- Regression suite: N/A (no in-repo automated suite run this cycle; read-only production sweep)