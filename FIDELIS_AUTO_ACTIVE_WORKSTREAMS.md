# Fidelis Auto Active Workstreams

## Last Updated
2026-08-20T12:00:00+02:00

## Current Workstreams

| Task ID | Title | Machine | Delegate | Files/Dirs Owned | Status | Dependency |
|---------|-------|---------|----------|-----------------|--------|------------|
| FID-001 | Canonical Governance Setup | M2 | Fidelis Auto Desktop Bot | State files in ~/projects/fidelis-auto/ | IN PROGRESS | None |
| — | State Capture Complete | M2 | Fidelis Auto Desktop Bot | FIDELIS_AUTO_PROJECT_STATE.md | COMPLETED | — |
| — | Listing State Captured | M2 | Fidelis Auto Desktop Bot | FIDELIS_AUTO_LISTING_STATE.md | COMPLETED | — |
| — | Defect Ledger Created | M2 | Fidelis Auto Desktop Bot | FIDELIS_AUTO_DEFECT_LEDGER.md | COMPLETED | — |
| — | Active Workstreams Created | M2 | Fidelis Auto Desktop Bot | FIDELIS_AUTO_ACTIVE_WORKSTREAMS.md | COMPLETED | — |

## Pending Workstreams

| Task ID | Title | Machine | Priority | Notes |
|---------|-------|---------|----------|-------|
| FID-002 | Fix Published Vehicle Images (FID-001) | TBD | Critical | Beetle needs at least one image |
| FID-003 | Single Canonical Repo (FID-004) | TBD | High | Merge fidelis-auto.git and hermes-car.git |
| FID-004 | Admin Auth Protection Check (FID-007) | TBD | High | Verify admin routes auth properly |
| FID-005 | Moderation Logging (FID-002) | TBD | Medium | Wire ModerationLog recording |
| FID-006 | Vehicle Image Upload Pipeline | TBD | Medium | Ensure images can be uploaded for all vehicles |
| FID-007 | Telegram Connectivity Test | M2 | Medium | Verify Telegram ingress/egress works |
| FID-008 | VPS SSH Stability | TBD | Medium | Diagnose flaky SSH from M2 |
| FID-009 | Local .env Setup | M2 | Medium | Configure local dev environment |

## Active File Ownership
| File | Owner | Status |
|------|-------|--------|
| ~/projects/fidelis-auto/FIDELIS_AUTO_PROJECT_STATE.md | M2 Fidelis Auto Bot | LOCKED (writing) |
| ~/projects/fidelis-auto/FIDELIS_AUTO_LISTING_STATE.md | M2 Fidelis Auto Bot | LOCKED (writing) |
| ~/projects/fidelis-auto/FIDELIS_AUTO_DEFECT_LEDGER.md | M2 Fidelis Auto Bot | LOCKED (writing) |
| ~/projects/fidelis-auto/FIDELIS_AUTO_ACTIVE_WORKSTREAMS.md | M2 Fidelis Auto Bot | LOCKED (writing) |
| ~/projects/fidelis-auto/FIDELIS_AUTO_TEST_STATE.md | M2 Fidelis Auto Bot | PENDING |
| ~/projects/fidelis-auto/FIDELIS_AUTO_DEPLOYMENT_STATE.md | M2 Fidelis Auto Bot | PENDING |
| ~/projects/fidelis-auto/FIDELIS_AUTO_DECISIONS.md | M2 Fidelis Auto Bot | PENDING |
| ~/projects/fidelis-auto/FIDELIS_AUTO_CHANGELOG.md | M2 Fidelis Auto Bot | PENDING |
| ~/projects/fidelis-auto/FIDELIS_AUTO_FLEET_STATUS.md | M2 Fidelis Auto Bot | PENDING |
| ~/projects/fidelis-auto/FIDELIS_AUTO_CANONICAL_CONTEXT_STATUS.md | M2 Fidelis Auto Bot | PENDING |

## Conflict Zones
- No concurrent workstreams active — no conflicts.
- Cross-repository (fidelis-auto.git vs hermes-car.git) is a known divergence risk.