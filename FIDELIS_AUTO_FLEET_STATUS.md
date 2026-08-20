# Fidelis Auto Fleet Status

## Last Updated
2026-08-20T12:00:00+02:00

## Fleet Nodes

| Node | Machine Name | Role | Status | SSH/A2A Reachable | Notes |
|------|-------------|------|--------|--------------------|-------|
| M2 | AsusSilver | Orchestrator / Canonical Context | ACTIVE | LOCAL | Fidelis Auto Desktop Bot running |
| M1 | — | Executor | UNKNOWN | Not tested | |
| M3 | — | Executor | UNKNOWN | Not tested | |
| M4 | — | Executor | UNKNOWN | Not tested | |
| M5 | — | Executor | UNKNOWN | Not tested | |
| M6 | — | Executor | UNKNOWN | Not tested | |
| VPS | 191.218.165.228 | Production Server | ACTIVE | SSH (flaky) | PM2 services running, site live |

## A2A Mesh
- Port 9900: Needs verification across fleet nodes.
- M2 as A2A hub: Ready for configuration.

## Fleet Tunnels (from memory)
| Destination | Tunnel Port |
|-------------|-------------|
| M1 | 22230 |
| M3 | 22231 |
| M6 | 22234 |
| M2 (self) | 22241 |
| M8 | 22227 |
| M9 | 22235 |
| M10 | 22236 |

## Fleet Assignments

| Task | Lead Node | Executor Nodes | Status |
|------|----------|---------------|--------|
| Canonical Governance Setup | M2 | M2 | IN PROGRESS |
| Published Beetle Images (FID-001) | M2 | TBD | PENDING |
| Cross-repo Resolution (FID-004) | M2 | TBD | PENDING |
| Admin Auth Investigation (FID-007) | TBD | TBD | PENDING |

## Fleet Health
- M2: Healthy (Fidelis Auto Desktop Bot operational)
- M1-M6: Not verified this session
- VPS: Live but SSH flaky
- A2A: Not tested between nodes

## Next Fleet Actions
1. Test SSH/A2A connectivity to M1, M3-M6
2. Configure A2A sync protocol between M2 and fleet nodes
3. Test cross-machine task routing
4. Verify Telegram connectivity