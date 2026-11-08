"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Eye, ImageOff, Layers } from "lucide-react";
import VehicleImage from "./VehicleImage";

interface StudioCoverStageProps {
  /** Primary (cover) photo path, e.g. /uploads/vehicles/<slug>/<uuid>.jpg. */
  src: string;
  /** Vehicle title for alt text. */
  alt?: string;
  /** Return to the standard gallery (one tap away from the original photo). */
  onExit?: () => void;
}

/**
 * Self-hosted "Studio Cover" presentation mode for the vehicle's primary photo.
 *
 * This is a labelled *illustration cover*, never a real studio photograph:
 *  - a self-hosted SVG/CSS backdrop (subtle Egyptian/heritage studio scene with
 *    the Fidelis Auto wordmark) sits BEHIND the unmodified photo;
 *  - the photo is composited in front (object-contain, sharp, untouched file);
 *  - a persistent badge states it is an illustration, and "View original photo"
 *    leaves the stage in one tap;
 *  - if the photo itself cannot load, the stage collapses to a labelled notice
 *    with a path back to the standard gallery (graceful offline fallback).
 * Nothing here writes, transforms, or re-encodes the uploaded source — pure
 * presentation layer.
 */
export default function StudioCoverStage({ src, alt = "", onExit }: StudioCoverStageProps) {
  const t = useTranslations("studioCover");
  const [missing, setMissing] = useState(false);

  return (
    <div className="relative aspect-[21/9] rounded-lg overflow-hidden select-none">
      {/* Illustration backdrop — labelled, self-hosted, decorative. */}
      <div className="absolute inset-0" aria-hidden="true">
        <StudioBackdrop />
      </div>

      {missing ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-6 text-center">
          <ImageOff size={28} className="text-white/70" />
          <p className="text-white/85 text-sm font-medium max-w-md">{t("photoUnavailable")}</p>
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-medium px-3 py-1.5 transition-colors"
          >
            <Layers size={14} /> {t("backToGallery")}
          </button>
        </div>
      ) : (
        <>
          {/* The actual photo, composited above the podium — untouched & sharp. */}
          <div className="absolute inset-0 z-10 flex items-end justify-center pb-[5%] px-6">
            <VehicleImage
              src={src}
              alt={alt || t("studioAlt")}
              priority
              sizes="(max-width: 768px) 100vw, 90vw"
              onError={() => setMissing(true)}
              className="w-auto h-auto max-w-[94%] max-h-[82%] object-contain"
              style={{ filter: "drop-shadow(0 20px 28px rgba(20,12,4,0.38))" }}
            />
          </div>

          {/* Illustration label — honesty first, never presented as a real photo. */}
          <span className="absolute top-3 start-3 z-20 inline-flex items-center gap-1.5 bg-black/55 text-white/95 text-[11px] font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
            <Layers size={12} /> {t("illustrationBadge")}
          </span>

          {/* One tap back to the original photo. */}
          <button
            type="button"
            onClick={onExit}
            className="absolute top-3 end-3 z-20 inline-flex items-center gap-1.5 bg-white/90 hover:bg-white text-[var(--color-ink)] text-xs font-semibold px-3 py-1.5 rounded-full shadow transition-colors"
          >
            <Eye size={14} /> {t("viewOriginal")}
          </button>
        </>
      )}
    </div>
  );
}

/**
 * The labelled illustration backdrop: warm heritage-studio scene built purely
 * from inline SVG + CSS gradients (no external assets, no raster files):
 * sandy sky gradient, sun disc, pyramid silhouettes, an arch, a podium floor
 * line under the car, and the Fidelis Auto wordmark (EN + AR).
 */
function StudioBackdrop() {
  return (
    <svg
      className="w-full h-full"
      viewBox="0 0 1600 686"
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
    >
      <defs>
        <linearGradient id="studioSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#efe4c9" />
          <stop offset="55%" stopColor="#dcc091" />
          <stop offset="100%" stopColor="#b98d5e" />
        </linearGradient>
        <linearGradient id="studioFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a2b1e" />
          <stop offset="100%" stopColor="#17110b" />
        </linearGradient>
        <radialGradient id="studioSun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff4d6" />
          <stop offset="70%" stopColor="#f0c078" />
          <stop offset="100%" stopColor="#e8b46a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="podiumShine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3d2e1f" />
          <stop offset="100%" stopColor="#241b12" />
        </linearGradient>
      </defs>

      {/* Sky + floor */}
      <rect width="1600" height="560" fill="url(#studioSky)" />
      <rect y="560" width="1600" height="126" fill="url(#studioFloor)" />
      <line x1="0" y1="560" x2="1600" y2="560" stroke="#2b2118" strokeWidth="3" />

      {/* Sun disc with soft glow */}
      <circle cx="1180" cy="250" r="150" fill="url(#studioSun)" />
      <circle cx="1180" cy="250" r="92" fill="#fff2cf" opacity="0.92" />

      {/* Pyramid silhouettes (heritage geometry) */}
      <polygon points="60,560 360,300 660,560" fill="#a67c4a" opacity="0.85" />
      <polygon points="560,560 720,430 880,560" fill="#96703f" opacity="0.6" />
      <polygon points="980,560 1260,340 1560,560" fill="#8f6a3e" opacity="0.8" />

      {/* Archway hint */}
      <path d="M 1180 560 L 1180 430 Q 1180 380 1240 380 Q 1300 380 1300 430 L 1300 560 Z" fill="#7c5a33" opacity="0.55" />

      {/* Podium floor under the car */}
      <ellipse cx="800" cy="600" rx="430" ry="44" fill="#1f1710" opacity="0.9" />
      <ellipse cx="800" cy="596" rx="360" ry="30" fill="url(#podiumShine)" />

      {/* Decorative heritage frame */}
      <rect x="26" y="26" width="1548" height="634" fill="none" stroke="#3e2c18" strokeOpacity="0.35" strokeWidth="2" />
      <rect x="36" y="36" width="1528" height="614" fill="none" stroke="#3e2c18" strokeOpacity="0.18" strokeWidth="1.5" />

      {/* Fidelis Auto wordmark (EN + AR) */}
      <text
        x="800" y="118" textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif" fontSize="46" letterSpacing="10"
        fill="#3e2c18"
      >
        FIDELIS AUTO
      </text>
      <text
        x="800" y="152" textAnchor="middle"
        fontFamily="'Noto Naskh Arabic', 'Traditional Arabic', serif" fontSize="20" letterSpacing="2"
        fill="#5a3f22"
      >
        فيديليس أوتو
      </text>
      <text
        x="800" y="180" textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif" fontSize="13" letterSpacing="5"
        fill="#6b4c2b"
      >
        CURATED COLLECTION · EGYPT
      </text>
    </svg>
  );
}
