import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      // Supabase Storage
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // External images
      {
        protocol: "https",
        hostname: "image.api.playstation.com",
        pathname: "/**",
      },
    ],
  },
  output: "standalone",
};

export default nextConfig;
