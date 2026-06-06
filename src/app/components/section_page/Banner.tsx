"use client";

import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchWithTimeout } from "@/app/utils/fetchWithTimeout";
import { BannerItem } from "@/types/Banner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const ledCategories = [
  { code: "P3", label: "Indoor", color: "rgba(0,207,255,0.8)" },
  { code: "P4", label: "Outdoor", color: "rgba(212,175,55,0.8)" },
  { code: "P5", label: "Rental", color: "rgba(0,207,255,0.8)" },
  { code: "P6", label: "Fixed", color: "rgba(212,175,55,0.8)" },
];

export default function HeroBanner() {
  const carouselRef = useRef<any>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [images, setImages] = useState<{ src: string; alt: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const fallbackImages = useMemo(
    () => [
      { src: "/image/logo_black.jpg", alt: "BuriThaiTeam" },
      { src: "/image/logo_white.jpeg", alt: "BuriThaiTeam" },
    ],
    []
  );

  useEffect(() => {
    let alive = true;
    async function fetchBanners() {
      try {
        const res = await fetchWithTimeout(`${API_URL}/api/banners?page=1&limit=20`, {
          method: "GET",
          cache: "no-store",
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) { if (alive) setImages(fallbackImages); return; }
        const rows: BannerItem[] = json?.data?.data || [];
        const sorted = [...rows].sort((a, b) => (a.order_banner ?? 0) - (b.order_banner ?? 0));
        const mapped = sorted.filter((b) => !!b.url_banner).map((b) => ({ src: b.url_banner, alt: `Banner ${b.banner_id}` }));
        if (alive) { setImages(mapped.length > 0 ? mapped : fallbackImages); setSelectedIndex(0); }
      } catch { if (alive) setImages(fallbackImages); }
      finally { if (alive) setLoading(false); }
    }
    fetchBanners();
    return () => { alive = false; };
  }, [fallbackImages]);

  const slideImages = images.length > 0 ? images : fallbackImages;

  return (
    <section className="relative w-full overflow-hidden bg-[#08090d]">
      {/* LED grid background */}
      <div className="absolute inset-0 bg-led-grid opacity-35 pointer-events-none" />
      {/* Cyan glow top-left */}
      <div className="absolute -top-24 -left-24 w-[600px] h-[600px] rounded-full pointer-events-none glow-orb-cyan opacity-70" />
      {/* Gold glow bottom-right */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full pointer-events-none"
        style={{ filter: "blur(110px)", background: "rgba(212,175,55,0.06)" }} />

      {/* ── Main flex layout ── */}
      <div className="relative z-10 flex flex-col lg:flex-row min-h-[460px] sm:min-h-[520px] lg:min-h-[620px]">

        {/* LEFT — Text content */}
        <div className="flex flex-col justify-center px-6 sm:px-10 lg:px-16 xl:px-20 py-12 lg:py-0 lg:w-[54%]">

          {/* LED status badge */}
          <div className="inline-flex items-center gap-2 mb-6 self-start">
            <span className="pulse-ring inline-flex items-center gap-1.5 bg-[rgba(0,207,255,0.08)] border border-[rgba(0,207,255,0.35)] text-[#00CFFF] text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00CFFF] animate-pulse" />
              ประสบการณ์กว่า 20 ปี
            </span>
          </div>

          {/* Main headline */}
          <h1 className="text-[2rem] sm:text-[2.6rem] lg:text-[3.2rem] xl:text-[3.6rem] font-black leading-[1.05] text-[#E8F0F8] mb-3">
            ผู้เชี่ยวชาญ
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#00CFFF] via-[#D4AF37] to-[#00CFFF]">
              ระบบจอ LED
            </span>
            <span className="block text-[1.6rem] sm:text-[2rem] lg:text-[2.4rem] font-bold text-[#7A9AB8] mt-1">
              ครบวงจร ไว้วางใจได้
            </span>
          </h1>

          {/* Sub description */}
          <p className="text-sm sm:text-[15px] text-[#5A7A98] leading-relaxed max-w-[420px] mb-2">
            จำหน่าย ออกแบบ และติดตั้งจอ LED Module คุณภาพสูงทุกรูปแบบ
            พร้อมทีมช่างผู้เชี่ยวชาญและบริการหลังการขายครบวงจร
          </p>

          {/* Trust micro-line */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {["✓ รับประกันงานติดตั้ง", "✓ บริการหลังการขาย", "✓ ให้คำปรึกษาฟรี"].map((t) => (
              <span key={t} className="text-[11px] text-[#00CFFF]/70 font-medium">{t}</span>
            ))}
          </div>

          {/* LED Pixel Pitch Categories */}
          <div className="flex flex-wrap gap-2 mb-7">
            {ledCategories.map((cat) => (
              <Link key={cat.code} href="/product">
                <span className="led-badge">
                  <span className="led-badge-dot" />
                  <span className="font-black">{cat.code}</span>
                  <span className="text-[#7A9AB8] font-normal normal-case tracking-normal text-[0.6rem]">{cat.label}</span>
                </span>
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3 mb-4">
            <Link href="/product">
              <span className="btn-gold text-sm">ดูสินค้าทั้งหมด</span>
            </Link>
            <Link href="/contact">
              <span className="btn-outline-gold text-sm">ติดต่อเรา</span>
            </Link>
          </div>

          {/* Design CTA — full width */}
          <div className="mb-10">
            <Link href="/design">
              <span className="flex items-center justify-center gap-2 w-full max-w-[270px]
                px-6 py-3 rounded-full text-sm font-bold tracking-wide
                bg-[rgba(0,207,255,0.08)] border border-[rgba(0,207,255,0.45)] text-[#00CFFF]
                hover:bg-[rgba(0,207,255,0.15)] hover:border-[rgba(0,207,255,0.9)]
                hover:shadow-[0_0_18px_rgba(0,207,255,0.25)]
                transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.591 2.25l4.159 1.56M14.25 3.104c.251.023.501.05.75.082M19.5 14.25v-2.636a5.5 5.5 0 00-1.025-3.178M19.5 14.25L5 14.5m14.5-.25l-4.159-1.56" />
                </svg>
                จำลองการออกแบบจอ LED
              </span>
            </Link>
          </div>
        </div>

        {/* RIGHT — LED Screen Frame Carousel */}
        <div className="relative lg:w-[46%] min-h-[260px] sm:min-h-[340px] lg:min-h-0 flex items-center justify-center p-4 lg:p-6 lg:pr-8">

          {/* LED Screen Frame */}
          <div className="led-screen-frame w-full h-[260px] sm:h-[380px] lg:h-[540px]">
            {/* Corner indicators */}
            <div className="led-corner-tl" />
            <div className="led-corner-tr" />
            <div className="led-corner-bl" />
            <div className="led-corner-br" />

            {/* Top bezel bar */}
            <div className="absolute top-0 left-0 right-0 h-7 bg-[rgba(6,8,14,0.95)] z-10 flex items-center px-3 gap-2 border-b border-[rgba(0,207,255,0.12)]">
              <span className="w-2 h-2 rounded-full bg-[#00CFFF] shadow-[0_0_6px_rgba(0,207,255,0.9)] animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_6px_rgba(212,175,55,0.7)]" />
              <span className="w-2 h-2 rounded-full bg-[rgba(0,207,255,0.2)]" />
              <span className="ml-auto text-[9px] font-mono text-[#00CFFF]/50 tracking-widest uppercase">LIVE · HD</span>
            </div>

            {/* Left fade gradient */}
            <div className="hidden lg:block absolute left-0 top-7 bottom-0 w-16 z-10 pointer-events-none"
              style={{ background: "linear-gradient(to right, rgba(8,9,13,0.8), transparent)" }} />

            {slideImages.length > 1 && (
              <>
                <button type="button" onClick={() => carouselRef.current?.decrement()}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8
                    flex items-center justify-center rounded-sm
                    bg-[rgba(6,8,14,0.8)] backdrop-blur-md border border-[rgba(0,207,255,0.3)]
                    text-[#00CFFF] hover:border-[rgba(0,207,255,0.8)] hover:bg-[rgba(6,8,14,0.95)]
                    hover:shadow-[0_0_12px_rgba(0,207,255,0.3)]
                    transition-all duration-300 text-base">
                  ‹
                </button>
                <button type="button" onClick={() => carouselRef.current?.increment()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8
                    flex items-center justify-center rounded-sm
                    bg-[rgba(6,8,14,0.8)] backdrop-blur-md border border-[rgba(0,207,255,0.3)]
                    text-[#00CFFF] hover:border-[rgba(0,207,255,0.8)] hover:bg-[rgba(6,8,14,0.95)]
                    hover:shadow-[0_0_12px_rgba(0,207,255,0.3)]
                    transition-all duration-300 text-base">
                  ›
                </button>
              </>
            )}

            <div className="mt-7 h-[calc(100%-28px)] overflow-hidden">
              <Carousel
                ref={carouselRef}
                selectedItem={selectedIndex}
                onChange={(i) => setSelectedIndex(i)}
                showThumbs={false} showStatus={false} showIndicators={false} showArrows={false}
                autoPlay={slideImages.length > 1} infiniteLoop={slideImages.length > 1}
                interval={4500} transitionTime={750} dynamicHeight={false}
                swipeable emulateTouch stopOnHover
              >
                {slideImages.map((img, i) => (
                  <div key={i} className="relative w-full h-[233px] sm:h-[345px] lg:h-[513px]">
                    <Image src={img.src} alt={img.alt} fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 46vw"
                      priority={i === 0}
                      unoptimized={img.src.startsWith("http")}
                    />
                    <div className="absolute inset-0" style={{
                      background: "linear-gradient(to top, rgba(8,9,13,0.55) 0%, transparent 50%)"
                    }} />
                  </div>
                ))}
              </Carousel>
            </div>

            {/* Dot indicators */}
            {slideImages.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                {slideImages.map((_, i) => (
                  <button key={i} type="button" onClick={() => setSelectedIndex(i)}
                    className={`transition-all duration-300 rounded-full ${
                      selectedIndex === i
                        ? "w-5 h-1.5 bg-[#00CFFF] shadow-[0_0_8px_rgba(0,207,255,0.9)]"
                        : "w-1.5 h-1.5 bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>
            )}

            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-[#00CFFF] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom separator line */}
      <div className="section-divider" />
    </section>
  );
}
