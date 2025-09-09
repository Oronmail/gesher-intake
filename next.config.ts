import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Force cache invalidation
  env: {
    CACHE_BUST: Date.now().toString(),
  },
};

export default nextConfig;
