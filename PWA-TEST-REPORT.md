# Fidelis Auto — PWA Test Report

> **Project:** Fidelis Auto (fidelisauto.com)
> **Generated:** August 4, 2026
> **Framework:** Next.js 16
> **Host:** VPS (191.218.165.228)

---

## 1. Implemented PWA Features

### ✅ Web App Manifest (`/manifest.json`)
- **Location:** `public/manifest.json`
- **Referenced from:** `src/app/layout.tsx` (`manifest: "/manifest.json"`)
- **Fields:**
  | Field | Value | Status |
  |-------|-------|--------|
  | `name` | "Fidelis Auto" | ✅ |
  | `short_name` | "Fidelis Auto" | ✅ |
  | `description` | "For the love of cars. Every car has a story." | ✅ |
  | `start_url` | `/` | ✅ |
  | `display` | `standalone` (launches without browser chrome) | ✅ |
  | `background_color` | `#1a1a2e` | ✅ |
  | `theme_color` | `#c9a84c` (gold accent) | ✅ |
  | `icons` | 2 icons — `icon-192.svg` and `icon-512.svg`, both with `purpose: "any maskable"` | ✅ |

### ✅ Service Worker (`/sw.js`)
- **Location:** `public/sw.js`
- **Registered in:** `src/app/[locale]/layout.tsx` (inline `<script id="register-sw">`)
- **Registration strategy:** `afterInteractive`
- **Caching strategies:**
  | Request Type | Strategy | Behavior |
  |-------------|----------|----------|
  | Navigation (page loads) | **Network-first** | Fetches from network; caches fresh response; falls back to cache → `/offline` |
  | API calls (`/api/*`) | **Network-first** | Fetches fresh data; caches response; falls back to cache |
  | Static assets (CSS, JS, images, fonts, `/_next/static/*`) | **Cache-first** | Returns cached instantly; fetches and caches on cache miss |
  | Everything else | **Network-first** | Network with cache fallback |
- **Cache name:** `fidelis-auto-v1`
- **Lifecycle:** `install` → pre-caches `/` and `/offline`; `activate` → cleans old caches, claims clients

### ✅ Offline Page (`/offline`)
- **Location:** `src/app/[locale]/offline/page.tsx` and `src/app/offline/page.tsx`
- **Content:** Branded offline message with "Try Again" link back to home
- **Pre-cached during service worker install**

### ✅ Install Prompt (`PwaInstallPrompt` component)
- **Location:** `src/components/PwaInstallPrompt.tsx`
- **Event:** Listens for `beforeinstallprompt` event
- **Behavior:**
  - Shows a styled bottom banner 2 seconds after the event fires
  - "Install" button triggers `prompt()` and listens for `userChoice`
  - "Not now" dismisses permanently via `localStorage` (`fidelis-pwa-dismissed`)
  - Animated entrance/exit for smooth UX
- **Visibility:** Rendered globally in `[locale]/layout.tsx`

### ✅ Apple Touch / iOS Support
- `apple-touch-icon` → `icon-192.svg` (defined in layout metadata)
- `apple-mobile-web-app-capable: yes` (meta tag in layout metadata)
- `theme-color: #c9a84c` (meta tag in layout metadata)

---

## 2. Testing the PWA Install Prompt

### Chrome on Android

1. **Prerequisites:** Ensure Fidelis Auto is served over HTTPS (production is). Chrome requires HTTPS for the `beforeinstallprompt` event.
2. **Navigate:** Open `https://fidelisauto.com` in Chrome on Android.
3. **Trigger criteria:** Chrome fires `beforeinstallprompt` when:
   - The site has a valid manifest with `display: standalone`
   - The site is served over HTTPS
   - The user has visited for at least 30 seconds
   - The user has visited at least 2 pages (or the manifest has `start_url`)
   - There is an active service worker registered
4. **Expected:** After ~2 seconds, a bottom banner appears: "Install Fidelis Auto" with "Install" and "Not now" buttons.
5. **Tap "Install":** Chrome shows the native install dialog. Tap "Install" again to add to home screen.
6. **Tap "Not now":** Permanently dismisses (stored in `localStorage`). Clear `localStorage` to re-test.
7. **Testing dismissed state:** In Chrome DevTools → Application → Local Storage → delete the `fidelis-pwa-dismissed` key, then reload.

### Safari on iOS (iPhone/iPad)

1. Safari does **not** support the `beforeinstallprompt` event. The install prompt component will not appear.
2. **Manual install via Share Sheet:**
   - Open `https://fidelisauto.com` in Safari.
   - Tap the **Share** button (square with arrow).
   - Scroll down and tap **Add to Home Screen**.
   - Confirm the name "Fidelis Auto" and tap **Add**.
3. **Verify:** The app icon appears on the home screen. Tapping it opens the site in standalone mode (no Safari toolbar).

### Chrome Desktop (for development testing)

1. Open DevTools (F12) → Application → Manifest.
2. Click "Add to home screen" (in the Manifest pane) to simulate the install prompt.
3. The `beforeinstallprompt` event may not fire on desktop unless the site meets engagement criteria.

---

## 3. Validating the manifest.json

### Quick Check (Manual)
Open the manifest URL in a browser:
```
https://fidelisauto.com/manifest.json
```
Verify the JSON renders without errors.

### Using Chrome DevTools
1. Open Chrome DevTools → **Application** tab → **Manifest** pane.
2. All fields should display without warnings.
3. Chrome validates the manifest structure and flags any issues.

### Using Firefox DevTools
1. Open Firefox DevTools → **Application** → **Manifest**.
2. Firefox provides detailed validation warnings.

### Command-Line Validation
```bash
# Validate JSON syntax
python3 -m json.tool public/manifest.json

# Validate with jq
jq . public/manifest.json
```

