import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GIPHY_API_KEY: process.env.GIPHY_API_KEY,
  },
};

export default nextConfig;
