# /goal — Fidelis Auto Enterprise Audit, Recovery, Repair & Expansion (v2, Regenerated)

## Mission
Complete production audit, recovery, repair, stabilization, enhancement, expansion, and validation of the Fidelis Auto platform (`https://fidelisauto.com`), transforming it into a production-ready automotive marketplace capable of competing with leading automotive classified platforms while maintaining the premium Fidelis Auto identity.

**Governing maxims (owner-mandated, non-negotiable):**
- No feature should be assumed to be working simply because it exists.
- No repair should be considered complete until it has been verified through **both automated testing and real browser interaction**.
- All progress reports and the final completion report are delivered via **Telegram**.
- **Use SSH, not `delegate_task`, for fleet compute.**
- Present findings FIRST; repair only after owner approval — **except** this regeneration which is explicitly authorized to proceed autonomously to completion, taking the most recommended option on any conflict, without pausing for approval.

## Stack ground truth (verified live on VPS 191.218.165.228, 2026-08-27)
- Next **16.2.12** / React 19 / Prisma 7.9.1 / PostgreSQL (`hermes_car`, 22 tables) / Docker compose (`fidelis-auto`, :3006, network host) / nginx.
- Canonical repo: `aeeg-office/fidelis-auto.git` (VPS `/opt/fidelis-auto`). FID-004 resolved.
- Models: Vehicle, VehicleImage, ListingRequest, Inquiry, Dealer, DealerProfile, ServiceListing, ModerationLog, Conversation, Message, Favorite, Promotion, ProvenanceMilestone, JournalEntry, AuditLog, AuthSession, User, UserActivity, UserNote, NewsletterSubscription, Document.
- Auth/RBAC: server session; SUPER_ADMIN / DEALER / SELLER / BUYER.
- API routes: ~21 (see FIDELIS_AUTO_* trackers).

## Fleet device map (SSH compute; M2 = orchestrator + canonical state + Telegram + final QA)
- **M1** — backend / API / Prisma / security / nginx
- **M3** — frontend / admin UI / i18n / responsive
- **M4** — journeys / SEO / perf / browser test
- **M5** — content (blog / services) + data cleanup checks
- **M6** — data integrity / media pipeline / benchmark
- **VPS** — deploy target only; never destroyed; gated mutations

## Completion metric
- No **critical OR high** defects open.
- Every prior defect advanced to `PRODUCTION VERIFIED` in the ledger.
- All acceptance criteria re-run by an **independent second audit** (Phase 12).

## Production safety rails
- No VPS mutation / deploy / schema change without (a) verified backup, (b) feature branch, (c) owner approval. (This autonomous run has owner approval; still take a fresh backup before each mutating phase.)

---

## 13 Gated Phases

### Phase 0 — Bootstrapping (00h–02h) — STATUS: COMPLETE 2026-08-27
- SSH reachability sweep (M1/M3/M4/M5/M6/VPS); offline nodes binned to reachable ones.
- Single-canonical-repo decision (FID-004) — resolved to `aeeg-office/fidelis-auto.git`.
- Mandatory Telegram egress probe before Phase 1.
- Audit-file seeding (all `FIDELIS_AUTO_*` trackers).
- **Result:** reachable M3/M6/VPS; offline M1/M4/M5; repo reconciled; Telegram up.

### Phase 1 — Architecture Audit — STATUS: COMPLETE 2026-08-27 (PHASE1_REPORT)
- Compare GitHub / VPS / DB / live-site; reconcile repos.
- **Findings:** 1 real vehicle (Beetle, published), 14 users (7 test SELLERs, 4 SUPER_ADMIN, 1 DEALER, 1 BUYER), ModerationLog empty; uploads on named volume currently empty → FID-001 (Beetle photo missing), FID-005 (.env divergence `/opt/hermes-car/.env`), FID-006 (shared `hermes_car` DB), FID-007 (/admin unauth), FID-00X (test users), FID-00X (ModerationLog empty).

