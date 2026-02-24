import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath:
    process.env.NODE_ENV === "production" ? "/proto-vibes-playground" : "",
  assetPrefix:
    process.env.NODE_ENV === "production" ? "/proto-vibes-playground" : "",
};

export default nextConfig;
