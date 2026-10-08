import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  outputFileTracingRoot: path.join(__dirname, "../.."),
  images: { remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }] },
  async redirects() {
    return [
      { source: "/onboarding", destination: "/?auth=brand-create", permanent: false },
    ];
  },
};

export default nextConfig;
