"use client";

import Banner from "./section_about/Banner";
import Ourservice from "./section_about/Ourservice";
import Ourmission from "./section_about/Ourmission";

export default function AboutPage() {
  return (
    <main className="overflow-x-hidden bg-[#08090d]">
      {/* Page hero header */}
      <div className="relative bg-[#0d0f14] border-b border-[rgba(0,207,255,0.12)] py-12 sm:py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-led-grid opacity-30 pointer-events-none" />
        <div className="glow-orb-cyan w-[500px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50" />
        <div className="relative z-10 container mx-auto flex flex-col items-center text-center">
          <span className="section-eyebrow-led mb-4">About Us</span>
          <h1 className="section-heading mb-3">เกี่ยวกับเรา</h1>
          <p className="text-sm text-[#5A7A98]">ผู้เชี่ยวชาญด้านจอ LED ประสบการณ์กว่า 20 ปี ไว้วางใจได้</p>
          <div className="gold-dot-sep">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00CFFF] shadow-[0_0_8px_rgba(0,207,255,0.9)]" />
          </div>
        </div>
      </div>

      {/* Banner slider */}
      <div className="bg-[#08090d]">
        <div className="container mx-auto px-4">
          <Banner />
        </div>
      </div>

      <div className="section-divider" />

      {/* Our Services */}
      <div className="relative bg-[#0d0f14] overflow-hidden">
        <div className="absolute inset-0 bg-led-grid opacity-35 pointer-events-none" />
        <div className="glow-orb-cyan w-[500px] h-[500px] top-[-60px] right-[-80px] opacity-50" />
        <div className="glow-orb-warm w-[400px] h-[400px] bottom-[-60px] left-[-60px] opacity-40" />
        <div className="relative z-10">
          <Ourservice />
        </div>
      </div>

      <div className="section-divider" />

      {/* Our Mission */}
      <div className="relative bg-[#08090d] overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-25 pointer-events-none" />
        <div className="glow-orb-cyan w-[450px] h-[350px] bottom-0 left-1/2 -translate-x-1/2 opacity-40" />
        <div className="relative z-10 container mx-auto px-4 py-10">
          <Ourmission />
        </div>
      </div>
    </main>
  );
}
