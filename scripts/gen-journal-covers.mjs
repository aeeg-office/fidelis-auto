/**
 * scripts/gen-journal-covers.mjs (TASK-2026-037 / FID-AUD-403)
 *
 * Generates a labelled-illustration cover for every journal post and writes it to
 * public/images/journal/covers/<slug>.svg AND a raster <slug>.png (1200x630) via sharp.
 *
 * LICENSING: these are ORIGINAL generated vector illustrations owned by the project —
 * no third-party photos. Each cover is clearly labelled "Original illustration" so the
 * FID-AUD-402/403 "licensed or labelled" criterion is satisfied by labelling.
 *
 * Usage: node scripts/gen-journal-covers.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const OUT_DIR = "public/images/journal/covers";
mkdirSync(OUT_DIR, { recursive: true });

// Palette matching the Fidelis Auto brand (see og-default.svg).
const INK = "#1a1a2e";
const GOLD = "#c9a84c";
const IVORY = "#f5f1e8";
const MUTED = "#e8e2d4";
const ACCENT_BG = "#232342";

// Each post: slug, title (EN for the cover label), category.
const POSTS = [
  ["5-essential-tools-every-car-enthusiast-should-own", "5 Essential Tools Every Car Enthusiast Should Own", "Ownership & Running Costs", "wrench"],
  ["best-weekend-cars-under-50000", "The Best Weekend Cars Under $50,000", "Valuation & Prices", "car"],
  ["buying-a-classic-vw-beetle-what-to-check", "Buying a Classic VW Beetle: What to Check", "Collector Culture", "car"],
  ["car-insurance-in-egypt-compulsory-vs-comprehensive", "Car Insurance in Egypt", "Ownership & Running Costs", "shield"],
  ["car-tyres-egypt-sizes-dot-date-rotation-guide", "Car Tyres in Egypt: Sizes, DOT Dates", "Ownership & Running Costs", "tyre"],
  ["chinese-brands-egypt-parts-service-resale", "Chinese Brands Are Reshaping Egypt's New-Car Market", "EV & New Tech", "car"],
  ["classic-mercedes-190e-w124-w126-what-to-check", "Classic Mercedes: 190E, W124 and W126", "Collector Culture", "car"],
  ["complete-guide-to-vehicle-provenance-checks", "The Complete Guide to Vehicle Provenance", "Provenance & Paperwork", "doc"],
  ["dashboard-warning-lights-stop-now-or-schedule", "Dashboard Warning Lights: Stop Now or Schedule?", "Ownership & Running Costs", "dashboard"],
  ["dealer-vs-private-seller", "Dealer or Private Seller?", "Buying Guides", "scale"],
  ["ev-hybrid-running-costs-charging-egypt", "EVs and Hybrids in Egypt: Running Costs", "EV & New Tech", "bolt"],
  ["finding-a-trustworthy-mechanic-in-egypt", "How to Find a Trustworthy Mechanic in Egypt", "Ownership & Running Costs", "wrench"],
  ["first-motorcycle-city-riding-egypt", "Your First Motorcycle for City Riding", "Buying Guides", "motorcycle"],
  ["how-to-inspect-a-used-porsche-911", "How to Inspect a Used Porsche 911", "Inspection Guides", "magnify"],
  ["how-to-sell-your-car-online-step-by-step", "How to Sell Your Car Online: A Step-by-Step Guide", "Selling Guides", "tag"],
  ["how-to-store-a-classic-car-properly-hot-climate", "How to Store a Classic Car in a Hot Climate", "Collector Culture", "garage"],
  ["mercedes-benz-pagoda-what-to-know-before-buying", "Mercedes-Benz Pagoda: What to Know Before Buying", "Buying Guides", "car"],
  ["motorcycle-licensing-gear-rules-egypt", "Motorcycle Licensing, Gear and Rules in Egypt", "Buying Guides", "helmet"],
  ["motorcycle-maintenance-basics-egypt", "Motorcycle Maintenance Basics", "Maintenance Care", "motorcycle"],
  ["ownership-transfer-at-the-traffic-unit", "Ownership Transfer in Egypt: Documents and Steps", "Provenance & Paperwork", "doc"],
  ["pricing-your-car-to-sell-fast", "Pricing Your Car to Sell Fast in Egypt", "Selling Guides", "tag"],
  ["red-flags-and-scams-in-used-car-listings", "Red Flags and Scams in Used Car Listings", "Buyer Protection & Trust", "alert"],
  ["restoration-vs-original-what-drives-classic-car-value", "Restored or Original? What Drives Classic Value", "Collector Culture", "scale"],
  ["road-trip-cairo-to-the-red-sea", "Road Trip: Cairo to the Red Sea in a Convertible", "Road Trips & Travel", "palm"],
  ["true-annual-cost-of-owning-a-car-in-egypt", "The True Annual Cost of Owning a Car in Egypt", "Ownership & Running Costs", "coin"],
  ["understanding-vehicle-import-rules-egypt-and-gcc", "Understanding Vehicle Import Rules in Egypt and the GCC", "Import & Export Rules", "globe"],
  ["what-a-pre-purchase-inspection-checks", "What a Pre-Purchase Inspection Actually Checks", "Inspection Guides", "magnify"],
  ["why-classics-hold-value-and-when-they-dont", "Why Some Classics Hold Their Value", "Collector Culture", "coin"],
];

// Simple geometric icon glyphs (line art on a gold ring) positioned top-centre.
function iconGlyph(kind) {
  const c = 'stroke="#c9a84c" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"';
  switch (kind) {
    case "wrench": return `<path d="M520 205 l38 -38 a26 26 0 0 1 -8 47 l-30 30 z" ${c}/><path d="M500 230 l-52 -20 a40 40 0 0 1 56 -56 l20 52 -20 24 z" ${c}/>`;
    case "car": return `<path d="M480 245 h135 l22 -34 a14 14 0 0 1 12 -7 h30 a12 12 0 0 1 12 12 v29 z" ${c}/><circle cx="500" cy="250" r="8" fill="#c9a84c"/><circle cx="620" cy="250" r="8" fill="#c9a84c"/><circle cx="505" cy="225" r="5" fill="#c9a84c"/>`;
    case "shield": return `<path d="M548 185 v95 l34 -20 34 20 v-95 z" ${c}/><path d="M548 200 a34 34 0 0 1 68 0 h-68 z" ${c}/>`;
    case "tyre": return `<circle cx="582" cy="225" r="46" ${c}/><circle cx="582" cy="225" r="18" ${c}/>`;
    case "doc": return `<path d="M550 185 v100 h60 v-100 z M562 205 h36 M562 220 h36 M562 235 h24" ${c}/>`;
    case "dashboard": return `<path d="M525 190 a62 62 0 1 1 0 40" ${c}/><path d="M560 210 l20 20" ${c}/><circle cx="582" cy="232" r="9" fill="#c9a84c"/>`;
    case "scale": return `<path d="M547 195 v40 M537 195 h70 M517 205 h80" ${c}/><path d="M532 205 l-22 34 M652 205 l-22 34" ${c}/>`;
    case "bolt": return `<path d="M576 190 l-22 44 h28 l-18 44 40 -56 h-28 l16 -32 z" fill="#c9a84c"/>`;
    case "motorcycle": return `<circle cx="546" cy="235" r="16" ${c}/><circle cx="628" cy="235" r="16" ${c}/><path d="M556 235 h30 l20 -46 h-34" ${c}/><path d="M586 235 l16 -34 h-10" ${c}/>`;
    case "magnify": return `<circle cx="562" cy="212" r="30" ${c}/><path d="M584 234 l30 30" ${c}/>`;
    case "tag": return `<path d="M548 190 h50 l44 44 -50 50 -62 -62 z" ${c}/><circle cx="600" cy="242" r="7" fill="#c9a84c"/>`;
    case "garage": return `<path d="M536 220 v60 h92 v-60 l-46 -38 z" ${c}/><path d="M566 250 v30 h34 v-30 z" ${c}/>`;
    case "helmet": return `<path d="M545 235 a40 40 0 0 1 80 0 v-6 a40 40 0 0 0 -80 0 z" ${c}/><path d="M558 218 a30 30 0 0 1 52 10" ${c}/>`;
    case "alert": return `<path d="M582 185 l-42 66 h84 z" ${c}/><circle cx="582" cy="226" r="4" fill="#c9a84c"/><path d="M582 236 v8" ${c}/>`;
    case "palm": return `<path d="M582 240 v-44" ${c}/><path d="M582 206 l-26 -16 M582 216 l-30 -6 M582 226 l-28 4 M582 206 l26 -16 M582 216 l30 -6 M582 226 l26 6" ${c}/>`;
    case "coin": return `<circle cx="582" cy="235" r="40" ${c}/><text x="582" y="244" font-family="Arial,sans-serif" font-size="26" fill="#c9a84c" text-anchor="middle" font-weight="700">E£</text>`;
    case "globe": return `<circle cx="582" cy="225" r="42" ${c}/><path d="M540 225 h84 M548 225 a42 42 0 0 0 20 30 M552 195 a42 42 0 0 1 20 30" ${c}/>`;
    default: return `<circle cx="582" cy="225" r="42" ${c}/><path d="M564 210 a22 22 0 0 1 36 0" ${c}/><circle cx="582" cy="232" r="6" fill="#c9a84c"/>`;
  }
}

function svgCover(slug, title, category, kind) {
  const safeTitle = title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const safeCat = category.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // Auto-shrink the title font so long titles still fit the 1080px text band.
  const titleFont = title.length > 60 ? 40 : title.length > 40 ? 46 : 52;
  const maxChars = 78; // cap extremely long titles at ~2 lines worth; ellipsize past that
  const displayTitle = safeTitle.length > maxChars ? `${safeTitle.slice(0, maxChars - 1)}…` : safeTitle;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <rect width="1200" height="630" fill="#1a1a2e"/>
  <!-- subtle diagonal texture -->
  <g stroke="#2b2b50" stroke-width="2" opacity="0.5">
    ${Array.from({ length: 9 }, (_, i) => `<path d="M${(i * 180) - 60} -40 L${(i * 180) + 180} 680" />`).join("\n    ")}
  </g>
  <g transform="translate(582, 235)">${iconGlyph(kind)}</g>
  <text x="600" y="330" font-family="Georgia, serif" font-size="${titleFont}" fill="#f5f1e8" text-anchor="middle" font-weight="700">${displayTitle}</text>
  <text x="600" y="380" font-family="Arial, sans-serif" font-size="22" fill="#c9a84c" text-anchor="middle" letter-spacing="2">${safeCat}</text>
  <rect x="60" y="440" width="1080" height="2" fill="#3a3a66"/>
  <text x="600" y="490" font-family="Georgia, serif" font-size="36" fill="#f5f1e8" text-anchor="middle" font-weight="600">Fidelis Auto Journal</text>
  <text x="600" y="535" font-family="Arial, sans-serif" font-size="20" fill="#c9a84c" text-anchor="middle">fidelisauto.com</text>
  <!-- labelled-illustration badge -->
  <rect x="934" y="56" width="200" height="40" rx="20" fill="#232342" stroke="#c9a84c" stroke-width="2"/>
  <text x="1034" y="82" font-family="Arial, sans-serif" font-size="18" fill="#e8e2d4" text-anchor="middle">ORIGINAL ILLUSTRATION</text>
</svg>
`;
}

for (const [slug, title, cat, kind] of POSTS) {
  const svg = svgCover(slug, title, cat, kind);
  const svgPath = join(OUT_DIR, `${slug}.svg`);
  writeFileSync(svgPath, svg);
  // Rasterize to PNG (og:image prefers raster) via sharp.
  await sharp(Buffer.from(svg)).resize(1200, 630).png().toFile(join(OUT_DIR, `${slug}.png`));
  console.log(`wrote ${svgPath} + .png`);
}
console.log(`\nGenerated ${POSTS.length} cover images.`);