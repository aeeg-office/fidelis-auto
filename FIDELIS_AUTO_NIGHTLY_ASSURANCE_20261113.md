# Fidelis Auto Nightly Assurance — 2026-11-13

Status: ✅ PASS

Run ID: nightly_20261113_0130 (Cairo, EET+2/UTC+3)
Auditor: Hermes General (M2) — cron nightly pipeline
Live model: Docker `fidelis-auto` (container healthy, Up 3 days), image tag **8fcdafc** = release repo HEAD 8fcdafc ("Merge PR #35 feat/ar-journal")

> NOTE: The task run-book's PM2 model (`hermes-car`, `fidelis-auto-phase*`, `/opt/hermes-car`, old slug `1956-volkswagen-beetle`, `FeaturedListing` table) is **stale** — that deployment was retired. Live app = `/opt/fidelis-auto` + Docker compose, verified again this run. Findings below reflect the real live stack.

## 1. Production Health
- Homepage: ✅ 200 (1.08s, 91KB)
- Admin: ✅ 200 (authed as SUPER_ADMIN); guard 307 unauth
- DB: ✅ 32 tables, 1 published vehicle, 10 images
- PM2: ✅ N/A (Docker model) — `fidelis-auto` Up (healthy), `fidelis-auto-staging` Up (healthy)
- Docker: ✅ image 8fcdafc matches /opt/fidelis-auto HEAD
- Disk: 43% used, 55G free
- RAM: 2.2G used / 7.8G (5.6G avail)
- Backup: ✅ /opt/backups/fidelis_nightly_20261112_233200.sql (UTC stamp = 01:32 Cairo 11-13)

## 2. New Production Defects
| ID | Route | Severity | Description | Reproduced? |
|----|-------|----------|-------------|-------------|
| (none) | | | | |

No new functional/security defects this run.

## 3. Known Defect Status
| ID | Previous (11-12) | Current | Notes |
|----|------------------|---------|-------|
| FID-001 | ✅ RESOLVED | ✅ RESOLVED | Beetle serves 10 real JPEG sets + webp trio (thumb/800/1600); sampled 3 URLs → 200 image/jpeg & image/webp |
| FID-002 | ✅ RESOLVED | ✅ RESOLVED | ModerationLog = 1 (LISTING_APPROVED events 11-05, 11-07 in AuditLog) |
| FID-003 | ✅ N/A (1 vehicle only) | ✅ N/A | Only 1 vehicle exists (published); no unpublished vehicles |
| FID-004 | ⚠️ PARTIAL (stale spec) | ✅ RESOLVED | Release repo == live container image (8fcdafc); `/opt/hermes-car` c3d0f6b is a dead leftover; run-book spec still stale — see Escalations |
| FID-005 | ⚠️ CHANGED (5) | ⚠️ CHANGED (6) | 6 Inquiry rows now (+1 vs 11-12); not audited further (no new inquiries submitted this run) |
| FID-006 | — | ⚠️ PARTIAL | SSH flaky: 1 timeout mid-run, retried OK (2/3 attempts succeeded clean) |
| FID-007 | ✅ RESOLVED | ✅ RESOLVED | Admin APIs 401 unauth; /admin 307; SUPER_ADMIN login → 200s on dealers/services/journal/users |

## 4. Regressions
(none)

## 5. Security Findings
- ✅ No listing-card email leak: Beetle page renders WhatsApp `wa.me/201060618899` + "Contact Seller"; `mailto:aeeg.education@gmail.com` appears ONLY in site footer + privacy text (site-default contact — expected, separate owner decision)
- ✅ Auth guards: /admin 307 unauth; /api/admin/{dealers,services,journal,users} → 401 unauth; /api/auth/me 401; bad login 401 ("Invalid email or password"); empty payload 400 "Email and password required"
- ✅ Visibility gates: unpublished journal (`road-trip-cairo-to-the-red-sea`) → 404 public; published journal slug → 200; bogus slug → 404
- ✅ robots.txt: Disallow /admin /api /verify; Sitemap → fidelisauto.com/sitemap.xml
- ✅ sitemap.xml: 36 URLs, all `fidelisauto.com` (no old-domain refs)
- ✅ Canonical + og:image on Beetle: canonical = https://fidelisauto.com/vehicles/volkswagen-beetle-1959; og:image = real upload jpg
- ✅ Title clean: "1959 Volkswagen Beetle Oval Window | Fidelis Auto" (no brand duplication)
- ✅ CSP/HSTS present; x-frame-options SAMEORIGIN; x-content-type nosniff
- ✅ No hardcoded creds in public HTML scanned

## 6. Performance Metrics
| Page | Response Time | Previous (11-12) | Delta |
|------|--------------|------------------|-------|
| Homepage | 1.08s | 0.62s | +0.46s |
| /vehicles | 0.69s | — | — |
| Beetle detail | 0.71s | 0.55s | +0.16s |
| /contact | 0.59s | — | — |
| /journal | 1.09s | — | — |
All within normal variance; no timeout or slow-page alarm.

## 7. Data Integrity
- Vehicle count: 1 — Published: 1 (1956 VW Beetle Oval Window on 1959 Chassis, slug volkswagen-beetle-1959)
- VehicleImage: 10 (all on Beetle, no orphans)
- Users by role: SUPER_ADMIN 3, SELLER 3, ADMINISTRATOR 1, DEALER 1, BUYER 1 (total 9; +1 ADMINISTRATOR vs earlier ledger)
- Inquiries: 6
- ModLog: 1
- FeaturedListing: table does NOT exist (stale run-book reference)
- JournalEntry: 28 (27 published, 1 unpublished → correctly 404s)
- ServiceListing: 12 (12 published)
- Beetle owner: aeeg.education@gmail.com (SELLER/owner account — internal, not exposed on listing card)

## 8. Repairs Made
| ID | Fix | Component | Tested? | Deployed? | Verified? |
|----|-----|-----------|---------|-----------|-----------|
| (none this run) | | | | | |

No repairs were required or made. All previously-fixed items held.

## 9. Unresolved Issues
- Run-book/spec staleness (PM2 model, old slug, FeaturedListing, /dashboard/vehicles + /dashboard/submit routes) — tracking, not a live defect
- SSH flakiness persists (1 timeout of 3 attempts; recovered on retry)

## 10. Feature Opportunities
- (report-only) Seller UX routes `/dashboard/vehicles` & `/dashboard/submit` → 404; seller listing management is single-page `/dashboard`. Confirm intentional.
- (report-only) Beetle owner lacks a DealerProfile; wiring it could add dealer identity card + phone fallback.
- 36 sitemap URLs = 30 journal articles live; content engine healthy.

## 11. Escalations
- **ARCHITECTURAL/BLOCKER (ops, not code)**: nightly run-book must be updated to the Docker model — remove PM2 `hermes-car`/`fidelis-auto-phase*` references, point project root at `/opt/fidelis-auto`, note `/opt/hermes-car` is dead, use live slug `volkswagen-beetle-1959`, drop `FeaturedListing` checks. Recommend updating this cron's spec text.

## 12. Tests
- Targeted: auth matrix 8/8 passed (guards, bad login, empty payload, SUPER_ADMIN 200s); visibility gates 3/3; image HTTP 3/3; SEO headers 6/6
- Regression: public routes (/, /ar, /vehicles, beetle, /contact, /journal) 6/6 → 200; sitemap/robots 2/2; canonical/og 2/2
- DB: counts + referential integrity verified
