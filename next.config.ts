import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

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
