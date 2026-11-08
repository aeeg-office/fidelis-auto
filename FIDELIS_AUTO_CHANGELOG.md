# Fidelis Auto Changelog

## 2026-11-08 — WS16: AdSense L+ integration (env-gated, dark by default)

### Added
- `src/lib/adsense.ts` — shared env gate: `NEXT_PUBLIC_ADSENSE_CLIENT` (ca-pub id) validated at module top level (also inlined into client bundles by Next); `ADSENSE_ENABLED` + one-time `ADSENSE_LOADER_URL` exports.
- `AdSlot` (`src/components/AdSlot.tsx`) reworked from broken placeholder to a functional, env-gated slot: renders the `ins.adsbygoogle` unit + bilingual "Advertisement" label when a ca-pub id is configured; pushes once via `(window.adsbygoogle || []).push({})` (queue-safe, StrictMode-guarded). With no id it renders `null` — zero DOM, zero network, no "configure me" chrome ever.
- Root layout (`src/app/[locale]/layout.tsx`) emits the adsbygoogle loader `<Script>` (afterInteractive) only when `ADSENSE_LOADER_URL` is non-empty.
- Slots mounted (one per page, capped): Journal list + detail (leaderboard), Search results (in-feed mid-grid, only when ≥4 results), Vehicle detail (bounded 300px rectangle below description, clear of gallery/contact CTAs). `data-ad-slot` uses stable placement tokens (`journal-list`, `journal-detail`, `search-results`, `vehicle-detail`) to be swapped for real numeric unit ids when publisher config exists.
- Bilingual label keys already present under `adSlots` (`Advertisement` / `إعلان`); removed the now-dead `configureAdSense` key. `.env.example` documents the new var.

### Verified
- `npx tsc --noEmit` and `npm run lint` pass.
- **Gate proof, no id:** production build + served HTML contain zero occurrences of `adsbygoogle` / `pagead2.googlesyndication.com` anywhere in `.next`; no `<script>` loader and no `<ins class="adsbygoogle">` in response HTML; placeholder never renders.
- **Gate proof, with id (`ca-pub-0000000000000000`):** build output contains the one-time loader `<script src="…/adsbygoogle.js?client=ca-pub-0000000000000000">` and `<ins class="adsbygoogle" data-ad-slot-id="journal-list">` in journal HTML — gate works in both directions.
- Push: `feat/ws16-adsense` → origin (HEAD sha reported in commit).


## 2026-08-28 — Phase 5: Listing Workflow (FID-002 + FID-005)
- **FID-002 (medium) resolved:** added `model ModerationLog` to `prisma/schema.prisma` (maps existing live table) + idempotent migration `20260828_phase5_moderation_log`; wired `prisma.moderationLog.create` into auto-approve (`src/lib/auto-publish.ts`, action `AUTO_APPROVED`) and admin approve/reject (`src/app/api/admin/submissions/[id]/route.ts`, `LISTING_APPROVED`/`LISTING_REJECTED`). Runtime write+read+delete round-trip verified.
- **FID-005 (low) resolved:** `/api/contact` now persists an `Inquiry` row (`source: contact-form`, `vehicleId` resolved from `vehicleSlug`) before the Resend email; `ContactSellerButton` + `ContactForm` thread `vehicleSlug` through the contact page (`/contact` + `/[locale]/contact`, wrapped in Suspense for `useSearchParams`). Live-verified via POST /api/contact → Inquiry row created; test rows cleaned.
- Merged to `main` (`968f97a`), deployed, container `fidelis-auto` healthy on :3006.
- **Note:** `Vehicle` table empty in prod (was 1 Beetle at 06:00, 0 at 10:02) — pre-dates Phase 5 code changes; flagged for owner.


## 2026-08-20 — Initial Canonical Governance Setup

### Added
- FIDELIS_AUTO_PROJECT_STATE.md — full canonical project state
- FIDELIS_AUTO_LISTING_STATE.md — detailed listing inventory
- FIDELIS_AUTO_DEFECT_LEDGER.md — defect tracking (8 defects identified)
- FIDELIS_AUTO_ACTIVE_WORKSTREAMS.md — task/workstream registry
- FIDELIS_AUTO_TEST_STATE.md — test coverage baseline
- FIDELIS_AUTO_DEPLOYMENT_STATE.md — deployment configuration
- FIDELIS_AUTO_DECISIONS.md — architecture/product/operational decisions
- FIDELIS_AUTO_CHANGELOG.md — this file
- FIDELIS_AUTO_FLEET_STATUS.md — fleet readiness tracking
- FIDELIS_AUTO_CANONICAL_CONTEXT_STATUS.md — governance activation report

### Discovered
- Production site at fidelisauto.com — LIVE (Next.js PWA, en/ar)
- 6 vehicles in DB, 1 published (1956 Volkswagen Beetle)
- Published Beetle has NO images — Critical defect
- Cross-repository divergence: local (fidelis-auto.git) vs VPS (hermes-car.git)
- Admin endpoint serves page without auth — needs investigation
- 0 ModerationLog entries
- 0 promotions / featured listings
- 0 inquiries
- 8 users (2 SUPER_ADMIN, 1 DEALER, 3 SELLER, 2 BUYER)
- 1 approved dealer (Fidelis Auto Gallery)
- 22 database tables
- PM2: 4 instances active
- VPS SSH connection intermittent (timeouts observed)
- Local dev environment missing .env file

### Changed
- Fidelis Auto Desktop Bot on M2 established as canonical project context
- Cross-machine synchronization protocol documented
- Source precedence rules established
- File ownership and locking rules defined

## Earlier (Pre-Governance — reconstructed)
- c3d0f6b — Fix: move themeColor from metadata to viewport export (Next.js deprecation fix)
- Database migrations for category and featured-until columns
- PM2 deployment with 4 phases
- User/seller/dealer/vehicle seed data## 2026-08-28 — Automated Listing Approval (auto-approve feature)

### Added
- `src/lib/ad-scanner.ts` — ad-text violation scanner (email, phone in prose, wa.me/whatsapp/telegram handles, "@"/"dot com", external URLs, spam phrases, profanity, excessive all-caps)
- `src/lib/auto-publish.ts` — converts a clean ListingRequest into a live published Vehicle owned by the submitting user, with unique slug and linked photo rows
- Automated approval in `src/app/api/submit/route.ts`:
  - Clean ad text → submission auto-`approved` + Vehicle auto-created (`isPublished=true`) + photos attached → goes live immediately
  - Violations found / auto-publish error → routes to manual moderation (`status=pending`) with reason, nothing lost

### Notes
- The seller's own `phone`/`email` contact fields are legitimate and excluded from the scan (they are format-validated upstream) — the phone/email rules catch off-platform harvesting in the free-text ad body only
- Frontend message stays intentionally generic ("our team will review") for clean/VIP submits; DB state is authoritative

### Verified (real browser, 2026-08-28)
- Clean submission → `approved` + published Vehicle `volkswagen-beetle-1998`, 6 photos, 1 primary, renders on public site, owned by submitting user
- Violation submission (phone in description) → `pending`, no Vehicle created
- Merged to `main` (`87dfdb1`); container `fidelis-auto` healthy on :3006
