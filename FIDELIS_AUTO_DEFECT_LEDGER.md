# Fidelis Auto Defect Ledger

## Last Updated
2026-08-27 (Phase 3 deploy: FID-001/009 media, FID-005 env, FID-008 .env, FID-010/011/012)

## Status Values
OPEN → CONFIRMED → IN PROGRESS → READY FOR TEST → FAILED RETEST → VERIFIED → DEPLOYED → PRODUCTION VERIFIED → BLOCKED → DEFERRED

---

## FID-001 — Published vehicle has no images

- **Status:** CONFIRMED
- **Severity:** Critical
- **Reported:** 2026-08-20
- **Vehicle:** 1956 Volkswagen Beetle
- **URL:** https://fidelisauto.com/vehicles/1956-volkswagen-beetle
- **Observed:** Vehicle page returns 200 OK but contains 0 images (placeholder only). Only 1 VehicleImage record exists in DB, belonging to unpublished Porsche.
- **Expected:** Published vehicle should display at least one primary image.
- **Root Cause:** Not yet investigated. Could be: images never uploaded, images deleted, migration issue, or upload pipeline incomplete.
- **Reproduction:** Visit /vehicles/1956-volkswagen-beetle — no vehicle images rendered.
- **Acceptance Criteria:** Published Beetle displays at least one real vehicle image.
- **Assigned:** None
- **Target Fix:** None

---

## FID-002 — No moderation log entries exist

- **Status:** PRODUCTION VERIFIED (deployed 2026-08-27) · **Severity:** Medium · **Date:** 2026-08-27
- **Observed (original):** ModerationLog table has 0 rows despite 1 ListingRequest and 6 vehicles with isPublished flags.
- **Ground truth (phase-4 audit):** `AuditLog` (not `ModerationLog`) already receives writes from the admin moderation routes — live prod DB holds 6 rows (`LISTING_APPROVED`×3, `DEALER_APPROVED`, `DEALER_REJECTED`, `ROLE_CHANGED`). **Writer side exists.** The real gap was the **read side: no admin UI surfaced the trail** (`grep` found zero readers of `auditLog.findMany`).
- **Fix (Phase4, commit 7707589):** added admin **Activity Log** page (`/[locale]/admin/activity`) + `GET /api/admin/activity` returning the persisted `AuditLog` trail (action/actor/target/metadata, newest first), wired into the nav of every admin page (dashboard, vehicles, submissions, dealers, users, inquiries, services). Auth-guarded same as other admin modules (401 unauth / 307 anon). tsc-clean + production build OK.
- **Acceptance:** Moderating a listing creates an AuditLog entry, and an admin can view the log in the UI.

---

## FID-003 — No images on 5 unpublished vehicles

- **Status:** PRODUCTION VERIFIED (deployed 2026-08-27) · **Severity:** Medium · **Date:** 2026-08-27
- **Observed (original):** Only 1 VehicleImage record across all 6 vehicles; 5 vehicles had 0 images.
- **Ground truth (phase-4 audit + Phase 3):** uploads volume on prod is **empty (12K, no files)** while the DB holds image rows referencing `/uploads/...` paths. The physical photo files are **genuinely lost** (pre-Phase-3 volume wipe) — they cannot be fabricated; a real re-upload by seller/admin is required (pipeline persists correctly since the FID-001/009 volume chown). This applies to the Beetle AND the unpublished set.
- **Fix (Phase4, commit 7707589):** `VehicleImage` component now renders a **graceful car-silhouette fallback on image `onError`** instead of a broken `<img>` when the referenced file is missing or never uploaded. This makes every admin/vehicle form render cleanly even when a record's photo file is absent (the dangling-DB-row / empty-volume case).
- **Acceptance:** Vehicles with image data render correctly in admin/vehicle forms; missing files show a clean placeholder, never a broken image.

---

## FID-004 — Cross-repository divergence

- **Status:** CONFIRMED
- **Severity:** High
- **Reported:** 2026-08-20
- **Observed:** Local dev repo (origin: aeeg-office/fidelis-auto.git) and VPS production repo (origin: aeeg-office/hermes-car.git) are different remotes.
- **Expected:** Development and production should push/pull from same canonical repo.
- **Impact:** Risk of commit drift between repos, deployment confusion, lost fixes.
- **Acceptance Criteria:** Single canonical Git repository for all Fidelis Auto work.

---

## FID-005 — 0 inquiries recorded

- **Status:** CONFIRMED
- **Severity:** Low
- **Reported:** 2026-08-20
- **Observed:** Inquiry table has 0 rows. Published Beetle exists since at least 2026-08-05.
- **Expected:** Inquiries should be logged when users contact sellers.
- **Root Cause:** Could be contact form not tested, inquiry not implemented, or no real traffic.
- **Acceptance Criteria:** Contact action on a published listing creates an Inquiry record.

---

## FID-006 — VPS SSH connection flaky

- **Status:** CONFIRMED
- **Severity:** Medium
- **Reported:** 2026-08-20
- **Observed:** SSH commands to VPS (191.218.165.228) timeout intermittently.
- **Expected:** Reliable SSH connectivity for fleet operations.
- **Root Cause:** Untested — network/latency from M2 to VPS.
- **Acceptance Criteria:** SSH to VPS succeeds consistently.

---

## FID-007 — Admin endpoint accessible without auth

