"use client";

import Banner from "./components/section_page/Banner";
import Newproducts from "./components/section_page/Newproduct";
import BrandSupport from "./components/section_page/Brandsupport";
import Achievement from "./components/section_page/Achievement";
import Mostsell from "./components/section_page/Mostsell";
import Normalproducts from "./components/section_page/Normalproducts";

const trustStats = [
  { num: "20+", label: "ปีประสบการณ์",   sub: "Years in Business",   icon: "📅" },
  { num: "500+", label: "โปรเจกต์สำเร็จ", sub: "Projects Completed",  icon: "🏆" },
  { num: "5",   label: "แบรนด์พรีเมียม",  sub: "Premium Brands",      icon: "⭐" },
  { num: "100%", label: "ใส่ใจทุกงาน",    sub: "Service Quality",     icon: "✅" },
];

export default function Home() {
  return (
    <main className="overflow-x-hidden bg-[#08090d]">

      {/* ── Hero Banner ── */}
      <Banner />

      {/* ══════════════════════════════
          TRUST STATS STRIP
      ══════════════════════════════ */}
      <div className="relative bg-[#0a0c10] border-y border-[rgba(0,207,255,0.1)]">
        <div className="absolute inset-0 bg-led-grid opacity-30 pointer-events-none" />
        <div className="container mx-auto px-4 py-5 sm:py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-0 sm:divide-x sm:divide-[rgba(0,207,255,0.1)]">
            {trustStats.map((s) => (
              <div key={s.label} className="stat-card sm:bg-transparent sm:shadow-none sm:border-none flex flex-col items-center text-center px-3 py-3 sm:py-2 sm:px-6 rounded-xl sm:rounded-none">
                <span className="text-xl mb-1">{s.icon}</span>
                <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00CFFF] to-[#D4AF37] leading-none">
                  {s.num}
                </span>
                <span className="text-xs font-semibold text-[#E8F0F8] mt-1.5">{s.label}</span>
                <span className="text-[10px] text-[#445566] mt-0.5">{s.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════
          NEW PRODUCTS
      ══════════════════════════════ */}
      <div className="relative bg-[#0d0f14] overflow-hidden">
        <div className="absolute inset-0 bg-led-grid opacity-40 pointer-events-none" />
        <div className="section-glow absolute inset-0 pointer-events-none" />
        <div className="glow-orb-cyan absolute w-[500px] h-[500px] -top-20 -left-20 opacity-80" />
        <div className="glow-orb-warm absolute w-[400px] h-[400px] top-0 right-0 opacity-50" />
        <div className="relative z-10 container mx-auto px-4 py-14 sm:py-20">
          <Newproducts />
        </div>
      </div>

      <div className="section-divider" />

      {/* ══════════════════════════════
          ACHIEVEMENT
      ══════════════════════════════ */}
      <div className="relative bg-[#08090d] overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-30 pointer-events-none" />
        <div className="section-glow absolute inset-0 pointer-events-none" />
        <div className="glow-orb-cyan absolute w-[700px] h-[300px] bottom-0 left-1/2 -translate-x-1/2 opacity-70" />
        <div className="relative z-10 container mx-auto px-4 py-14 sm:py-20">
          <Achievement />
        </div>
      </div>

      <div className="section-divider" />

      {/* ══════════════════════════════
          MOST SELL
      ══════════════════════════════ */}
      <div className="relative bg-[#0d0f14] overflow-hidden">
        <div className="absolute inset-0 bg-led-grid opacity-40 pointer-events-none" />
        <div className="section-glow absolute inset-0 pointer-events-none" />
        <div className="glow-orb-cyan absolute w-[500px] h-[500px] -top-20 -right-20 opacity-65" />
        <div className="glow-orb-amber absolute w-[400px] h-[400px] bottom-0 left-0 opacity-50" />
        <div className="relative z-10 container mx-auto px-4 py-14 sm:py-20">
          <Mostsell />
        </div>
      </div>

      <div className="section-divider" />

      {/* ══════════════════════════════
          BRAND SUPPORT
      ══════════════════════════════ */}
      <div className="relative bg-[#08090d] overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-25 pointer-events-none" />
        <div className="section-glow absolute inset-0 pointer-events-none" />
        <div className="glow-orb-cyan absolute w-[600px] h-[400px] -bottom-20 left-1/2 -translate-x-1/2 opacity-60" />
        <div className="relative z-10 container mx-auto px-4 py-14 sm:py-20">
          <BrandSupport />
        </div>
      </div>

      <div className="section-divider" />

      {/* ══════════════════════════════
          ALL PRODUCTS
      ══════════════════════════════ */}
      <div className="relative bg-[#0d0f14] overflow-hidden">
        <div className="absolute inset-0 bg-led-grid opacity-35 pointer-events-none" />
        <div className="section-glow absolute inset-0 pointer-events-none" />
        <div className="glow-orb-cyan absolute w-[480px] h-[480px] -top-16 -left-16 opacity-65" />
        <div className="glow-orb-warm absolute w-[400px] h-[400px] -bottom-16 -right-16 opacity-50" />
        <div className="relative z-10 container mx-auto px-4 py-14 sm:py-20">
          <Normalproducts />
        </div>
      </div>

    </main>
  );
}
