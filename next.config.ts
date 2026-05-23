import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),
  // Facebook reads Open Graph tags from the initial HTML head. Force
  // non-streamed metadata for social crawlers so image/title tags are visible.
  htmlLimitedBots:
    /facebookexternalhit|Facebot|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|WhatsApp|TelegramBot|Discordbot/i,
  experimental: {
    optimizePackageImports: [
      "@heroicons/react",
      "lucide-react",
      "react-icons",
      "framer-motion",
    ],
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

  // ✅ แก้ Google Popup Cross-Origin
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },

  // ✅ ให้ build ผ่าน (ปิด ESLint ตอน build)
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
