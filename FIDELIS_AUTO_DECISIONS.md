# Fidelis Auto Decisions

## Last Updated
2026-08-20T12:00:00+02:00

## Architecture Decisions

### AD-001 — Fidelis Auto Desktop Bot on M2 is Canonical Context
- **Date:** 2026-08-20
- **Decision:** The Fidelis Auto bot running in Hermes Desktop on M2 (AsusSilver) is the canonical project context for all Fidelis Auto work.
- **Rationale:** Prevents disconnected history across Telegram, fleet machines, and sessions. Ensures one source of truth for project state, listing state, defects, and architecture.
- **Implications:** All Fidelis Auto tasks from any origin must synchronize with M2 before execution.
- **Status:** ACTIVE

### AD-002 — State Files Stored in Local Repo
- **Date:** 2026-08-20
- **Decision:** All FIDELIS_AUTO_*.md state files live in ~/projects/fidelis-auto/ and are git-tracked.
- **Rationale:** Durable recovery companion to the bot's in-session context. Survives restarts and context compression.
- **Implications:** State files must be committed and pushed after significant updates.
- **Status:** ACTIVE

### AD-003 — Single Canonical Git Repo Required
- **Date:** 2026-08-20
- **Decision:** The cross-repo situation (fidelis-auto.git locally, hermes-car.git on VPS) must be resolved to a single canonical repository.
- **Rationale:** Prevents commit drift, deployment confusion, and lost fixes.
- **Options:** 
  - Move VPS to fidelis-auto.git (update origin on VPS)
  - Move local to hermes-car.git (update origin locally)
  - Merge both into a new canonical repo
- **Status:** PENDING

## Product Decisions

### PD-001 — Vehicle Contact Routes to Listing Owner
- **Date:** Permanent business rule (from project spec)
- **Decision:** For ordinary marketplace listings, the contact action routes to the listing owner (seller), not to Fidelis Auto.
- **Rationale:** Standard classified marketplace model. Seller owns their listing and its contact relationship.
- **Implications:** listing.userId / ownerId must always be set. Contact UI must route by owner.
- **Status:** ACTIVE

### PD-002 — Listing Moderation via isPublished Flag
- **Date:** Current architecture
- **Decision:** Vehicle listings use boolean isPublished for moderation. Supporting ListingRequest and ModerationLog tables exist.
- **Rationale:** Simple approve/reject workflow for current phase.
- **Implications:** Future state machine (DRAFT → PENDING_REVIEW → APPROVED) may be desirable.
- **Status:** ACTIVE

### PD-003 — Featured Listings Currently Free
- **Date:** Current product policy
- **Decision:** Featured listings are free (no payment required). Promotion table and isFeatured/featuredUntil fields support future paid model.
- **Rationale:** Current phase focuses on platform quality before monetization.
- **Implications:** Future paid featured listings must use Promotion table. Do not hardcode free status in frontend.
- **Status:** ACTIVE

### PD-004 — Multi-language (en/ar) Support
- **Date:** Current architecture
- **Decision:** Fidelis Auto supports English and Arabic via [locale] prefix.
- **Rationale:** Serves Egypt/GCC markets.
- **Implications:** All content routes must handle i18n. Default locale is English.
- **Status:** ACTIVE

## Operational Decisions

### OD-001 — M2 Orchestrates, M1-M6 Execute
- **Date:** 2026-08-20
- **Decision:** M2 is the orchestration authority. M1-M6 and delegates are the execution layer.
- **Rationale:** Clear separation of concerns. M2 holds canonical context and coordinates work.
- **Implications:** Fleet machines must A2A sync with M2 before executing Fidelis Auto tasks.
- **Status:** ACTIVE

### OD-002 — Defect Status Lifecycle
- **Date:** 2026-08-20
- **Decision:** Defects follow: OPEN → CONFIRMED → IN PROGRESS → READY FOR TEST → FAILED RETEST → VERIFIED → DEPLOYED → PRODUCTION VERIFIED → BLOCKED → DEFERRED
- **Rationale:** Strict lifecycle prevents premature closure. Browser/functional verification required before closing.
- **Implications:** No defect is resolved until production-verified and state-updated.
- **Status:** ACTIVE

## Previous Decisions (Pre-Governance)
- Next.js PWA with i18n
- Prisma ORM + PostgreSQL
- Role-based auth (SUPER_ADMIN/DEALER/SELLER/BUYER)
- PM2 process management
- Server-side rendering (Next.js App Router)
- Slug-based vehicle URLs (/vehicles/{slug})
- VPS hosting at 191.218.165.228

## Superseded Decisions
None yet.