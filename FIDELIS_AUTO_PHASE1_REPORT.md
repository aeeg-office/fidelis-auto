# Fidelis Auto — Phase 1 Architecture Discovery Report
**Date:** 2026-08-27 · **Node:** M2 orchestrator (verified live on VPS)
**Status:** COMPLETE — findings grounded in live production inspection

---

## 1. Topology
- **Live site:** https://fidelisauto.com (nginx → `127.0.0.1:3006`)
- **Runtime:** Docker container `fidelis-auto` (image `fidelis-auto-fidelis-auto`), `network_mode: host`, restarted `unless-stopped`, healthy.
- **Compose:** `/opt/docker/fidelis-auto/docker-compose.yml` (context `/opt/fidelis-auto`, Dockerfile there).
- **Resource limits:** mem 768M, cpus 0.30; healthcheck curl `localhost:3006`.
- **Other containers (co-hosted on same VPS):** `lumaani` (3004), `fcg` (3000), and PM2 app `aeeg`. Fidelis Auto is independent of these.

## 2. Source / Build
- **Repo (canonical):** `aeeg-office/fidelis-auto.git`
  - VPS `/opt/fidelis-auto` at `main` = `8ed0346` (origin/main). ✅ FID-004 resolved — no longer hermes-car.
  - Build: `.next` present (BUILT). Next **16.2.12** / React 19 / Prisma 7.9.1 / PostgreSQL.
  - Blocks: Volume mount only for `/app/public/uploads`.
- **Git history:** `5eaa3a4` project-governance init (trackers + 6 vehicles/8 users claim), `90d19e6` placeholder SVGs (Beetle, GT3 RS), `8ed0346` i18n matcher excludes /images & /uploads.

## 3. Configuration (secrets masked)
- `env_file: /opt/hermes-car/.env` ← **divergence:** container reads the OLDER platform's env, not `/opt/fidelis-auto/.env`.
- Env keys present: `ADMIN_BOOTSTRAP, ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD, DATABASE_URL, NEXT_PUBLIC_SITE_URL, NODE_ENV, RESEND_API_KEY`.
- **DB:** both env files point to `:5432/hermes_car` — Fidelis Auto **shares the old platform's database**.

## 4. Database (Postgres `hermes_car`, 22 tables)
Engineer tables: `Vehicle, VehicleImage, ListingRequest, Inquiry, Dealer, DealerProfile, ServiceListing, ModerationLog, Conversation, Message, Favorite, Promotion, ProvenanceMilestone, JournalEntry, AuditLog, AuthSession, User, UserActivity, UserNote, NewsletterSubscription, Document, _prisma_migrations`.

**Ground truth (differs from tracker claim of "6 vehicles / 8 users"):**
- Vehicles: **1** — `1956 Volkswagen Beetle` (`isPublished=t`, status `available`).
- Users: **14** — roles: SELLER ×7 (mostly `test-*`, `temp-mail.org` test/demo accounts), SUPER_ADMIN ×4 (`admin@`, `superadmin@`, `newadmin@fidelisauto.com`), DEALER ×1, BUYER ×1.
- ModerationLog: **0** rows.

## 5. Media / Persistence (FID-001 root cause)
- **Uploads live on named Docker volume:** `fidelis-auto_fidelis-auto-data → /app/public/uploads`.
- **Volume is currently EMPTY** (no files).
- Beetle image records (2): placeholder SVG `/images/...svg` (primary) + **real photo** `/uploads/vehicles/1956-volkswagen-beetle/69701a6a-10f8-43c9-a557-0397e75a98a4.jpg` (non-primary).
- **Root cause:** DB references a real `.jpg` that **does not exist on disk** — the file was lost (volume not populated/persisted across rebuild), so only the placeholder renders. Phase 3 must repair the media pipeline + recover/re-upload the real photo.

## 6. Fleet status (Phase 0)
- Reachable: **M3 ✓, M6 ✓, VPS ✓.** Offline: M1, M2 (this node is orchestrator), M4, M5 (no route/timeout). Work redistributed to reachable nodes; discovery was VPS-local and unaffected.

## 7. First-class findings for tracker
| ID | Finding | Sev |
|----|---------|-----|
| FID-001 | Beetle real photo missing from uploads volume (placeholder only) | Critical |
| FID-005 | Container reads `/opt/hermes-car/.env` (config divergence) | High |
| FID-006 | DB is shared `hermes_car` w/ older platform (tenant/schema isolation risk) | High |
| FID-007 | `/admin` unauthenticated (from prior audit) — verify now | Critical |
| FID-00X | 7 test/demo user accounts in production | Medium |
| FID-00X | ModerationLog empty — moderation logging inactive | Medium |
