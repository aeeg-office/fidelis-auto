# Fidelis Auto Defect Ledger

## Last Updated
2026-08-20T12:00:00+02:00

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

- **Status:** CONFIRMED
- **Severity:** Medium
- **Reported:** 2026-08-20
- **Observed:** ModerationLog table has 0 rows despite having 1 ListingRequest and 6 vehicles with isPublished flags.
- **Expected:** Moderation actions (approve/reject/publish) should create ModerationLog records.
- **Root Cause:** Moderation logging either not implemented or not active.
- **Reproduction:** Check ModerationLog table — empty.
- **Acceptance Criteria:** Moderating a listing creates a ModerationLog entry.

---

## FID-003 — No images on 5 unpublished vehicles

- **Status:** CONFIRMED
- **Severity:** Medium
- **Reported:** 2026-08-20
- **Observed:** Only 1 VehicleImage record across all 6 vehicles. 5 vehicles have 0 images.
- **Expected:** Each vehicle listing should have at least images uploaded before or during creation.
- **Root Cause:** Untested — possibly images were never uploaded, or image upload pipeline has issues.
- **Acceptance Criteria:** Vehicles with image data in DB render correctly on admin/vehicle forms.

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
- **Status:** CONFIRMED · **Severity:** High · **Date:** 2026-08-27
- **Observed:** page.tsx / RecentlySold.tsx / RelatedVehicles.tsx hardcode Ferrari 250 Lusso, Aston DB5, Jaguar E-Type (all 404 live), Porsche 911e, Mercedes 230SL/280SL, 911 Carrera RS (200 static mockups). None exist in DB (only Beetle).
- **Impact:** broken links + demo inventory presented as real in production.
- **Acceptance:** remove/replace with DB-driven data; no hardcoded vehicle slugs.

## FID-011 — No /search page
- **Status:** CONFIRMED · **Severity:** High · **Date:** 2026-08-27
- **Observed:** /search -> 404; no search route in source.
- **Acceptance:** search + filters page for marketplace.

## FID-012 — /terms 404 (linked in nav)
- **Status:** CONFIRMED · **Severity:** Low · **Date:** 2026-08-27
- **Acceptance:** create /terms or remove nav link.


## FID-013 — Admin back-office incomplete
- **Status:** CONFIRMED · **Severity:** High · **Date:** 2026-08-27
- **Observed:** only Dashboard/Submissions/Vehicles exist. /admin/inquiries & /admin/logout -> 404. No user/dealer/service/blog/SEO/moderate modules.
- **Acceptance:** complete admin capabilities per goal.
