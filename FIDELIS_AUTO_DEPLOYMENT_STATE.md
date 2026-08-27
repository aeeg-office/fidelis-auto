# Fidelis Auto Deployment State

## Last Updated
2026-08-28 (Phase 4)

## Current Deployment
| Field | Value |
|-------|-------|
| Host | VPS 191.218.165.228 |
| Domain | fidelisauto.com |
| Project Path | /opt/fidelis-auto |
| Git Remote | github.com/aeeg-office/fidelis-auto.git |
| Branch | main |
| HEAD Commit | 4cca107 - "Merge phase4-backoffice into main: FID-013 back-office" |
| Services | Docker container fidelis-auto (fidelis-auto-fidelis-auto) @ port 3006 |
| DB | PostgreSQL hermes_car @ localhost:5432 (host service, PG16) |
| Media volume | fidelis-auto-fidelis-auto-data -> /app/public/uploads (uid 1001) |
| Deployed | 2026-08-27T22:41:57Z (Phase 4: Inquiries/Dealers/Users/Services) |
| Health | Healthy |
## PM2 Services
| Name | Status | Notes |
|------|--------|-------|
| fidelis-auto-phase1 | ONLINE | Live traffic |
| fidelis-auto-phase23 | ONLINE | Live traffic |
| fidelis-auto-phase4 | ONLINE | Live traffic |
| hermes-car | ONLINE | Live traffic |

## Rollback Point
- Git HEAD is c3d0f6b
- No deployment tags found
- No versioned rollback documented

## Known Deployment Issues
1. **Cross-repository divergence**: VPS runs from `hermes-car.git`, local dev from `fidelis-auto.git`. Same HEAD commit suggests same content, but different remote URLs create risk.
2. **No CI/CD**: All deployments are manual (git push + PM2 restart on VPS).
3. **No deployment log**: No deployment timestamps or notes exist.
4. **No staging environment**: Production only.
5. **No rollback script**: No documented rollback procedure.
6. **No health check endpoint**: No /api/health or monitoring endpoint confirmed.

## Deployment History
| Timestamp | Commit | Change | Deployer |
|-----------|--------|--------|----------|
| Unknown | c3d0f6b | themeColor fix to viewport export | Unknown |
| Unknown | prior commits | Earlier state | Unknown |

## Local Dev Environment
| Field | Value |
|-------|-------|
| Path | ~/projects/fidelis-auto |
| Git Remote | github.com/aeeg-office/fidelis-auto.git |
| Branch | main |
| HEAD Commit | c3d0f6b |
| .env | MISSING |
| DB | Not connected locally |
| Build | Next.js (needs .env to run) |

## Next Deployment Actions
1. Resolve cross-repo divergence (choose single canonical repo)
2. Configure CI/CD
3. Add version tags
4. Document rollback procedure
5. Add health monitoring endpoint