# Fidelis Auto — Phase 0 Baseline Architecture & Audit

Date: 2026-08-11
Scope: static repository review, production-route probes, build/lint/schema checks, and distributed M1–M4 baseline execution.

## Current architecture

- Next.js 16 App Router with TypeScript, next-intl (`en`, `ar`) and Prisma/PostgreSQL.
- Public inventory is modelled separately from seller intake: `Vehicle`/`VehicleImage` and `ListingRequest`.
- Authentication currently has two incompatible paths: a buyer cookie containing a raw user id and a separate administrator session.
- Deployment host is available at `/opt/builder`, Node 22.23.2 and PM2 7.0.3. Production database credentials were not read or recorded.

## Distributed baseline execution

| Machine | Assignment | Result |
|---|---|---|
| M1 | Backend/security/database audit | Reachable, 404 GB free. Node 18.19.1 cannot install the project because Prisma requires Node 20.19+; remediation is required before it can run backend validation. |
| M2 | Coordination, source architecture, build, integration | Repository cloned; Prisma schema validates. Lint and production build fail (findings below). |
| M3 | Frontend/routing/forms audit | Reachable, Node 22.23.2, 402 GB free. Reproduced lint failure and inspected public UI routes/forms. |
| M4 | Live route, security-header, SEO and journey probes | Reachable, 150 GB free. Confirmed current public routes, redirects and header posture. |

## Prioritized findings

### Critical

- **FID-AUD-001 — Authentication and authorization are not production safe.** Buyer sessions contain an unsigned raw database user id. A forged cookie can impersonate a user. The separate administrator path is not role-based and has a fallback credential in source. There is no unified account/role model, server-side session store, permission layer, dealer approval state, or super-administrator capability.
- **FID-AUD-002 — Listing intake can be spoofed and bypasses moderation ownership.** `/api/submit` accepts a client-supplied `userId`, does not require a signed-in seller, and writes directly to an underspecified request record. It does not enforce the mandated statuses, description minimum, ownership, completeness checks, or a publish-only-after-approval invariant.
- **FID-AUD-003 — Upload endpoint is unrestricted.** `/api/upload` accepts arbitrary file content/name, has no authentication, MIME allowlist, file-size limit, malware/quarantine hook, safe image/video/document processing, object storage, thumbnail generation, or per-role override.
- **FID-AUD-004 — Project cannot pass its own release gate.** `npm run lint` reports navigation errors. `npm run build` fails TypeScript because Prisma client generation/import configuration is broken. Release deployment must remain blocked until a clean build is verified.

### High

- **FID-AUD-005 — The required role model and registration data are missing.** `User` has no role, first/last name, country/city requirement, dealer profile, business approval, permission assignments, audit log, or saved-search model.
- **FID-AUD-006 — The required moderation workflow is absent.** Existing values are only `pending/approved/rejected`; there is no draft, changes-requested, published, sold, archive, moderation note history, dashboard counters, resubmission flow, or transactional promotion to a public listing.
- **FID-AUD-007 — Messages is still a live product module.** Navigation and message routes/APIs are present although the requirement explicitly replaces it with contact/enquiry/email notifications. The current seller contact component depends on this module.
- **FID-AUD-008 — Services marketplace is absent.** There are no service-provider data models, routes, search, profiles, admin controls, category taxonomy or Services mega menu. `/services` redirects to login rather than providing a public marketplace.
- **FID-AUD-009 — Public metadata/domain consistency is incorrect.** Production is `www.fidelisauto.com`, while canonical, sitemap, JSON-LD and alternate URLs use the apex domain. `/robots.txt` returns a branded 404 response rather than an actual robots file.

### Medium

- **FID-AUD-010 — Dependency vulnerabilities.** `npm audit --omit=dev` reports three high-severity transitive issues through the current Next/sharp/PostCSS dependency graph. The only automatic resolution proposes a Next version outside the declared dependency range; upgrade needs controlled verification.
- **FID-AUD-011 — Security headers are incomplete for production.** HSTS, frame, MIME and referrer protections are present, but CSP permits `unsafe-inline` and `unsafe-eval`; rate limiting/abuse controls were not found in the reviewed API endpoints.
- **FID-AUD-012 — Media and SEO quality are incomplete.** Public image set contains placeholder vehicle assets; upload-generated alt text, captions, WebP derivatives, video previews and structured vehicle/service metadata are absent.
- **FID-AUD-013 — Toolchain parity is incomplete.** M1 is on Node 18, below the project and Prisma requirement. It cannot serve as the planned backend validation worker until Node is upgraded.
- **FID-AUD-014 — Next.js conventions require modernization.** The project uses deprecated `middleware` and the generated CSS includes a parsing warning for the RTL `group-hover:gap-2` selector.

### Low

- **FID-AUD-015 — No automated test suite/configuration was present.** This prevents repeatable validation of authorization, workflow transitions, forms and regression behavior.

## Verified working observations

- Production homepage, vehicles, contact, login, signup and authenticated submission redirect behavior returned HTTP 200.
- Contact API and newsletter API exist separately from the Messages module.
- Production has HSTS, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, a restrictive referrer policy, and a CSP (with the exceptions documented above).
- Prisma schema validation passed on M2.

## Repair decision

Repair and evolve the existing application rather than rebuild it. The public Next.js/i18n/Prisma foundation and production host are usable, but authentication, RBAC, listing/media workflow and service-provider data must be replaced as cohesive vertical slices.

## Phase sequence

1. **Foundation:** tests, release gate, secure universal auth/session/RBAC, expanded registration, role-aware UI and database migration.
2. **Marketplace core:** seller/dealer onboarding, multi-step vehicle wizard, safe media pipeline, AI review contract and moderation state machine.
3. **Services and public experience:** provider marketplace, searchable profiles, mega menu, Messages removal and enquiry/email replacement.
4. **Launch hardening:** end-to-end test accounts for every role, database/state validation, accessibility/performance/SEO/security regression, deployment and final documentation.

## Verification boundary

No real user credentials, production database data, administrator actions or upload payloads were accessed during this baseline. End-to-end verification will use dedicated test accounts and non-production test media before launch.
