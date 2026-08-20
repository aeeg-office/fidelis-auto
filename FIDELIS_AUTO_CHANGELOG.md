# Fidelis Auto Changelog

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
- User/seller/dealer/vehicle seed data