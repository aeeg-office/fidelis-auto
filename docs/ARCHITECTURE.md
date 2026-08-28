# Fidelis Auto — Architecture

## Overview
Fidelis Auto is a premium collector/classic vehicle marketplace (https://fidelisauto.com).
Single Next.js application (App Router) with server components, Prisma ORM, and PostgreSQL.
Served by Docker Compose behind nginx; source lives in the canonical repo `aeeg-office/fidelis-auto.git`.

## Stack (verified live 2026-08-27)
- **Next.js 16.2.12** (App Router, React 19) — server-rendered, i18n via next-intl (en default, ar)
- **Prisma 7.9.1** → **PostgreSQL** (`hermes_car`, Docker network host)
- **Docker Compose** service `fidelis-auto` on `:3006`, `network_mode: host`
- **nginx** public reverse proxy (TLS)
- **Resend** transactional email; lucide-react icons; localStorage-driven compare

## Directory layout (src/)
- `app/` — App Router pages & API routes (root + `[locale]/` trees for en/ar)
- `components/` — shared UI (layout/Header, VehicleCard, ContactSellerButton, AdminJournalActions, ServiceSubmitForm, VehicleStatusControl, JsonLd, SocialShare, NewsletterSignup…)
- `lib/` — `prisma.ts` (client), `user-auth.ts` (session), `auth.ts` (verifySession), `authorization.ts` (RBAC `can`/`canManageRole`), `ad-scanner.ts`, `auto-publish.ts`, `fidelisTaxonomy.ts`
- `i18n/` — next-intl routing + messages

## Auth & RBAC
- Session cookie `fidelis_session` (server session; opaque token hashed as SHA-256 → `AuthSession.tokenHash`).
- Roles: `SUPER_ADMIN`, `ADMINISTRATOR`, `DEALER`, `SELLER`, `BUYER` (hierarchy in `lib/authorization.ts`).
- Admin guard: `verifySession()` + `can(role, permission)`; unauthenticated admin pages → 307 `/admin/login`, admin APIs → 401.
- Email verification required at signup (`/api/auth/resend` + `/verify`).

## Moderation & listing lifecycle
- `/api/submit` → `ad-scanner.ts` (contact-harvesting / spam / malformed rules) → clean = **auto-approve + auto-publish** (Vehicle owned by submitter); violations = `pending` for admin review.
- Every approve/reject/auto-approve writes a `ModerationLog` row (audit trail).
- Owner can mark a published listing **sold/available** (`/api/my-vehicle/[id]/status`); inquiries carry `vehicleId` from `vehicleSlug`.

## Media
- Uploads persist to named volume `fidelis-auto-data` (→ `/app/public/uploads`, `vehicles/<slug>/`), writable by uid 1001 (`nextjs`).
