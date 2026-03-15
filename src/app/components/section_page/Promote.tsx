"use client";

import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useEffect, useMemo, useRef, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type BannerItem = {
  banner_id: number;
  url_banner: string;
  order_banner: number;
  is_active: boolean;
};

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

        // ✅ ใช้ /api/banners ตามของจริงใน Postman
        const res = await fetch(`${API_URL}/api/banners?page=1&limit=20`, {
          method: "GET",
          cache: "no-store", // กัน cache ระหว่าง dev
        });

        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          console.error("Fetch banners failed:", res.status, json);
          if (alive) setImages(fallbackImages);
          return;
        }

        // ✅ ตาม response: { data: { page, limit, total, data: [...] } }
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
    <div className="w-full flex flex-col items-center">
      <div className="relative w-full max-w-[90%] lg:max-w-full mx-auto">
        <button
          type="button"
          onClick={() => carouselRef.current?.decrement()}
          className="absolute left-2 2xl:-left-10 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 2xl:p-3 rounded-full z-10 w-10 h-10 flex items-center justify-center"
          aria-label="Previous slide"
        >
          ❮
        </button>

        <button
          type="button"
          onClick={() => carouselRef.current?.increment()}
          className="absolute right-2 2xl:-right-10 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 2xl:p-3 rounded-full z-10 w-10 h-10 flex items-center justify-center"
          aria-label="Next slide"
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
          interval={2000}
          transitionTime={700}
          swipeable
          emulateTouch
          stopOnHover
        >
          {slideImages.map((img, index) => (
            <div key={index}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={img.alt}
                className="object-cover w-full max-h-[60vh] lg:max-h-[55vh] rounded-lg"
              />
            </div>
          ))}
        </Carousel>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-lg">
            <div className="bg-white/90 px-4 py-2 rounded-md text-sm text-gray-700">
              กำลังโหลดแบนเนอร์...
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        {slideImages.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setSelectedIndex(index)}
            className={`w-3 h-3 rounded-full ${
              selectedIndex === index ? "bg-blue-600" : "bg-gray-300"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}