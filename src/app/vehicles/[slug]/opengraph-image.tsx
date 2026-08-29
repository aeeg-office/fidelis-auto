import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

// Image metadata
export const alt = "Fidelis Auto — Premium Collector Vehicle";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Design tokens
const DARK_BG = "#1a1a2e";
const GOLD = "#c9a84c";
const TEXT_LIGHT = "#f5f5f0";
const TEXT_MUTED = "rgba(245, 245, 240, 0.6)";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<ImageResponse> {
  const { slug } = await params;

  let title = "";
  let year: number | string = "";
  let make = "";
  let model = "";
  let coverImage: string | null = null;

  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { slug },
      select: {
        title: true, year: true, make: true, model: true,
        images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], take: 1 },
      },
    });
    if (vehicle) {
      title = vehicle.title;
      year = vehicle.year;
      make = vehicle.make;
      model = vehicle.model;
      coverImage = vehicle.images[0]?.src ?? null;
    }
  } catch {
    // DB unavailable — fall back to slug-derived title
    title = slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  // Fallback title if DB returned no data
  if (!title) {
    title = "Fidelis Auto — Collector Vehicle";
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: DARK_BG,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: coverImage ? "64px 80px 64px 480px" : "64px 80px",
          position: "relative",
        }}
      >
        {/* Gold accent bar at top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: GOLD,
          }}
        />

        {/* Cover photo (left panel) when an uploaded image exists */}
        {coverImage && (
          <div
            style={{
              position: "absolute",
              top: 6,
              left: 0,
              bottom: 0,
              width: 400,
              background: "#000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImage.startsWith("http") ? coverImage : `https://fidelisauto.com${coverImage}`}
              alt=""
              width={400}
              height={624}
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
            />
          </div>
        )}

        {/* Brand */}
        <div
          style={{
            position: "absolute",
            top: 36,
            left: coverImage ? 480 : 80,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="4" fill={GOLD} />
            <path
              d="M8 20L16 8L24 20H8Z"
              fill={DARK_BG}
            />
          </svg>
          <span
            style={{
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: "0.15em",
              color: GOLD,
              textTransform: "uppercase",
            }}
          >
            Fidelis Auto
          </span>
        </div>

        {/* Vehicle title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            maxWidth: 900,
          }}
        >
          <span
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: TEXT_LIGHT,
              textAlign: "center",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </span>

          {/* Year · Make · Model */}
          <span
            style={{
              fontSize: 28,
              color: GOLD,
              textAlign: "center",
              letterSpacing: "0.05em",
            }}
          >
            {year && make && model
              ? `${year} · ${make} · ${model}`
              : year && make
                ? `${year} · ${make}`
                : ""}
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: coverImage ? 480 : 80,
            right: 80,
            display: "flex",
            justifyContent: "center",
            borderTop: `1px solid rgba(201, 168, 76, 0.25)`,
            paddingTop: 20,
          }}
        >
          <span
            style={{
              fontSize: 16,
              color: TEXT_MUTED,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Own the Story
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}