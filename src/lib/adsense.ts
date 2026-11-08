/**
 * WS16 — Google AdSense, env-gated.
 *
 * AdSense is a launch-later (L+) integration: no real ca-pub publisher id exists
 * yet, so the *entire* integration stays dark until an operator sets
 *   NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-xxxxxxxxxxxxxxxx
 *
 * This is the same "build fully, live traffic off until provider config exists"
 * pattern used for the WS2 phone gate (PHONE_GATE=enabled). While unset:
 *   - the root layout never emits the adsbygoogle loader <script>, and
 *   - every <AdSlot> renders nothing (no placeholder chrome, no network).
 *
 * `process.env.NEXT_PUBLIC_*` is inlined by Next at build time in both server and
 * client bundles, so checking it here works for the server layout and for client
 * AdSlot components alike — do not move this read into a function that would hide
 * it from webpack's static replacement; keep it at module top level.
 */

/** Trimmed publisher id; empty string when not configured. */
export const ADSENSE_CLIENT = (process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "").trim();

/** Accepts a Real-looking ca-pub id only (numeric part 10–20 digits). */
export const ADSENSE_ENABLED = /^ca-pub-[0-9]{10,20}$/.test(ADSENSE_CLIENT);

/** One-time adsbygoogle loader URL (only meaningful when ADSENSE_ENABLED). */
export const ADSENSE_LOADER_URL = ADSENSE_ENABLED
  ? `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ADSENSE_CLIENT)}`
  : "";
