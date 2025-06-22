import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        hostname: "**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
    nodeMiddleware: true,
  },
};

export default nextConfig;
