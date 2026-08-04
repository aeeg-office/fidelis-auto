# Fidelis Auto — Analytics Setup

> **Project:** Fidelis Auto (fidelisauto.com)
> **Generated:** August 4, 2026
> **Framework:** Next.js 16
> **Analytics Provider:** @vercel/analytics v2.0.1

---

## 1. What Analytics Are Implemented

### @vercel/analytics (v2.0.1)

**Package:** `@vercel/analytics` v2.0.1
**Component:** `<Analytics />` from `@vercel/analytics/react`
**Location:** `src/app/[locale]/layout.tsx` (line 13, rendered on line 74)

```tsx
// src/app/[locale]/layout.tsx
import { Analytics } from "@vercel/analytics/react";

// Inside the component:
<Analytics />
```

**What it tracks:**
- Page views (automatically — no manual page tracking needed)
- Web Vitals (LCP, CLS, FID/INP, TTFB)
- Navigation events (SPA route changes)
- Session data (referrer, browser, device, country)

**No custom events** are manually emitted at this time — Vercel Analytics collects all standard metrics out of the box when the `<Analytics />` component is mounted.

### What's NOT implemented (future scope)
- Google Analytics 4 (see §4 below)
- Custom event tracking (button clicks, form submissions, vehicle view events)
- Conversion tracking (lead form submissions, newsletter signups)
- E-commerce tracking (vehicle views, compare events, favorites)

---

## 2. How to Verify Analytics Are Sending Data

### Method 1: Vercel Dashboard (Production)
1. Log in to [vercel.com](https://vercel.com) → select the **fidelis-auto** project.
2. Navigate to **Analytics** tab in the sidebar.
3. If data is flowing, you'll see:
   - **Page views** over time (today, 7d, 30d)
   - **Top pages** (most visited routes)
   - **Top referrers** (where traffic comes from)
   - **Web Vitals** (performance metrics)
   - **Countries** (visitor geography)
4. **Expected:** After deploying the `<Analytics />` component, data appears within minutes. If no data after 24 hours, check the deployment logs.

### Method 2: Browser Network Tab (Debugging)
1. Open `https://fidelisauto.com` in Chrome.
2. Open DevTools → **Network** tab.
3. Filter by `collect` or `vercel` in the filter bar.
4. Reload the page.
5. Look for requests to `vitals.vercel-insights.com` or `events.vercel-insights.com`.
6. **Expected:** You should see POST requests to Vercel's analytics endpoint when the page loads or navigates.

### Method 3: Browser Console (Quick Check)
```javascript
// Paste in browser console on fidelisauto.com
const analyticsSent = performance.getEntriesByType('resource')
  .filter(e => e.name.includes('vercel-insights') || e.name.includes('collect'));
console.log(analyticsSent.length ? '✅ Analytics sending' : '❌ No analytics requests detected');
```

### Method 4: Check the Source
```bash
# Verify the component is rendered (look for Analytics in the layout)
grep -r "Analytics" src/app/ --include="*.tsx"
# Expected output: src/app/[locale]/layout.tsx:import { Analytics } from "@vercel/analytics/react";
#                  src/app/[locale]/layout.tsx:          <Analytics />
```

### Troubleshooting
| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| No data in Vercel dashboard | `<Analytics />` not rendered | Check `[locale]/layout.tsx` includes it |
| Data in dev but not prod | Build cache | Re-deploy with `--force` |
| Analytics blocked | Ad blocker / privacy extension | Disable or add exception for `vercel-insights.com` |
| Vercel project not linked | No `vercel.json` or team mismatch | Run `vercel link` to link the project |

---

## 3. Where to Find the Analytics Dashboard

### Vercel Analytics Dashboard (Primary)
- **URL:** [https://vercel.com](https://vercel.com)
- **Navigation:** Log in → Select `fidelis-auto` project → **Analytics** tab
- **Available metrics:**
  - Page views (daily, weekly, monthly)
  - Top pages (URL paths ranked by visits)
  - Top referrers (domains sending traffic)
  - Top countries (visitor geographic distribution)
  - Web Vitals (LCP, CLS, INP — aggregated by page)
  - Path views (detailed breakdown per route)

### Data Retention
- **Free plan:** 30-day data retention
- **Pro plan:** 90-day data retention
- **Enterprise:** Extended retention available

### Exporting Data
Vercel Analytics does not currently support CSV/API export on the free tier. For custom analytics, add Google Analytics 4 as described in §4.

---

## 4. How to Add Google Analytics 4 (Future Option)

### Option A: Using `next/script` with GA4 (Simpler)

```tsx
// src/app/[locale]/layout.tsx — add near other Script tags

// 1. Install (no npm package needed — GA4 uses gtag script)
// 2. Add the GA4 script:
import Script from "next/script";

// Inside the component body, before the closing </body>:
<Script
  src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  `}
</Script>
```

### Option B: Using `@next/third-parties` (Recommended for Next.js)

```bash
npm install @next/third-parties
```

```tsx
// src/app/[locale]/layout.tsx
import { GoogleAnalytics } from "@next/third-parties/google";

// Inside the component, before closing </body>:
<GoogleAnalytics gaId="G-XXXXXXXXXX" />
```

### Option C: Vercel + GA4 Integration (Dashboard)

1. In Vercel dashboard → project settings → **Integrations**.
2. Search for "Google Analytics" and install the integration.
3. Link your GA4 property.
4. Vercel automatically injects the GA4 measurement ID as an environment variable.

### Recommended Setup: Dual Tracking

```tsx
// Both analytics can coexist without conflict
<Analytics />      // Vercel Analytics — lightweight, dashboard
<GoogleAnalytics gaId="G-XXXXXXXXXX" />  // GA4 — custom events, exports, dashboards
```

### Custom Event Tracking with GA4

Once GA4 is installed, add custom events to track user actions:

```tsx
// Example: track a vehicle view
function trackVehicleView(slug: string, title: string) {
  gtag("event", "view_item", {
    currency: "USD",
    items: [{ item_id: slug, item_name: title }],
  });
}

// Example: track a contact form submission
function trackContactForm(type: string) {
  gtag("event", "generate_lead", { value: type });
}
```

### GA4 vs Vercel Analytics Comparison

| Feature | Vercel Analytics | Google Analytics 4 |
|---------|-----------------|-------------------|
| Setup complexity | One component import | Script injection + measurement ID |
| Data retention | 30–90 days | Up to 14 months (configurable) |
| Custom events | Not supported (page views only) | Full event tracking |
| Export / API | Limited | Full Data API + BigQuery |
| Cost | Free on all plans | Free (standard) |
| Privacy / GDPR | Built-in (no cookies) | Requires cookie consent |
| Web Vitals | Built-in | Requires manual setup |
| Real-time dashboard | Yes | Yes (limited) |

---

## Appendix: File Reference

| File | Relevance |
|------|-----------|
| `src/app/[locale]/layout.tsx` | Mounts `<Analytics />` component and service worker registration |
| `package.json` | Lists `@vercel/analytics: "^2.0.1"` |
| `node_modules/@vercel/analytics/` | Analytics package source (do not edit) |

---

*End of Analytics Setup — Fidelis Auto*