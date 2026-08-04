"use client";

import { useEffect, useRef } from "react";

interface AdSlotProps {
  format?: "leaderboard" | "rectangle" | "in-feed";
  className?: string;
}

const AD_SIZES: Record<string, { width: number; height: number }> = {
  leaderboard: { width: 728, height: 90 },
  rectangle: { width: 300, height: 250 },
  "in-feed": { width: 336, height: 280 },
};

export default function AdSlot({ format = "leaderboard", className = "" }: AdSlotProps) {
  const ref = useRef<HTMLDivElement>(null);
  const size = AD_SIZES[format];

  useEffect(() => {
    // When AdSense is configured, this will push the ad
    // Replace with: (window.adsbygoogle = window.adsbygoogle || []).push({});
    if (ref.current && typeof window !== "undefined" && (window as any).adsbygoogle) {
      try {
        (window as any).adsbygoogle.push({});
      } catch {}
    }
  }, []);

  return (
    <div className={`flex justify-center ${className}`}>
      <div
        ref={ref}
        className="bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] rounded-lg flex items-center justify-center text-[var(--color-text-secondary)] text-xs"
        style={{ width: size.width, height: size.height, maxWidth: "100%" }}
      >
        <div className="text-center p-4">
          <p className="font-medium">Advertisement</p>
          <p className="mt-1 opacity-60">{size.width} × {size.height}</p>
          <p className="mt-1 opacity-40">Configure AdSense in ad-slot.tsx</p>
        </div>
      </div>
    </div>
  );
}