import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Docker imajı standalone çıktı ister, Cloudflare (OpenNext) istemez.
   * Hedef, Dockerfile içinde `BUILD_TARGET=docker` ile seçilir.
   */
  output: process.env.BUILD_TARGET === "docker" ? "standalone" : undefined,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;

// Yerel `next dev` sırasında Cloudflare bağlantılarını (D1, R2) kullanılabilir kılar.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
void initOpenNextCloudflareForDev();
