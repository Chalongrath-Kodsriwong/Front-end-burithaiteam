import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),

  // Facebook/social crawlers get non-streamed HTML for OG tags
  htmlLimitedBots:
    /facebookexternalhit|Facebot|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|WhatsApp|TelegramBot|Discordbot/i,

  // Tree-shake icon libraries — reduces bundle size significantly
  experimental: {
    optimizePackageImports: [
      "@heroicons/react",
      "lucide-react",
      "react-icons",
      "framer-motion",
    ],
  },

  // Allow Next.js Image optimization for product images from backend
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "burithaiteam.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5001",
      },
      {
        protocol: "http",
        hostname: "66.212.22.21",
        port: "5001",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  async redirects() {
    return [
      {
        source: "/detail_product",
        destination: "/product",
        permanent: false,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Google OAuth popup ต้องการ allow-popups
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          // ป้องกัน MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // ป้องกัน clickjacking
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // ลด referrer info ที่ส่งออกไป
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // ปิด browser features ที่ไม่ได้ใช้
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          // Force HTTPS ทุก request (1 ปี)
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
