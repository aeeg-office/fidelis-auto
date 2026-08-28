// Shared taxonomy for Fidelis Auto blog categories (Phase 7).
export const BLOG_CATEGORIES = [
  "Buying Guides",
  "Selling Guides",
  "Valuation & Prices",
  "Inspection Guides",
  "Provenance & Paperwork",
  "Ownership & Running Costs",
  "Maintenance Care",
  "Restoration & Upgrades",
  "Road Trips & Travel",
  "Collector Culture",
  "EV & New Tech",
  "Import & Export Rules",
  "Fleet & Business",
  "Buyer Protection & Trust",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

// Services marketplace — 6 category groups (Phase 7 spec)
export const SERVICE_CATEGORIES = [
  {
    slug: "buy-verify",
    label: "Buy & Verify",
    description: "Pre-purchase inspections, provenance checks, valuation, import compliance.",
  },
  {
    slug: "maintain-repair",
    label: "Maintain & Repair",
    description: "Servicing, mechanical repair, diagnostics, and specialist workshops.",
  },
  {
    slug: "protect-detail",
    label: "Protect & Detail",
    description: "Ceramic coating, PPF, detailing, storage, and insurance.",
  },
  {
    slug: "restore-upgrade",
    label: "Restore & Upgrade",
    description: "Restoration, bodywork, customisation, and performance upgrades.",
  },
  {
    slug: "own-support",
    label: "Own & Support",
    description: "Valuations, concierge, transport, logistics, and ownership services.",
  },
  {
    slug: "parts-accessories",
    label: "Parts & Accessories",
    description: "OEM and aftermarket parts, wheels, and accessories.",
  },
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];