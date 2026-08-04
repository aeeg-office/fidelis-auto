import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Future vehicle image CDN. Remove `unoptimized` on the Image component
      // (see src/components/VehicleImage.tsx) once real raster images are served
      // from here instead of the local SVG placeholders.
      {
        protocol: "https",
        hostname: "cdn.fidelisauto.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.fidelisauto.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;