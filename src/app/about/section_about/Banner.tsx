"use client";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useRef, useState, useEffect, useMemo } from "react";

import {BannerItem} from "@/types/Banner"


const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

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
    <div className="w-full flex flex-col items-center">
      {/* Carousel & Arrows */}
      <div className="relative w-full max-w-[90%] lg:max-w-full mx-auto p-5">
        {/* ปุ่ม Prev */}
        <button
          onClick={() => carouselRef.current?.decrement()}
          className="absolute left-2 2xl:-left-10 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/70 text-yellow-500 p-2 rounded-full z-20 w-10 h-10 hover:text-[rgb(255,215,0)]
      hover:[text-shadow:0_0_6px_rgb(255,215,0),0_0_12px_rgb(255,215,0),0_0_20px_rgb(212,175,55)] transition-colors duration-300 flex items-center justify-center"
        >
          ❮
        </button>

        {/* ปุ่ม Next */}
        <button
          onClick={() => carouselRef.current?.increment()}
          className="absolute right-2 2xl:-right-10 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/70 text-yellow-500 p-2 rounded-full z-20 w-10 h-10 hover:text-[rgb(255,215,0)]
      hover:[text-shadow:0_0_6px_rgb(255,215,0),0_0_12px_rgb(255,215,0),0_0_20px_rgb(212,175,55)] transition-colors duration-300 flex items-center justify-center"
        >
          ❯
        </button>

        {/* Carousel */}
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
                  className="object-cover w-full h-[200px] lg:h-[550px]"
                />
              </div>
            ))}
          </Carousel>
      </div>

      {/* External Indicators */}
      <div className=" flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              selectedIndex === index ? "bg-yellow-400 shadow-lg shadow-white/70" : "bg-gray-300 hover:bg-yellow-600"
            }`}
          ></button>
        ))}
      </div>
    </div>
  );
}
