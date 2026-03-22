"use client";

import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useEffect, useMemo, useRef, useState } from "react";

import {BannerItem} from "@/types/Banner"

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Promote() {
  const carouselRef = useRef<any>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [images, setImages] = useState<{ src: string; alt: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const fallbackImages = useMemo(
    () => [
      { src: "/image/logo_black.jpg", alt: "Fallback 1" },
      { src: "/image/logo_white.jpeg", alt: "Fallback 2" },
    ],
    []
  );

  useEffect(() => {
    let alive = true;

    async function fetchBanners() {
      try {
        setLoading(true);

        const res = await fetch(`${API_URL}/api/banners?page=1&limit=20`, {
          method: "GET",
          cache: "no-store",
        });

        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          console.error("Fetch banners failed:", res.status, json);
          if (alive) setImages(fallbackImages);
          return;
        }

        const rows: BannerItem[] = json?.data?.data || [];

        const sorted = [...rows].sort(
          (a, b) => (a.order_banner ?? 0) - (b.order_banner ?? 0)
        );

        const mapped = sorted
          .filter((b) => !!b.url_banner)
          .map((b) => ({
            src: b.url_banner,
            alt: `Banner ${b.banner_id}`,
          }));

        if (alive) {
          setImages(mapped.length > 0 ? mapped : fallbackImages);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error("fetchBanners error:", err);
        if (alive) setImages(fallbackImages);
      } finally {
        if (alive) setLoading(false);
      }
    }

    fetchBanners();
    return () => {
      alive = false;
    };
  }, [fallbackImages]);

  const slideImages = images.length > 0 ? images : fallbackImages;

  return (
    <div className="w-full">
      <div className="relative w-full flex flex-col lg:flex-row overflow-hidden rounded-[40px]">
        {/* 🔥 LEFT SIDE */}
        <div className="lg:w-1/2 w-full bg-black text-yellow-400 p-8 lg:p-12 flex flex-col justify-center relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
            ยินดีต้อนรับเข้าสู่เว็บไซต์ของเรา
          </h1>

          <p className="text-sm lg:text-base text-yellow-300 leading-relaxed mb-6">
            บริษัทของเราเป็นผู้เชียวชาญด้านจอ LED Module มีประสบการณ์มากกว่า 20
            ปี และระบบควบคุมคุณภาพสูงเช่น จอ LED Modules, Processor, Sender
            Card, Receiver Cart และคอมพิวเตอร์สำหรับควบคุมภาพพร้อมบริการออกแบบ
            วางแผน และติดตั้งระบบจอ LED
            โดยทีมงานมืออาชีพที่มีความเชี่ยวชาญในด้านนี้
            เรามุ่งมั่นที่จะให้บริการที่ดีที่สุดและผลิตภัณฑ์คุณภาพสูงเพื่อความพึงพอใจของลูกค้าทุกท่าน
          </p>

          <div className="flex gap-4">
            <button className="bg-yellow-400 text-black px-6 py-2 rounded-full font-semibold hover:bg-yellow-300 transition">
              Get Start →
            </button>
            <button className="bg-red-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-red-500 transition">
              Contact Us →
            </button>
          </div>

          {/* 🔥 Gold Glow Background */}
          <div
            className="hidden lg:block absolute top-0 right-0 w-full h-full pointer-events-none 
            bg-[radial-gradient(circle_at_right,_rgba(212,175,55,0.35),_transparent_50%)]"
          ></div>
        </div>

        {/* 🔥 RIGHT SIDE (SLIDER) */}
        <div className="lg:w-1/2 w-full relative">
          {/* arrows */}
          <button
            type="button"
            onClick={() => carouselRef.current?.decrement()}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-yellow-500 p-2 rounded-full z-20 w-10 h-10 hover:text-[rgb(255,215,0)]
      hover:[text-shadow:0_0_6px_rgb(255,215,0),0_0_12px_rgb(255,215,0),0_0_20px_rgb(212,175,55)] transition-colors duration-300 flex items-center justify-center"
          >
            ❮
          </button>

          <button
            type="button"
            onClick={() => carouselRef.current?.increment()}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-yellow-500 p-2 rounded-full z-20 w-10 h-10 hover:text-[rgb(255,215,0)]
      hover:[text-shadow:0_0_6px_rgb(255,215,0),0_0_12px_rgb(255,215,0),0_0_20px_rgb(212,175,55)] transition-colors duration-300 flex items-center justify-center"
          >
            ❯
          </button>

          <Carousel
            ref={carouselRef}
            selectedItem={selectedIndex}
            onChange={(index) => setSelectedIndex(index)}
            showThumbs={false}
            showStatus={false}
            showIndicators={false}
            showArrows={false}
            autoPlay={slideImages.length > 1}
            infiniteLoop={slideImages.length > 1}
            interval={3000}
            transitionTime={800}
            animationHandler="slide"
            dynamicHeight={false}
            swipeScrollTolerance={5}
            swipeable
            emulateTouch
            stopOnHover
          >
            {slideImages.map((img, index) => (
              <div key={index}>
                <img
                  src={img.src}
                  alt={img.alt}
                  className="object-cover w-full h-[300px] lg:h-[500px]"
                />
              </div>
            ))}
          </Carousel>

          {/* 🔥 DOT INDICATORS (อยู่ภายในภาพ) */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
            {slideImages.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  selectedIndex === index
                    ? "bg-white shadow-lg shadow-white/70 scale-110"
                    : "bg-white/40 hover:bg-white/80"
                }`}
              />
            ))}
          </div>

          {/* loading */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
              <div className="bg-white/90 px-4 py-2 rounded-md text-sm text-gray-700">
                กำลังโหลดแบนเนอร์...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
