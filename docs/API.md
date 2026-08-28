# Fidelis Auto — API Reference

Authenticated endpoints use the `fidelis_session` cookie (server-session). Admin endpoints additionally enforce RBAC.
Unauthenticated admin APIs return `401`; unauthenticated admin pages redirect `307` to `/admin/login`.

## Public
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/vehicles` | GET | Published vehicles (real image). |
| `/api/makes` | GET | Distinct makes for filtering. |
| `/api/search` | GET | Keyword search over make/model/year/category (page `/search`). |
| `/api/contact` | POST | Persist `Inquiry` (resolves `vehicleId` from `vehicleSlug`) + Resend email. |
| `/api/newsletter` | POST | Subscribe newsletter. |

## Auth
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/signup` | POST | Register (role-aware). |
| `/api/auth/verify` | POST | Verify email code. |
| `/api/auth/resend` | POST | Resend verification code. |
| `/api/auth/login` | POST | Login → sets session cookie. |
| `/api/auth/logout` | POST | Invalidate session. |
| `/api/auth/me` | GET | Current user (session). |

## Listing workflow
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/submit` | POST | Create listing submission → ad scan → auto-approve/publish or pending. |
| `/api/upload` | POST | Upload image/video to `vehicles/<slug>/` volume. |
| `/api/listing-assistant` | POST | AI-fill assist (optional). |
| `/api/makes` | GET | Distinct makes. |
| `/api/my-listing/[id]` | PATCH/DELETE | Owner edits/deletes own submission (ownership-guarded; edit→pending). |
| `/api/my-vehicle/[id]` | PATCH/DELETE | Owner edits/deletes own published vehicle (ownership-guarded). |
| `/api/my-vehicle/[id]/status` | PATCH | Owner marks own vehicle `sold`/`available` (writes ModerationLog). |
| `/api/vehicles/[slug]/favorite` | GET/POST | Check/toggle favorite (auth required to save). |

## Services
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/services` | POST | Submit service listing (auth; starts unpublished → admin approve). |

## Admin (all 401 unauth; RBAC-guarded)
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/admin/login` | POST | Admin login. |
| `/api/admin/submissions/[id]` | PATCH | Approve/reject listing (writes ModerationLog). |
| `/api/admin/vehicles` | POST | Create vehicle. |
| `/api/admin/vehicles/[id]` | PATCH | Update vehicle (incl. `isFeatured`). |
| `/api/admin/inquiries` | GET | List inquiries. |
| `/api/admin/inquiries/[id]` | PATCH/DELETE | Mark read / delete. |
| `/api/admin/users` | GET | List users. |
| `/api/admin/users/[id]` | PATCH | Change role (`user:manage` + `canManageRole`). |
| `/api/admin/dealers` | GET | List dealers. |
| `/api/admin/dealers/[id]` | PATCH | Approve/reject dealer. |
| `/api/admin/services` | GET | List services. |
| `/api/admin/services/[id]` | PATCH | Publish/unpublish service. |
| `/api/admin/journal` | GET/POST | List/create journal entry (seo:manage). |
| `/api/admin/journal/[id]` | PATCH/DELETE | Publish/delete journal entry. |

## Dealer
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/dealers/register` | POST | Dealer registration. |