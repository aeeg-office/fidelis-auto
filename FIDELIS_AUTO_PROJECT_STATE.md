# Fidelis Auto Project State

## Last Updated
2026-08-20T12:00:00+02:00
Orchestrator: Fidelis Auto Desktop Bot (M2 / AsusSilver)
Source Machine: M2
Active Mission ID: FID-001-canonical-governance-setup

## Current Production State
- Live URL: https://fidelisauto.com
- Deployment Host: VPS 191.218.165.228
- Deployment Commit: c3d0f6b (Fix: move themeColor from metadata to viewport export)
- Repository: github.com/aeeg-office/hermes-car.git (VPS production)
- Repository (local): github.com/aeeg-office/fidelis-auto.git (M2 dev — same HEAD)
- Branch: main
- Database Schema: hermes_car on PostgreSQL localhost:5432
- Migrations: prisma/migrations/20260804_add_category_and_featureduntil
- Services: PM2 (4 instances — fidelis-auto-phase1, phase23, phase4, hermes-car)
- Known Production Defects: See FIDELIS_AUTO_DEFECT_LEDGER.md

## Current Mission
- Title: Fidelis Auto Canonical Project Governance Setup
- Source: Owner instruction (full governance protocol)
- Start Time: 2026-08-20
- Current Phase: State capture and file creation
- Status: IN PROGRESS

## Current Architecture
- Frontend Framework: Next.js (PWA, i18n en/ar)
- Backend: Next.js API routes
- DB/ORM: PostgreSQL + Prisma
- Auth: Server-side session/auth (SUPER_ADMIN, DEALER, SELLER, BUYER roles)
- RBAC: Role-based access (SUPER_ADMIN / DEALER / SELLER / BUYER)
- Listing Architecture: Vehicle model with ownerId FK → User, moderation via isPublished
- Media Architecture: VehicleImage model with src path, sortOrder, category
- Moderation Architecture: isPublished boolean + ModerationLog table
- Featured Listing Architecture: isFeatured boolean + featuredUntil timestamp + Promotion table
- Payment Architecture: Not implemented (Promotion table exists, 0 rows)

## Listing State
- Total Listings: 6
- Published: 1 (1956 Volkswagen Beetle — isPublished=true)
- Pending (unpublished): 5
- Approved/Rejected: 1 ListingRequest approved (Volkswagen Beetle)
- Featured: 0 (no vehicle has isFeatured=true)
- Archived: 0
- Draft: 0
- Known Broken-Media Listings: Published Beetle has NO images. All other vehicles also have no images (except Porsche GT3 RS which has 1 image).
- Known Contact-Routing Defects: 0 inquiries exist, untested.

## Current Audit State
- Latest Audit: None (initial governance setup)
- Critical Count: 1 (published vehicle has no images)
- High Count: 0
- Medium Count: 2 (no moderation log entries; unpublished vehicles have no images)
- Low Count: 0
- Open Regressions: None identified

## Active Workstreams
See FIDELIS_AUTO_ACTIVE_WORKSTREAMS.md

## Completed Work
- Initial state capture (all 6 vehicles, 8 users, 1 dealer, 22 tables)
- Production URL testing (homepage 200, admin 200, vehicles 200, vehicle detail 200)
- Database schema inspection (Vehicle, VehicleImage, User, Dealer, Promotion, ModerationLog, etc.)
- Cross-repository identification (hermes-car.git on VPS, fidelis-auto.git locally)

## In Progress
- Canonical governance file creation
- Cross-machine sync protocol establishment

## Known Defects
See FIDELIS_AUTO_DEFECT_LEDGER.md

## Resolved Defects
None documented yet.

## Test State
See FIDELIS_AUTO_TEST_STATE.md

## Database State
- 22 tables in hermes_car schema
- Vehicle: 6 rows (all status=available)
- VehicleImage: 1 row (2023 Porsche GT3 RS, main.jpg)
- User: 8 rows (2 SUPER_ADMIN, 1 DEALER, 3 SELLER, 2 BUYER)
- Dealer: 1 row (Fidelis Auto Gallery, approved)
- ListingRequest: 1 row (Volkswagen Beetle, approved)
- ModerationLog: 0 rows
- Promotion: 0 rows
- Inquiry: 0 rows
- Conversation: 0
- Message: 0
- Favorite: 0
- AuditLog: 0
- JournalEntry: 0
- NewsletterSubscription: 0

## Deployment State
See FIDELIS_AUTO_DEPLOYMENT_STATE.md

## Fleet State
See FIDELIS_AUTO_FLEET_STATUS.md

## Telegram State
See Telegram connectivity health: needs verification.

## Architecture Decisions
See FIDELIS_AUTO_DECISIONS.md

## Owner Requirements
- Classified-style vehicle marketplace
- One unified login
- Role-based access (SUPER_ADMIN/DEALER/SELLER/BUYER implemented)
- Listing moderation (isPublished flag, ModerationLog exists)
- Featured listings (isFeatured + featuredUntil + Promotion table)
- Contact routing to listing owner
- Multi-language (en/ar i18n)
- PWA support
- Premium vehicle showroom presentation

## Next Actions
1. Create all state files
2. Set up cross-machine A2A sync
3. Test Telegram connectivity
4. Verify canonical bot operation
5. Run test task from non-M2 node

## Blockers
- VPS SSH connection intermittent (timeouts observed)
- Local repo (fidelis-auto.git) and production repo (hermes-car.git) are different remotes
- No VehicleImage records for published Beetle (media gap)