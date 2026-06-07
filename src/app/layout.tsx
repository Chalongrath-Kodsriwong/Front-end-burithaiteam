import type { Metadata } from "next";
import "./globals.css";

import TopNavbar from "./components/Topnarbar";
import Footer from "./components/Footer";
import { CartProvider } from "./context/CartContext"; // ✅ เพิ่มตรงนี้

import GlobalAuthGuard from "./components/GlobalAuthChecker";

export const metadata: Metadata = {
  metadataBase: new URL("https://burithaiteam.com"),
  verification: {
    other: {
      "facebook-domain-verification": ["dvkiqpln0jbtvoa8cbaayn1mzz4xrr"],
    },
  },
  title: "BuriThaiTeam Store",
  description:
    "BuriThaiTeam Store ผู้เชี่ยวชาญด้านจอ LED Module อุปกรณ์ควบคุม และงานติดตั้งจอ LED คุณภาพสูง",
  openGraph: {
    title: "BuriThaiTeam Store - จอ LED Module คุณภาพสูง",
    description:
      "ผู้เชี่ยวชาญด้านจอ LED Module อุปกรณ์ควบคุม และงานติดตั้งจอ LED คุณภาพสูง",
    url: "https://burithaiteam.com/",
    siteName: "BuriThaiTeam Store",
    images: [
      {
        url: "/image/logo_black.jpg",
        width: 1200,
        height: 630,
        alt: "BuriThaiTeam Store",
      },
    ],
    locale: "th_TH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BuriThaiTeam Store - จอ LED Module คุณภาพสูง",
    description:
      "ผู้เชี่ยวชาญด้านจอ LED Module อุปกรณ์ควบคุม และงานติดตั้งจอ LED คุณภาพสูง",
    images: ["/image/logo_black.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#08090d] text-[#E8F0F8]">
        {/* ✅ ห่อด้วย CartProvider ครอบทั้ง app */}
        <CartProvider>
          <GlobalAuthGuard />
          <header className="fixed top-0 left-0 right-0 z-[1000] bg-[#08090d]/92 backdrop-blur-xl border-b border-[rgba(0,207,255,0.12)]">
            <TopNavbar />
          </header>
          <main className="pt-[120px] sm:pt-[100px] md:pt-[170px]">
            {children}
          </main>
          <footer>
            <Footer />
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