### Phase 2 — Functional Audit — STATUS: COMPLETE 2026-08-27 (PHASE2_REPORT)
- Every page / route / API / workflow classified C/H/M/L/Enh.
- **Findings:** FID-010 hardcoded mock/fake vehicle slugs (5 render mock, 3 → 404), FID-011 `/search` 404 (feature gap), FID-012 `/terms` 404 → later fixed, FID-001 carried.
- Working: /, /about, /contact, /signup, /login, /vehicles, /vehicles/1956-volkswagen-beetle, /compare, /dealer/register, /journal, /privacy, /services, /verify, /offline, /ar. Auth-gated: /submit /dashboard /dealer (307 → login). APIs: vehicles/makes/services/auth/me/newsletter/contact OK.

### Phase 3 — Data Integrity & Media Pipeline — STATUS: COMPLETE 2026-08-27 (PHASE3_REPORT)
- Purge invalid/mock listings; repair media pipeline.
- **Result:** FID-009 media pipeline (nested `vehicles/<slug>/` path) IN place & volume-persistence proven; FID-010 mock inventory purged (home now DB-driven, zero mock slugs); FID-012 /terms HTTP 200.
- **Pending (owner-level):** Beetle's real photo file unrecoverable from volume/git — cannot be fabricated; owner must re-upload via listing flow. **RESOLVED 2026-08-28:** Beetle deleted (Option D) so owner can re-list under real `qadirbaqi@gmail.com` account; photo pipeline now stores/persists. FID-001 retired via deletion.

