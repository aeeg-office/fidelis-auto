# Fidelis Auto — Phase 10 Performance & SEO Audit (read-only)
**Date:** 2026-08-27 · live on VPS localhost:3006

## Performance
- Home TTFT: 20-90ms, total 24-174ms (3 samples) — excellent, no client-side blocking
- HTML gzip-compressed (31502 bytes home)
- Vehicle page (Beetle): total 187ms, 71KB — fast
- No heavy assets on non-detail pages

## SEO
- robots.txt: Allow all, Disallow /admin /api /verify; Sitemap declared — ✅
- sitemap.xml: 200, 9 URLs, DB-driven (auto-expands with real inventory) — ✅
- canonical: present on home ✅
- JSON-LD structured data: present (1 block home) ✅
- hreflang: NOT emitted per-locale despite /[locale] routes — ⚠️ FID-015 (minor)

## Findings
- FID-015 (low): no per-locale hreflang `alternate` links on pages (site is locale-based)
- Sitemap will naturally cover real vehicles once inventory is DB-driven post Phase 3
