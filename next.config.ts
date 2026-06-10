import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;

if (process.env.CF_PAGES) {
  import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
}