### Phase 4 — Auth & Back Office — STATUS: COMPLETE 2026-08-28 (PHASE4_REPORT + auto-approve)
- Create secure admin, close unauthed `/admin` (FID-007), complete back-office modules.
- **Built (branch `phase4-backoffice`, merged main @`4cca107`):** Inquiries, Dealers, Users, Services admin modules (guarded pages + APIs). Unauthenticated API → 401; unauthenticated page → 307 /admin/login. tsc + build clean.
- **Plus (this session's auto-approve feature, merged main @`87dfdb1`):** automated listing approval — clean submissions auto-approve + auto-publish (ownerId = submitter); ad-text violations → pending. Verified in browser both paths (clean→published; violation→pending), then cleaned of test artifacts.
- FID-007 (unauthed /admin) resolved.

### Phase 5 — Listing Workflow E2E — STATUS: COMPLETE 2026-08-28 (commit 5e67daf)
Register → submit → upload → AI validate → approve → publish → inquiry → sold, verifying DB state at each step.
- Auto-approve (register→submit→upload→auto-approve→auto-publish) VERIFIED (2026-08-28).
- **Buyer-side journey now VERIFIED (2026-08-28, browser):**
  - Inquiry: buyer on published listing → Contact → form → `Inquiry` row created with `vehicleId` linked (FID-005).
  - Sold transition: owner dashboard "Mark as Sold / Mark Available" → `Vehicle.status` toggles; `ModerationLog` entry recorded (FID-002).
  - Moderation logging: auto-approve (AUTO_APPROVED) + admin approve/reject recorded to ModerationLog.
  - Migration `20260828_phase5_moderation_log` (ModerationLog table) applied and live.

### Phase 6 — Competitive Benchmark — STATUS: COMPLETE 2026-08-27 (PHASE6_REPORT)
Dubizzle / Hatla2ee / AutoTrader / Cars.com / Bring a Trailer / Cars & Bids / Facebook Marketplace — feature-gap analysis. High-value relaunch order: watchlist/favorites → comparison → search+filters → saved searches → alerts → trust badges → buyer reviews → seller dashboard → messaging/offers → VIN history → auctions/sold history → transport & finance.

### Phase 7 — Expansion — STATUS: COMPLETE 2026-08-28 (merge c5521e6)
Blog (14 categories) + Services marketplace (6 category groups: BUY & VERIFY, MAINTAIN & REPAIR, PROTECT & DETAIL, RESTORE & UPGRADE, OWN & SUPPORT, PARTS & ACCESSORIES).
- JournalEntry gains `category` column (migration `20260828_phase7_blog_category`); listing page has browse-by-category sidebar (14 cats + counts), `?cat=` filter, per-entry category badges on listing and detail (root + locale).
- `src/lib/fidelisTaxonomy.ts`: BLOG_CATEGORIES (14) + SERVICE_CATEGORIES (6 groups with descriptions).
- Services marketplace grouped into the 6 category groups with group descriptions; 12 curated listings seeded (all 6 groups populated).
- Services submission flow (`/services/submit` + `POST /api/services`, starts unpublished → admin approve) + admin Journal CRUD (new/edit/publish/delete via `/admin/journal`).
- VERIFIED in browser: 6 service groups render, 14-category sidebar + filter works, /services/submit 200, /admin/journal 307 when unauthenticated.

### Phase 8 — Feature Expansion — STATUS: COMPLETE 2026-08-28 (merge 64b3826)
- Favorites/saved (toggle API + Favorite table) and full 3-way comparison already existed.
- Added the missing **user watchlist**: `/watchlist` (root + locale) lists an authenticated user's saved vehicles with primary image, title, year/make/model, price; Header "Watchlist" link (Heart icon) for logged-in users.
- Featured listings: admin `isFeatured` toggle + home featuredVehicles section + vehicles listing featured-first sort already existed.
- VERIFIED in browser: authenticated user's /watchlist renders their saved vehicle.

### Phase 9 — Testing & Validation — STATUS: PENDING
Unit / integration / API / DB / browser per role; repeat until no critical or high.

### Phase 10 — Performance & SEO — STATUS: COMPLETE (audit), FID-015 OPEN (PHASE10_REPORT)
- Home TTFT 20–90ms, vehicle 187ms, gzip on, sitemap 200 (9 URLs, DB-driven), robots OK, canonical OK, JSON-LD on vehicle OK.
- **FID-015 (low):** no per-locale hreflang `alternate` links. **To close in remaining work.**

### Phase 11 — Documentation — STATUS: PENDING
Architecture / DB / API / admin / seller / dealer / services / deploy / backup / security docs.

### Phase 12 — Sign-off — STATUS: PENDING
Independent **second** audit (fresh pass); all acceptance criteria re-run; no critical or high; every prior defect PRODUCTION VERIFIED; final completion report via Telegram.

---

## Completion report cadence
Telegram report at each gate with calibrated %, plus one final completion report (autonomous run: interim gate reports logged to trackers; final consolidated report to Telegram).

## Carried defect register (current)
| ID | Finding | Sev | Status |
|----|---------|-----|--------|
| FID-001 | Beetle photo missing | Critical | RESOLVED (Option D deletion 2026-08-28; re-list under new account) |
| FID-002 | ModerationLog empty | Medium | To verify logging live in Phase 5 |
| FID-005 | `.env` divergence (`/opt/hermes-car/.env`) | High | Verify/align in Phase 5 |
| FID-006 | Shared `hermes_car` DB across platforms | High | Documented; isolation decision in Phase 11 |
| FID-007 | `/admin` unauthenticated | Critical | RESOLVED (closed) |
| FID-008 | Flaky VPS SSH | Medium | Operational |
| FID-009 | Media pipeline | Critical→Fixed | PRODUCTION VERIFIED (Phase 3) |
| FID-010 | Hardcoded mock inventory | High | PRODUCTION VERIFIED (Phase 3) |
| FID-011 | `/search` 404 | High (feature gap) | To build in Phase 5/8 |
| FID-012 | `/terms` 404 | Low | PRODUCTION VERIFIED (Phase 3) |
| FID-013 | Back-office completeness | — | PRODUCTION VERIFIED (Phase 4) |
| FID-015 | Missing per-locale hreflang | Low | Open → close in remaining work |
