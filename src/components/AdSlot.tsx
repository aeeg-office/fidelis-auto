"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { ADSENSE_CLIENT, ADSENSE_ENABLED } from "@/lib/adsense";

export type AdFormat = "leaderboard" | "rectangle" | "in-feed";

interface AdSlotProps {
  /** AdSense unit placement: drives both the visual size and data-ad-format. */
  format?: AdFormat;
  /**
   * Stable, placement-scoped AdSense unit id written to `data-ad-slot`.
   * Google assigns numeric unit ids per created ad unit; when the operator
   * creates real units they replace these tokens (e.g. "journal-list") with
   * the numeric ids. Keep them stable per placement either way.
   */
  slotId: string;
  className?: string;
}

const AD_SIZES: Record<AdFormat, { width: number; height: number }> = {
  leaderboard: { width: 728, height: 90 },
  rectangle: { width: 300, height: 250 },
  "in-feed": { width: 336, height: 280 },
};

/** Google data-ad-format attribute per placement (fluid = in-feed). */
const AD_FORMAT_ATTR: Record<AdFormat, string> = {
  leaderboard: "horizontal",
  rectangle: "rectangle",
  "in-feed": "fluid",
};

type AdSenseWindow = Window & typeof globalThis & { adsbygoogle?: unknown[] };

export default function AdSlot({ format = "leaderboard", slotId, className = "" }: AdSlotProps) {
  const t = useTranslations("adSlots");
  const pushed = useRef(false);
  const size = AD_SIZES[format];

  useEffect(() => {
    // Gate: without a configured publisher id this branch never runs, so no
    // `adsbygoogle` push and no ad request can ever be made. The ref guard
    // additionally prevents a duplicate push under React StrictMode
    // double-invocation in development.
    if (!ADSENSE_ENABLED || pushed.current) return;
    pushed.current = true;
    try {
      const w = window as AdSenseWindow;
      // Queue-style push: safe even before the loader script has executed
      // (afterInteractive); the array flushes once adsbygoogle.js loads.
      (w.adsbygoogle = w.adsbygoogle || []).push({});
    } catch {
      // Never let an ad failure break the page.
    }
  }, []);

  // No publisher id configured → render nothing: no placeholder chrome, no
  // external script, no layout impact. The slot simply does not exist.
  if (!ADSENSE_ENABLED) return null;

  return (
    <div className={`flex justify-center w-full ${className}`} data-ad-slot-id={slotId}>
      <div className="w-full" style={{ maxWidth: size.width }}>
        <p className="text-center text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)]/60 mb-1.5">
          {t("advertisement")}
        </p>
        <ins
          className="adsbygoogle"
          style={{ display: "block", minHeight: size.height }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slotId}
          data-ad-format={AD_FORMAT_ATTR[format]}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
