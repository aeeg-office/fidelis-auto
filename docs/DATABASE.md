# Fidelis Auto — Database Reference

Database: `hermes_car` (PostgreSQL). Managed via Prisma schema (`prisma/schema.prisma`).
Migrations are **applied manually** with `psql` (`sudo -u postgres psql -d hermes_car -f <migration.sql>`),
not `prisma migrate deploy`. Each migration lives under `prisma/migrations/`.

## Models (Prisma), primary tables
- **Vehicle** — listing core. `status` (`available`/`sold`/`pending`), `isPublished`, `isFeatured`, `featuredUntil`, `category` (Modern/Classic/Vintage/EV/Other), `ownerId`.
- **VehicleImage** — `src`, `isPrimary`, `category` (exterior/…), `sortOrder`, exif.
- **Document / ProvenanceMilestone / JournalEntry** — supporting docs, provenance, blog. JournalEntry has `category` (Phase 7).
- **Inquiry** — buyer contact; `vehicleId` (from `vehicleSlug`), `isRead`, `source`.
- **ModerationLog** — audit of approve/reject/auto-approve/mark-sold: `action`, `previousStatus`, `newStatus`, `vehicleId`, `listingRequestId`, `moderatorId`, `targetUserId`.
- **User / AuthSession** — accounts + session tokens (SHA-256 hash, expiry).
- **AuditLog** — activity audit.
- **DealerProfile / ListingRequest / ServiceListing** — dealer, submission→approval, services (Phase 7: 6 category groups).
- **NewsletterSubscription / Favorite** — newsletter + user watchlist (unique `userId`+`vehicleId`).
- **Conversation / Message** — messaging.

## Key longitudinal conventions
- Listings/vehicles owned via `ownerId` FK → `User` (onDelete Cascade where noted).
- `Favorite.vehicle` onDelete Cascade; `AuthSession.user` Cascade.
- id is `cuid()` by default; `ModerationLog.id` uses `gen_random_uuid()::text`.

## Manual migrations applied (chronological)
- `20260804_add_category_and_featureduntil`
- `20260811_phase1_audit_governance`, `phase1_legacy_schema_reconciliation`, `phase1_unified_auth_and_dealers`
- `20260811_phase2_listing_moderation_audit`
- `20260811_phase3_services_marketplace`
- `20260828_phase5_moderation_log` (ModerationLog table)
- `20260828_phase7_blog_category` (JournalEntry.category)

## Shared-DB note (FID-006)
`hermes_car` is shared with other platforms (`/opt/hermes-car/.env` historically).
Env for this app now points at `/opt/fidelis-auto/.env` with identical content (FID-005 resolved).
Isolation decision: keep shared DB; prefix table usage is namespaced by model. Documented for Phase 11.