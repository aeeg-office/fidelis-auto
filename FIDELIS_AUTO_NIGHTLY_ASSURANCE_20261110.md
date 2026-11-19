# Fidelis Auto Nightly Assurance — 2026-11-10
Status: ✅ PASS
Run ID: nightly_20261110_2330 UTC (01:30 Cairo)
Core finding: production is healthy; environment has evolved (live app now in Docker, not PM2); no new defects; 3 known defects resolved.

## 1. Production Health
- Homepage: ✅ (0.38s, HTTP 200 after apex redirect, contains "We Love Cars")
- Admin: ⚠️ page 200 (client-side login gate) — API layer fully guarded (401)
- DB: ✅ (27 tables; 1 vehicle published; 9 users; clean data)
- Containers: ✅ fidelis-auto (prod :3006) + fidelis-auto-staging (:3007) both Up/healthy — app runs in DOCKER, not PM2
- Disk: 55% used, 45 GB free
- RAM: 2.1 GB / 7.8 GB used

## 2. New Production Defects
(none)

## 3. Known Defect Status
| ID | Previous | Current | Notes |
|----|----------|---------|-------|
| FID-001 | Critical — Beetle placeholder only | ✅ RESOLVED | Beetle now has 10 VehicleImage rows; 10 jpg + sharp WebP trio all HTTP 200 |
| FID-002 | Medium — no moderation log | ✅ IMPROVED | 1 AUTO_APPROVED ModerationLog entry now exists (was 0); still no human approve/reject logged |
| FID-003 | Medium — no images on 5 unpublished | ✅ N/A | Only 1 vehicle exists in DB now (5 unpublished were removed) |
| FID-004 | High — cross-repo divergence | ✅ BY DESIGN | /opt/hermes-car (c3d0f6b) is stale leftover; LIVE app builds from /opt/fidelis-auto (HEAD 8fcdafc) in Docker — task reference env is outdated, not a defect |
| FID-005 | Low — 0 inquiries | ✅ RESOLVED | 5 inquiries; 2 real (Rania, Julia Fredenbug), 3 test artifacts |
| FID-006 | Medium — VPS SSH flaky | ✅ OK | Connected first attempt this run |
| FID-007 | High — admin 200 without auth | ⬇️ LOW (downgraded) | Client-side page gate only; ALL admin APIs return 401 unauthenticated; no data exposure. Cosmetic, non-blocking |

## 4. Regressions
(none)

## 5. Security Findings
- Admin API guards verified: /api/admin/dealers, /journal, /services → **401** no-auth; dashboard 404 (by-design); vehicles 405 POST-only (by-design) — RBAC boundary holds
- /api/auth/me anon → 401; bad login → 401
- **No owner-email leak on listings**: Beetle seller contact is `wa.me/201060618899` (real phone); `mailto:aeeg.education@gmail.com` appears only in site FOOTER (expected site-default, per policy)
- Headers: HSTS(preload) max-age=31536000, CSP with `frame-ancestors 'none'`, X-Frame-Options SAMEORIGIN, nosniff, strict-origin-when-cross-origin referrer, restrictive permissions-policy
- robots.txt disallows /admin, /api, /verify; sitemap/robots all reference correct apex `fidelisauto.com` (no stale-domain leakage)

## 6. Performance Metrics
| Page | Response Time | Notes |
|------|--------------|-------|
| / (home) | 0.38s | |
| /vehicles | 0.38s | |
| /vehicles/volkswagen-beetle-1959 | 0.68s | heaviest (image gallery) |
| /journal | 0.48s | |
| /services | 0.45s | |

## 7. Data Integrity
- Vehicle count: 1 (published)
- Users by role: SUPER_ADMIN 3, ADMINISTRATOR 1, DEALER 1, SELLER 3, BUYER 1 (9 total, all present)
- ServiceListings: 12 (all published, 1 owner)
- JournalEntry: 28 total / 27 published
- Inquiries: 5 | ModLog: 1 | VehicleImage: 10 | AuthSession: 55
- Orphan/duplicate check: no orphan VehicleImages; 22 _prisma_migrations applied

## 8. Repairs Made
(none required this run)

## 9. Unresolved Issues
- /admin serves HTTP 200 (client-side login swap at same URL) instead of 401/redirect — LOW, cosmetic; auth system untouched (repair PROHIBITED category)
- /opt/hermes-car stale copy remains on VPS — cleanup candidate, not harmful (live runs from Docker image)

## 10. Feature Opportunities
- Human moderation: ModerationLog only holds AUTO_APPROVED; the approve/reject review workflow can be exercised to populate human decision records
- Dealer insurance: 1 published listing; reviewer/share flows present — consider adding social-proof/reviews now while catalog is small
- /opt/hermes-car stale dir could be archived/stubbed to remove the cross-repo confusion flagged by FID-004

## 11. Escalations
- Task-prompt environment reference is STALE: test accounts (qadir@baqi.com, qadir@fidelisauto.com), 6-vehicle DB state, PM2 processes, hermes-car source, and 1956-slug no longer match production. Future nightly runs should trust the live-status probe (Docker fidelis-auto, /opt/fidelis-auto, 1 published vehicle) — update the fixed reference to avoid false findings.

## 12. Tests
- Targeted: 4/4 pass (home, vehicles, filter API, published detail + image assets 200)
- Guard checks: 6/6 pass (admin APIs 401, me 401, bad login 401, unpublished slug 404)
- Regression: 15 routes probed — all expected status codes (only 1956-slug 404s, correct since current model is 1959)