### Automated Validation Script
```javascript
// Paste in browser console when on fidelisauto.com
const required = ['name', 'short_name', 'description', 'start_url', 'display', 'background_color', 'theme_color', 'icons'];
fetch('/manifest.json')
  .then(r => r.json())
  .then(m => {
    const missing = required.filter(f => !(f in m));
    console.log(missing.length ? `MISSING: ${missing}` : '✅ All required fields present');
    console.log('display:', m.display);
    console.log('icons:', m.icons?.length);
  });
```

### Current Validation Results (August 4, 2026)
| Check | Result |
|-------|--------|
| Valid JSON | ✅ Pass |
| All required fields present | ✅ Pass |
| `display: standalone` | ✅ Pass |
| Icons (2) with src, sizes, type, purpose | ✅ Pass |
| `start_url: /` | ✅ Pass |
| SVG icons only (no PNG fallback) | ⚠️ Advisory: Some Android launchers may not render SVG icons; consider adding 192x192 and 512x512 PNG versions |

---

## 4. Testing Offline Mode

### Method 1: Chrome DevTools (Easiest)
1. Open `https://fidelisauto.com` in Chrome.
2. Open DevTools (F12) → **Network** tab.
3. Check the **"Offline"** checkbox (or set throttling to "Offline").
4. **Navigate to pages you visited while online.** The service worker serves cached responses network-first, falling back to the offline page.
5. Visit a page you haven't cached → should see the custom offline page at `/offline`.

### Method 2: Airplane Mode (Mobile)
1. Visit `https://fidelisauto.com` while online. Browse a few pages to cache them.
2. Enable **Airplane Mode** on your device.
3. Navigate to `https://fidelisauto.com` in your browser.
   - **Cached pages** (visited while online): Should load from cache.
   - **Uncached pages:** Should show the custom offline page.
4. Disable Airplane Mode and reload — pages return to live.

### Method 3: Kill the VPS / Proxy (Advanced)
1. SSH into the VPS and stop the Next.js server:
   ```bash
   systemctl stop fidelis-auto
   # or
   pm2 stop fidelis-auto
   ```
2. Visit `https://fidelisauto.com` in a browser that has previously visited the site.
3. The service worker should intercept navigation and serve cached content or the offline page.
4. Restart the server:
   ```bash
   systemctl start fidelis-auto
   ```

### What to Expect When Offline
| Action | Expected Behavior |
|--------|------------------|
| Visit home page (cached) | Loads from cache (may show stale content) |
| Visit a previously browsed vehicle page | Loads from cache if previously visited |
| Visit a never-visited page | Shows `/offline` custom page |
| Static assets (CSS, JS) | Served from cache (cache-first strategy) |
| API calls | Falls back to cached response if available |

### Clearing the Service Worker Cache (for testing)
```javascript
// In browser console
navigator.serviceWorker.getRegistration().then(reg => {
  reg?.unregister();
});
// Then clear caches
caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
// Reload the page
location.reload();
```

---

## 5. Lighthouse PWA Audit Checklist

Run Lighthouse in Chrome DevTools → **Lighthouse** tab → check "Progressive Web App" → Generate report.

### Installable Criteria (Lighthouse PWA category)
| Audit | Status | Notes |
|-------|--------|-------|
| ✅ `name` field defined in manifest | ✅ Pass | "Fidelis Auto" |
| ✅ `short_name` or `name` defined | ✅ Pass | Both defined |
| ✅ `icons` provided (192px and 512px) | ✅ Pass | SVG 192 & 512 |
| ✅ `start_url` defined | ✅ Pass | `/` |
| ✅ `display` is `standalone` | ✅ Pass | |
| ✅ Service worker registered | ✅ Pass | `/sw.js` with scope `/` |
| ✅ HTTPS served | ✅ Pass | Production on HTTPS |
| ✅ Page loads on offline (with service worker) | ✅ Pass | Falls back to `/offline` |

### Enhanced PWA Criteria (not in default Lighthouse but recommended)
| Feature | Status | Notes |
|---------|--------|-------|
| Splash screen (theme/background color) | ✅ | Theme color `#c9a84c`, background `#1a1a2e` |
| Apple touch icon | ✅ | `icon-192.svg` |
| iOS standalone mode | ✅ | `apple-mobile-web-app-capable: yes` |
| Address bar theming | ✅ | `theme-color: #c9a84c` |
| Maskable icons | ✅ | `purpose: "any maskable"` |
| PNG icon fallback | ⚠️ Missing | SVG only — some older Android launchers may ignore SVG |

### Recommended Improvements
1. **Add PNG icons:** Generate 192×192 and 512×512 PNG versions alongside SVGs for broader compatibility.
2. **Add `categories` to manifest:** Helps app stores categorize the PWA (e.g., `["automotive", "lifestyle"]`).
3. **Add `screenshots` to manifest:** Required for Google Play Store listing via Trusted Web Activity.
4. **Add `lang` field:** e.g., `"lang": "en"` for default locale.
5. **Pre-cache more pages in SW install:** Currently only `/` and `/offline`; consider pre-caching key pages (e.g., `/vehicles`, `/about`).

---

## Appendix: PWA File Map

| File | Purpose |
|------|---------|
| `public/manifest.json` | Web App Manifest |
| `public/sw.js` | Service Worker (112 lines) |
| `public/icon-192.svg` | App icon (192×192) |
| `public/icon-512.svg` | App icon (512×512) |
| `src/components/PwaInstallPrompt.tsx` | Install prompt UI (98 lines) |
| `src/app/[locale]/offline/page.tsx` | Offline fallback page |
| `src/app/[locale]/layout.tsx` | Manifest link, SW registration, Analytics, InstallPrompt |

---

*End of PWA Test Report — Fidelis Auto*