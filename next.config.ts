import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output produces a self-contained Node.js server in
  // .next/standalone — ideal for Hostinger VPS / Cloud / Node.js hosting.
  output: "standalone",
};

export default nextConfig;