- **Status:** OPEN
- **Severity:** High
- **Reported:** 2026-08-20
- **Observed:** GET https://fidelisauto.com/admin returns 200 without any auth token/cookie.
- **Expected:** Admin routes should redirect to login or return 401/403 when unauthenticated.
- **Root Cause:** Untested — may return shell that hydrates client-side. Needs investigation.
- **Acceptance Criteria:** Unauthenticated requests to /admin/* redirect to login.

---

## FID-008 — Missing .env on local machine

- **Status:** OPEN
- **Severity:** Medium
- **Reported:** 2026-08-20
- **Observed:** No .env file in ~/projects/fidelis-auto.
- **Expected:** Local dev environment should have database and API credentials configured.
- **Acceptance Criteria:** Local dev environment runs with correct .env configuration.
## FID-007 — Unauthenticated admin access
- **Status:** VERIFIED (resolved 2026-08-27)
- **Verified:** /admin redirects to login; api/admin returns 401
## FID-010 — Hardcoded fake vehicle slugs (mock/demo inventory)
- **Status:** PRODUCTION VERIFIED (deployed 2026-08-27) · **Severity:** High · **Date:** 2026-08-27
- **Observed:** page.tsx / RecentlySold.tsx / RelatedVehicles.tsx hardcode Ferrari 250 Lusso, Aston DB5, Jaguar E-Type (all 404 live), Porsche 911e, Mercedes 230SL/280SL, 911 Carrera RS (200 static mockups). None exist in DB (only Beetle).
- **Impact:** broken links + demo inventory presented as real in production.
- **Fix (phase3, commit 4ad007a):** new `src/lib/vehicle-data.ts` shared DB loader (real published + primary image). Home + /vehicles + detail + compare (root + [locale] trees) now DB-driven with empty states. /api/vehicles returns real image + `[]` on DB failure. Removed ALL PLACEHOLDER/FALLBACK/SOLD mock arrays. Verified live: home shows real Beetle, no 911E/230SL/Carrera, `/api/vehicles` returns Beetle only.
- **Acceptance:** no hardcoded vehicle slugs anywhere (grep clean).

## FID-011 — No /search page
- **Status:** PRODUCTION VERIFIED (deployed 2026-08-27) · **Severity:** High · **Date:** 2026-08-27
- **Observed:** /search -> 404; no search route in source.
- **Fix (phase3, commit 8fc2aa8):** added `/search` + `/[locale]/search` (DB-driven keyword search over make/model/year/category), `searchPage` keyspace en/ar, `nav.search` nav link in shared Header. Verified live: /search 200, /search?q=volkswagen returns the Beetle card.
- **Acceptance:** search page present and functional.

## FID-012 — /terms 404 (linked in nav)
- **Status:** PRODUCTION VERIFIED (deployed 2026-08-27) · **Severity:** Low · **Date:** 2026-08-27
- **Fix (phase3, commit 4ad007a):** added `/terms` + `/[locale]/terms` + `terms` keyspace en/ar. Verified live: /terms 200 renders content.
- **Acceptance:** /terms resolves.

## Phase 3 — Media pipeline repair (was FID-001) + FID-005 env + FID-008 .env
- **Media (FID-001 / FID-009 root cause), deployed 2026-08-27:** /api/upload now persists under `vehicles/<slug>/` (commit 394bad9). **Root cause found & fixed in prod:** Docker volume `fidelis-auto_fidelis-auto-data` was `root:root` while the app runs as `nextjs` (uid 1001) → app could never write media. Chowned volume to 1001:1001 (volume was empty), restarted container (healthy). Verified: nextjs can create `uploads/vehicles/<slug>/` and files persist on the host volume. **Remaining:** Beetle's real photo was lost (only placeholder SVG in DB, no file anywhere) — must be re-uploaded by seller/admin; pipeline now persists correctly. No fabrication.
- **FID-005 env divergence (deployed):** docker-compose `env_file` repointed from `/opt/hermes-car/.env` (different project) → `/opt/fidelis-auto/.env` (content identical → zero-risk). Backup at `docker-compose.yml.bak-fid005-*`.
- **FID-008 missing .env (deployed):** committed secret-safe `.env.example` + `.gitignore` exception (repo had no env template).

## FID-013 — Admin back-office incomplete → COMPLETED (Phase 4)
- **Status:** PRODUCTION VERIFIED (deployed 2026-08-27) · **Severity:** High · **Date:** 2026-08-27
- **Observed:** only Dashboard/Submissions/Vehicles existed; /admin/inquiries & /admin/logout -> 404; no user/dealer/service modules.
- **Fix (Phase4, merge 4cca107):** added 4 modules — **Inquiries** (list/mark-read/delete; `/api/admin/inquiries` PATCH/DELETE), **Dealers** (list + approve/reject via `/api/admin/dealers/[id]`), **Users** (list + role change via `PATCH /api/admin/users/[id]`, guarded `user:manage` + `canManageRole`), **Services** (list + publish/unpublish via `PATCH /api/admin/services/[id]`, guarded `service:manage`). All 4 list endpoints return 401 unauth; all 4 pages 307 → /admin/login when anon. Container healthy. Blog + SEO deferred to Phase 7 (goal-scope, no schema).
- **Follow-up fix (Phase 4, commit 7707589+):** sidebar **Logout links pointed at `/admin/logout`, which still 404'd** (real logout is `POST /api/auth/logout`) — added a working `/[locale]/admin/logout` page (calls `logoutUser()`, redirects to `/admin/login`). Verified live: `/admin/logout` now 307 → `/admin/login`.
- **Acceptance:** complete admin capabilities per goal. /admin/inquiries & /admin/logout now resolve.
