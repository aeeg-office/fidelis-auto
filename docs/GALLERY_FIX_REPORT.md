# Fidelis Auto — Vehicle Gallery Fix

## Delivery summary

- **Root cause:** The vehicle detail page loaded *all* `VehicleImage` rows from the
  database but collapsed them to a single `vehicle.image` string and rendered exactly
  **one** hero `<VehicleImage>`. There was **no gallery component anywhere** in the
  codebase. All uploads persisted in the DB and were served by nginx, but the page
  only ever read index `[0]`. So "only the first image shows" was a render bug, not a
  storage bug.
- **Fix:** Built a responsive gallery, passed the full ordered image array through the
  data layer, and added seller + admin image management that persists order/cover via a
  new `VehicleImage` sync helper.
- **Status:** Deployed live, container healthy, verified at every surface.

## Root cause (detail)

| Layer | Before | After |
|---|---|---|
| DB | `VehicleImage` has `src/isPrimary/sortOrder` — correct | unchanged |
| `/api/vehicles`, `vehicle-data.ts` | already used `isPrimary ?? images[0]` (cover) | unchanged (correct) |
| **Detail page `getVehicle()`** | `const primary = images?.[0]; image: primary?.src` → **drops all but first** | returns full `images[]` + `coverImage` |
| **Detail page render** | single `<VehicleImage src={imagePath}>` hero | `<VehicleGallery images={...}/>` (main + thumbs + nav + swipe + keyboard + lightbox) |
| Seller mgmt | `OwnerPhotoManager` list of strings (add/remove only) | `VehicleImageManager` (cover, drag reorder, delete, replace, preview) |
| Admin mgmt | only `isFeatured` toggle | new `/admin/vehicles/[id]` edit page with full image manager |
| OG image | branded card, no photo | renders cover photo (absolute URL) |

## Files changed (19 + 2 follow-up)

**New:**
- `src/components/VehicleGallery.tsx` — responsive gallery
- `src/components/VehicleImageManager.tsx` — seller image manager
- `src/components/AdminVehicleImageManager.tsx` — admin wrapper (persists via admin API)
- `src/lib/vehicle-images.ts` — `normalizeImageOrder` + `syncVehicleImages`
- `src/lib/vehicle-images.test.ts` — unit tests
- `src/app/[locale]/admin/vehicles/[id]/page.tsx` — admin photo-edit page
- `src/app/admin/vehicles/[id]/page.tsx` — root-tree twin

**Modified:**
- `src/app/[locale]/vehicles/[slug]/page.tsx` + `src/app/vehicles/[slug]/page.tsx` — data layer returns all images; render gallery; OG metadata includes cover
- `src/app/[locale]/vehicles/[slug]/opengraph-image.tsx` + root twin — embed cover photo
- `src/app/api/my-vehicle/[id]/route.ts` — accept ordered `{id, src, cover}` image sync (reorder/cover/delete/replace), backward-compatible with string arrays
- `src/app/api/admin/vehicles/[id]/route.ts` — accept image sync
- `src/app/[locale]/my-vehicle/[id]/EditVehicleForm.tsx` + `page.tsx` — wire new manager
- `src/app/[locale]/admin/vehicles/page.tsx` + root twin — title links to photo-edit
- `src/app/[locale]/submit/SubmitForm.tsx` + `src/app/submit/SubmitForm.tsx` — surface per-file upload errors (carried forward)

## DB changes

No schema/migration. Uses existing `VehicleImage(src, isPrimary, sortOrder)`.
`syncVehicleImages` writes: updates `sortOrder` + `isPrimary` in place for retained
rows, deletes removed rows (+ files), creates new rows, guarantees exactly one primary
(flagged cover, else first image).

## Tests

- Unit (`vitest`): 6 new image-sync tests; **28/28 suite passes**.
- `tsc --noEmit`: clean for all changed files.
- `eslint`: no errors.
- `next build`: succeeds locally and on VPS.
- Regression (live): `/`, `/vehicles`, `/vehicles/volkswagen-beetle-1959`, `/search`,
  `/journal`, `/services`, `/ar`, `/ar/vehicles` all 200.

## Live verification

- Beetle page references **10 unique upload images** (was 1 pre-deploy) with gallery
  controls (thumbnails, prev/next, Full screen, "View photo 1..10", counter).
- Hero + thumbnail optimized URLs return 200 `image/jpeg`.
- Cover image appears on homepage card, `/vehicles` listings (cover rules met).
- Container healthy; rebuild completed cleanly; uploads survive via host bind-mount
  (`/var/www/fidelis-auto/uploads`).

## Validation of cover-image rules

- Homepage card → cover ✅
- Search results / `/vehicles` → cover ✅ (via `getVehicles` primary)
- Category filter → cover ✅ (same `getVehicles`)
- Featured listings → cover ✅ (same loader)
- Open Graph / social preview → cover photo ✅ (OG route now embeds it; absolute URL)
- Fallback: if no cover flagged → first image; if no images → slug placeholder ✅

## Screenshots

- `docs/screenshots/after-gallery-beetle.png` — gallery (main + thumbnails) on live page.
- Pre-deploy "before": page referenced only the single hero upload (verified via curl).