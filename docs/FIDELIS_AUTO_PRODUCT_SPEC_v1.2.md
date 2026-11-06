# Fidelis Auto — Product Spec v1.2

**Version:** 1.2 · **Revised:** 6 Nov 2026 · **Owner:** Qadir Abdul-Baqi · **Status:** approved for build · This Markdown file is the source of truth; the online v1 doc (https://claude.ai/artifact/FN4NGHbqxYtWPcFGMZDswn) is superseded.

**Changes from v1.1:** launch tiers made consistent across sections (filters, Journal, collections); phone-verification launch path added; Claude reviews limited to high-risk pull requests so the build fits Claude's usage limits.

## Executive summary

**Verdict: extend the existing platform; do not rebuild.** The repo (`aeeg-office/fidelis-auto`, HEAD `8b67951`, 5 Nov 2026) already has about 15,800 lines of working Next.js 16 / Prisma / PostgreSQL code: accounts with roles, phone-verification fields and Twilio, image upload with automatic WebP resizing, moderation, dealers, services, journal, messaging tables, favorites, compare, an AI listing assistant, an ad-text scanner and an AdSense slot component. A rewrite would throw that away to reach the same point.

**What must change is the data model, not the stack.** Vehicles store price as text, have no location, no currency, no vehicle type (so no motorcycles) and collector-only categories. The make list has no Chinese brands. Services have no specialties, languages, photos or reviews. There are no ad, plan or review tables. These are additive schema changes.

**Launch target: 20 Nov 2026, free-first, with two delivery tiers.** Must ship: additive vehicle data model, numeric price/currency and location, car/motorcycle types and full Egyptian-market make list, basic price/make/model/location/type filters, enforced phone verification and gated contact, Option C on core pages, and full Arabic. Ship if ready, otherwise in the following week: services directory upgrades, AdSense activation, collections, and "Free during launch" badges. The existing Journal remains available; content must be fact-checked before promotion. The owner authorizes the public launch announcement, not routine technical deployments.

**Revenue thesis.** AdSense alone is small on Egyptian traffic (rough estimate: $10–$40/month at 20,000 page views). The business makes money from featured listings, dealer subscriptions, premium provider profiles and directly sold local ads. The Journal is written for the whole Middle East and North Africa to pull in higher-paying Gulf readers. The platform is built multi-country from day one, with Egypt launched and the Gulf as a soft, unmarketed early-access section.

**Scope and reconciliation:** This audit examined repository HEAD `8b67951` (5 Nov 2026), which is newer than production SHA `923cf86` cited in an earlier report. The latest owner-reported production deployment is also `8b67951`; Hermes must independently verify current GitHub `main`, deployed image SHA, database contents, user/test-account counts, and defect status before creating issues or deploying. Distinguish historical audit findings from already-fixed defects. Check whether this v1.2 specification is committed on `main`; do not assume that an uploaded or online copy has been pushed.

## Positioning and pillars

**Fidelis Auto is Egypt's car destination: every car worth seeing, and every specialist worth trusting.** It blends a collector showroom's presentation with a cleaner version of a cars.com-style marketplace. Ordinary cars get the same premium treatment as classics; the showroom feel comes from presentation and curated collections, not from restricting inventory.

| Pillar | What it is | Why it wins |
| --- | --- | --- |
| Cars | Every make and model on the Egyptian market, including Chinese brands; smart search plus deep filters; curated collections | Cleaner and more trustworthy than the large classifieds sites |
| Motorcycles | Its own section and taxonomy from launch | Underserved; strong Journal and SEO angle |
| Services | Mechanics, body shops, parts, tires, mobile repair and make/era specialists, with languages spoken and reviews | Replaces word of mouth; no central directory exists today |
| Journal | Useful AI-assisted, fact-checked articles written for the whole region | Search traffic and AdSense from higher-paying Gulf readers |

**Operating model:** AI runs day-to-day operations (listing intake, photo processing, moderation, expiry, SEO pages, support). The owner approves only verification badges, review removals, bans, refunds and anything involving money or legal matters.

**Countries.** Country, currency and cities are built into the data model from day one, so adding a country is a setting. Egypt is the launch market and gets all marketing. Saudi Arabia and the UAE open as an early-access section: sellers can list, each country sees only its own listings, and there is no active marketing there until Egypt is busy. The Journal targets the whole Middle East and North Africa from day one.

**Languages:** English by default, full Arabic with proper right-to-left layout. **Platform:** an installable web app at launch, built API-first so a native mobile app can reuse the backend.

## Current-state audit

**About 70% of the launch scope exists in some form; the gaps are mostly data-model and coverage, plus a few policy conflicts with the new direction.** Findings come from reading the repo at HEAD `8b67951` (19 Prisma models, 36 page routes, 33 API routes, 11 test files).

| Area | In the repo now | Gap for the new spec |
| --- | --- | --- |
| Vehicle model | Make, model, year, trim, mileage, colours, engine, transmission, gallery, documents, provenance timeline, featured flag with expiry | Price is text (cannot filter or sort); no currency, country or city; no vehicle type (no motorcycles); no body type, fuel or "currently licensed"; mileage defaults to miles; categories are collector-only (Modern, Classic, Vintage, EV) |
| Make/model data | 67 makes, collector-leaning | No Chinese brands except MG (no Chery, BYD, Geely, Jetour, Haval, Changan and others); no motorcycle makes |
| Photos | Upload converts to WebP in thumbnail, 800 px and 1600 px sizes; primary photo, ordering, categories | No enhancement, no Studio Cover, no original-copy policy; `sharp` is used but only arrives indirectly through Next.js, not as a declared dependency |
| Video | Submissions accept video files | No transcoding, length limit or sound-clip type |
| Accounts | Roles, email verification, phone-verification fields, Twilio SMS/WhatsApp client, sessions, audit log | Phone verification not enforced as the gate for interacting; Twilio not confirmed configured |
| Contact | Inquiry form, conversation and message tables | Contact not gated behind a verified account |
| Moderation | Ad-text scanner; clean submissions auto-publish, flagged ones go to manual review | Fits the AI-first direction; needs scam-price, duplicate-photo and image checks |
| Services | Business name, category, description, phone, website, city | Posting limited to dealers and admins, which conflicts with "anyone can post"; no specialties, languages, photos, coverage area or reviews |
| Reviews | None | New |
| Ads | `AdSlot` component (3 sizes) and an affiliate-links component | AdSlot is not placed on any page and the AdSense script is not loaded; no ad inventory, sponsored placements or advertiser tables |
| Monetization | Featured flag only | No plans, promotions or "Free during launch" states |
| Journal | Bilingual posts, categories, admin editor | No SEO fields, scheduling or region targeting |
| Admin | Dashboard, users, dealers, vehicles, submissions, services, inquiries, journal | Built for a technical user; no site settings, homepage, ads, translations or AI controls |
| Tests | 11 unit test files on auth, moderation, uploads, listings | No end-to-end or browser tests |

**Open defects to verify on the live server:**

- **Admin access (FID-AUD-102, high):** `/api/admin/login` deliberately returns 410 (gone) in favour of the unified login; the reported super-admin password mismatch must be checked live and recovered securely.
- **Services permission (FID-AUD-201):** now restricted in code to dealers and admins. That closes the security gap but must change to "any verified user can post, with moderation".
- **Test accounts (FID-AUD-105):** at least 8 temporary seller accounts; review before removing, with a backup.
- **Stale records:** the defect ledger still lists items later resolved (for example FID-007); the 5 Nov context file cites HEAD `c5c2f1d`, but the repo is now at `8b67951`.

## Feature spec

**Feature labels:** L = 20 Nov must-ship launch; L+ = ship if ready by 20 Nov, otherwise the following week; P2, P3, P4 = later phases. "Free during launch" labels are L+, not a blocker for the core launch.

### Listings (cars and motorcycles)

| Feature | Phase |
| --- | --- |
| Vehicle type: car or motorcycle, each with its own section, makes, body types and filters | L |
| Full Egyptian-market taxonomy, including Chinese brands, seeded and editable by admin | L |
| Numeric price with currency; country, governorate/city; mileage in km; fuel; body type; "currently licensed" yes/no | L |
| Basic filters: vehicle type, make, model, price, location; sort by newest and price | L |
| Smart search bar and extended filters (year, mileage, body, transmission, fuel) | L+ |
| Listing stays live at least 30 days; seller can choose longer | L |
| Curated collections (Classics, First cars, Family SUVs, Electric, Motorcycles) | L+ |
| Featured and boosted placement (paid later) | L+ (free), P2 (paid) |
| AI listing intake: photos or a voice note become a structured bilingual listing | P2 |
| Automatic expiry with a WhatsApp "still for sale?" check-in | P3 |
| Price vs market indicator, from ongoing weekly or monthly research | P4 |
| Parts and accessories classifieds with anti-junk rules | P4 |

### Photos and media

| Feature | Phase |
| --- | --- |
| Automatic compression to WebP sizes (already built) plus a capped original copy (about 2,560 px) | L |
| Guided shot list with missing-angle prompts | P2 |
| Corrective enhancement on upload: exposure, white balance, noise, straightening; never changes the car | P2 |
| Studio Cover: the cover photo on a consistent branded backdrop, labelled, with the original one tap away and a fallback when the cutout is poor | P2 |
| One video (60 s, 720p) and one engine sound clip per free listing; more in premium | P2 |
| Optional licence-plate blurring | P2 |

### Accounts and trust

| Feature | Phase |
| --- | --- |
| Listings fully visible without an account | L |
| Registration with SMS or WhatsApp code required to contact sellers, see phone/WhatsApp, save, post, review | L |
| Warning-only policy for scams and fake listings; admin can suspend | L |
| Terms stating buyer and seller carry responsibility for the vehicle's legal status | L (draft), lawyer review before payments |
| Reviews by verified users only; providers can submit context that goes to admin | P2 |
| AI moderation: scam prices, duplicate or stolen photos, banned content; only flagged items reach a human | P3 |

### Services directory

| Feature | Phase |
| --- | --- |
| Any verified user can post a provider profile, reviewed by the moderation pipeline | L+ |
| Six service groups (existing taxonomy) plus specialist tags by make, era and skill | L+ |
| Languages spoken (Arabic, Arabic + English), WhatsApp, coverage area, photos | L+ |
| Location search ("VW specialist near Maadi") and links from listings to matching specialists | L+ (basic), P3 (full) |
| Request a service: describe the problem, matching providers reply | P3 |
| Verified badge, top placement and lead alerts (premium) | P2 |

### Journal and SEO

| Feature | Phase |
| --- | --- |
| Existing 7 published articles stay live and fact-checked | L |
| Grow to 15–20 fact-checked articles (buying tips, car care, motorcycles, market news), region-wide, before applying for AdSense | L+ |
| SEO fields, sitemap, schema, hreflang; steady publishing schedule | L |
| Auto-generated landing pages (make/model/city, specialist/city) | P3 |

### Admin (no technical skill assumed)

| Feature | Phase |
| --- | --- |
| Owner-only admin; named admin accounts with limited permissions when someone is added | L |
| Reset, suspend and remove users; create admins | L |
| Edit makes, models, categories, collections and homepage sections without code | L (basic), P2 (full) |
| Toggle ad slots, featured items and "Free during launch" labels | L+ |
| Weekly report to Telegram (users, listings, top searches, problems) | P2 |
| Translation editor, AI settings, pricing tiers, Studio Cover settings | P2–P3 |

### Platform

| Feature | Phase |
| --- | --- |
| Installable web app, mobile-first layouts | L |
| Countries as data: Egypt live, Saudi Arabia and UAE as unmarketed early access | L |
| AI support assistant with handoff to the owner | P2 |
| Community tab (inactive placeholder) | L |
| Native mobile app on the same API | P4 |

## Revenue engine

**Free volume first, then four paid streams; AdSense is a bonus, not the business.** Every page is designed with its revenue slot from day one, so switching on payments is a setting, not a rebuild.

| Stream | Who pays | How it works | Live |
| --- | --- | --- | --- |
| Featured and boosted listings | Private sellers | Top placement in results and on the homepage for a set period; a boost refreshes the listing's date | P2 |
| Dealer subscriptions | Dealers | Monthly plan: unlimited listings, bulk upload, analytics, a branded showroom page | P2 |
| Premium provider profiles | Service providers | Verified badge, top placement in their area and specialty, portfolio, lead alerts | P2 |
| Directly sold ads and sponsorships | Local businesses (tires, insurance, parts, detailers) | Contextual slots (tires on SUV pages, insurance on listings), sponsored collections, sponsored specialist placements; self-serve booking later | P3 |
| Pro photo package | Sellers | Multiple Studio Cover angles and the dark showroom treatment | P2 |
| Google AdSense | Google | Slots on Journal, search results and listing pages, capped so they never crowd the listing | L+ |

Prices are set after the free phase, from real usage data; the owner chooses them in admin without code.

**AdSense outlook (rough estimates, not official figures):** Egyptian traffic earns about $0.50–$2 per 1,000 page views. That suggests roughly $10–$40/month at 20,000 page views, $50–$200 at 100,000, and $500–$2,000 at 1 million. Gulf readers pay roughly 3–5 times more, which is why the Journal is written for the whole region.

**Free-launch mechanics:**

- "Free during launch" badges and clickable premium previews are L+; they must not delay essential listings, trust, search, localization or mobile design.
- An admin switch per feature turns on checkout once the payment provider is live (under Fidelis Consulting).
- Usage of each free premium feature is tracked, so pricing is based on what people actually used.

**Exit value:** a buyer pays for recurring revenue, verified users and listing volume. Clean data (one verified user per phone number, consistent taxonomy, tracked revenue per stream) raises the sale price, so the admin reports track these from launch.

## Data model changes

**All changes are additive Prisma migrations; nothing existing is dropped.** The text `price` column is kept during migration and backfilled into the new numeric field, then retired in a later release. Every migration runs on a backup first.

| Model | Change | Phase |
| --- | --- | --- |
| `Country`, `City` (new) | Code, names EN/AR, currency, phone prefix, `isLive`, `isEarlyAccess` | L |
| `Make`, `Model` (new, replaces hardcoded lists) | Names EN/AR, `vehicleType` (CAR or MOTORCYCLE), origin, active flag; admin-editable | L |
| `Vehicle` | Add `vehicleType`, `priceAmount` (integer, smallest unit), `currency`, `countryId`, `cityId`, `bodyType`, `fuelType`, `isLicensed`, `expiresAt`, `makeId`/`modelId`; default mileage unit km; keep the old `category` field working until collections ship (L+), then map it | L |
| `Collection` (new) | Curated groups shown on the homepage; rules or hand-picked; admin-editable | L+ |
| `User` | Enforce `phoneVerified` before interaction; add `preferredLanguage`, `countryId`; admin permission set for named admins | L |
| `ServiceListing` | Add `specialties` (make, era, skill tags), `languages`, `coverageArea`, `cityId`, `whatsapp`, photos, `verifiedAt`, `isPremium` | L+ |
| `SiteSetting` (new) | Key/value settings the admin edits: homepage sections, launch badges, feature switches, ad slot toggles | L |
| `AdPlacement` (new) | Slot key, page type, format, provider (AdSense or direct), active flag | L+ |
| `VehicleMedia` (extends `VehicleImage`) | `kind` (photo, video, sound), `originalSrc`, `enhancedSrc`, `studioCoverSrc`, `processingStatus`, `durationSec` | P2 |
| `Review` (new) | Reviewer (verified user), provider, rating, text, `providerContext`, `status` (published, under review, removed) | P2 |
| `Plan`, `Subscription`, `Promotion`, `Payment` (new) | Tiers and prices, active subscriptions, boosts and featured periods, payment records | P2 |
| `Advertiser`, `AdCampaign` (new) | Direct advertisers, booked slots, dates, impressions and clicks | P3 |
| `ServiceRequest` (new) | Buyer's problem description, location, matched providers, replies | P3 |
| `MarketPrice` (new) | Make, model, year band, price range, source, date | P4 |

**Indexes needed at launch:** vehicles by (country, type, published, price), (make, model, year) and (city); services by (city, category) and a tag index on specialties. These keep search fast as listings grow.

## Design system (Option C)

**A light showroom base, dark showroom moments, restrained gold: chosen for what will perform best with a mainly Middle Eastern audience.** It refines the current ivory, ink and gold look rather than replacing it.

| Element | Rule |
| --- | --- |
| Base | Warm ivory `#f5f3ef` with white cards and ink `#1a1a2e` text on every data-heavy page: search, filters, results, specs, services, dashboards, admin |
| Showroom moments | Deep ink or near-black only for the homepage hero, featured collections, the detail-page gallery and lightbox, and selected Journal features |
| Gold `#c9a84c` | Premium tier, verified and featured badges, thin rules; never buttons or small text (contrast too low on ivory) |
| Buttons | Ink, or green `#2d5a27` for trust and verification actions; WhatsApp contact always prominent |
| Type | Cormorant Garamond for display headlines only; Inter for interface and data; a matching Arabic display and interface font of equal quality (Cormorant has no Arabic letters) |
| Contrast | Every text and background pair meets WCAG AA |
| Layout | Mobile-first, thumb-reachable actions, right-to-left mirrored properly in Arabic |
| Cards | Studio Cover image, price, year, mileage, city, one badge at most |
| Ads | Clearly separated slots that never sit between a photo and its price |
| Dark mode | Deferred; design tokens structured so it can be added later |

**Launch design work:** a logo and brand basics, the Arabic font choice, and the Option C refresh applied to the homepage, search results, listing detail, services and registration.

**Validation:** before the build, a short scan of leading premium car and real-estate marketplaces in the Gulf and Egypt, plus tests with 5–8 users in Cairo on two mockups. After launch, A/B tests on button colour, card style and hero, measured by searches, listing views and WhatsApp contacts.

## Phases

**Target public launch: 20 Nov 2026.** L items are mandatory; L+ items may ship in the following week without delaying launch. The owner decides when to announce the public launch; Hermes autonomously handles routine releases and rollback. Later phase dates are targets, subject to their gates.

| Phase | Dates | Scope | Gate to move on |
| --- | --- | --- | --- |
| **Launch (L)** | 6 Nov – 20 Nov 2026 | Additive vehicle model · numeric price/location · cars and motorcycles/full makes · basic filters · phone verification/gated contact · Option C core pages · full Arabic | **Technical gate:** no critical/high defects, tested rollback, owner's 4 cars live; **public announcement:** owner decision |
| **Launch follow-up (L+)** | By 27 Nov 2026 | Services upgrades · AdSense · curated collections · "Free during launch" badges | Ship independently when ready; do not block L |
| **Phase 2** | 21 Nov – 18 Dec 2026 | Payments switched on · reviews · Studio Cover photos · video and engine sound · AI listing intake | **Payments live:** checkout tested |
| **Phase 3** | Jan – Feb 2027 | AI moderation · request a service · direct ads and sponsors · auto SEO pages · dealer tools | **Egypt busy:** then market the Gulf |
| **Phase 4** | From Mar 2027 | Native mobile app · parts classifieds · market price data · Gulf marketing | — |

Payments go live inside phase 2 (about 1 month out); Gulf marketing waits until Egypt has steady listing growth.

### Launch acceptance criteria

- [ ] Owner can log in as super admin; named admin accounts can be created
- [ ] Any visitor can browse; contact, save and post require a phone-verified account (reviews remain P2)
- [ ] Cars and motorcycles can be listed with numeric price, city and the full Egyptian make list, including Chinese brands
- [ ] Search and filters return correct results on mobile in English and Arabic
- [ ] Photos upload, compress to WebP sizes and keep a capped original
- [ ] Existing Journal remains functional and its public content is fact-checked before promotion
- [ ] L+ follow-up, not launch blockers: service-profile upgrades, AdSense slots, curated collections and "Free during launch" labels
- [ ] Option C design on homepage, search, listing, services and registration; logo in place
- [ ] Installable web app passes on Android and iPhone
- [ ] Owner's 4 classics live with full galleries (owner supplies authentic listing information/media)
- [ ] No open high or critical defects; backup taken and rollback tested before the production deploy

## Build workflow and security

**GitHub is the single coordination layer: Hermes turns this spec into issues, agents build on branches, Codex reviews every pull request (Claude joins for high-risk ones), and Hermes merges.**

| Role | Who | Does |
| --- | --- | --- |
| Orchestrator | Hermes (fleet controller) | Reconciles live/repo state; creates issues, assigns agents, reviews, merges, deploys, monitors and automatically rolls back routine releases; reports to Telegram |
| Builders | Hermes agents via OpenRouter (M2 frontend, M3 backend and database, M4 services, Journal, translations) | One issue per branch, with tests |
| Design | Claude | Design system, page layouts, component specs, Studio Cover look |
| Review | ChatGPT Codex (every pull request) and Claude (high-risk only) | Codex reviews each pull request against its acceptance criteria. Claude also reviews anything touching auth, phone verification, payments, migrations or the design system; both must pass for those. Limiting Claude to these keeps the build within Claude's usage limits |
| Owner | Qadir | Decides public launch announcement, pricing/money, legal matters, material business policy, and irreversible or potentially data-destructive actions; not routine merges or deployments |

**Issue format (every task):** title, phase label, area label, the spec section it implements, acceptance criteria as checkboxes, files likely touched, and "done means" evidence (test output, screenshot, URL). Agents post that evidence on the pull request; reviewers check it, not the agent's claim.

**Branch and release rules:**

- One issue, one branch, one pull request; no direct commits to `main`.
- Hermes autonomously merges and deploys routine tested changes from `main`, with SHA-tagged images, health checks and automatic rollback on critical regression. No routine approval gates.
- Before each migration, verify a backup and rehearse the migration on a restored copy. Additive, backward-compatible migrations may proceed autonomously if tested and reversible; stop for owner approval when data loss, destructive changes or irreversibility is possible.
- Model choice by task: cheap models for repetitive, low-risk work; a strong model for architecture, migrations, auth and any task a cheap model has failed twice.

**Security: build it right now (costly to fix later):**

- Permission checks on the server for every admin and owner action.
- Secrets in environment variables only, never in the repo; rotate any that were ever committed.
- Phone verification enforced on the server, with rate limits on code sending.
- Payment handling through the provider's hosted checkout, so card data never touches the server.
- Uploads checked for type and size; media served from the uploads path, never executed.

**Deferred to pre-launch hardening:** penetration testing, full audit logging for every action, web application firewall rules, backup restore drills, monitoring and alerting, privacy-law review (the owner's lawyer).

## Costs

**The build fits inside the current budget; the one running cost that can surprise is phone verification.** All figures are rough estimates except where a source is linked.

| Item | Estimate | Notes |
| --- | --- | --- |
| Launch build (2 weeks) | $40–$120 OpenRouter, plus existing Claude and ChatGPT plans | About 70% of the code exists; cheap models for routine issues, strong models for migrations and auth |
| Phases 2–3 build | $100–$300 OpenRouter over 1–2 months | Studio Cover, payments, reviews, ads, AI moderation |
| Claude usage | Pro limit is tight for this pace | Reviews and design from exported files, not browser automation; Max 5x ($100/month) for a heavy build month, or usage credits with a spend cap |
| Hosting | $0 extra | Existing Hostinger VPS |
| Media storage | About 5–8 GB per 1,000 listings with one video each | Fine on the VPS early; move to low-cost object storage (for example Cloudflare R2) as volume grows |
| Phone verification by SMS | About $0.40 per SMS via Twilio in Egypt ([sent.dm, 2025](https://www.sent.dm/en/resources/sms-pricing/egypt-sms-pricing)); about $0.11 via Plivo | 1,000 sign-ups via Twilio is roughly $400 or more with retries |
| Studio Cover processing | $0 self-hosted, or a few cents per image via a paid API | Decided in phase 2 on quality |
| AI listing intake and moderation | Cents per listing on cheap models | Batched in the background |
| Domain email (Zoho), WhatsApp Business number | Low monthly cost | Needed before launch for trust |

**Verification cost decision (needed before launch):** the codebase already uses Twilio, which is the most expensive option found for Egypt. Recommended order: WhatsApp authentication code first (most Egyptian users have WhatsApp; check Meta's current rate for Egypt), a cheaper SMS provider as fallback, and strict rate limits (one code per minute, five per day per number) to stop abuse running up the bill. Also register an alphanumeric sender ID with the regulator, which takes about 2–3 weeks, so start now.

**Launch path for phone verification (L is blocked without it):** the cheaper channels may not be ready by 20 Nov. WhatsApp codes need a WhatsApp Business number and Meta business setup; a new SMS provider's sender ID takes 2–3 weeks. So the launch uses the existing Twilio integration, with strict rate limits and a monthly spend cap. Hermes builds verification behind a provider switch, so moving to WhatsApp or a cheaper SMS provider later is a configuration change, not new code.

## Risks and open decisions

**The biggest risk is an empty marketplace, not the code.** Every other risk is manageable with the mitigations below.

| Risk | Mitigation |
| --- | --- |
| Too few listings at launch makes the site look dead | Launch with the owner's 4 classics, at least one dealer, and seeded services; daily outreach from day one; hide empty sections automatically |
| Facebook accounts used for automation get restricted | Keep automation off the brand page and group admin accounts; vary messages; small daily batches |
| Google treats mass AI articles as spam; AdSense rejection | Fact-checked, useful, Egypt- and region-specific articles at a steady pace; 15–20 strong ones before applying |
| Verification SMS costs run away | WhatsApp codes first, cheaper SMS fallback, rate limits (Costs section) |
| Two-week scope creep | The launch cut is fixed; anything new goes to phase 2 unless it blocks launch |
| Scams erode trust | Verified phones, gated contact, ad-text scanner now; AI scam checks in phase 3; easy report button |
| Shared admin login breaks the audit trail | Named admin accounts with limited permissions |
| Production data loss during migrations | Backup before every migration, written rollback, additive changes only |
| Over-promising AI photo edits | Corrective only, labelled Studio Cover, original always available |

**Decisions needed from the owner:**

- [ ] Verification channel: WhatsApp first with SMS fallback (recommended), or SMS only? Launch uses Twilio with a spend cap either way (see Costs)
- [ ] Set the Twilio monthly spend cap for launch
- [ ] SMS provider: switch from Twilio to a cheaper provider, or keep Twilio?
- [x] Approve the two-tier launch scope (v1.1, carried into v1.2); 20 Nov remains a target, with the public announcement reserved to the owner
- [ ] Logo direction: designed by Claude in the launch window, or by a freelancer?
- [ ] Confirm Q29 default: owner approves badges, review removals, bans, refunds and anything involving money or legal matters
- [ ] Start sender ID registration and set up the WhatsApp Business number and Zoho domain email this week
