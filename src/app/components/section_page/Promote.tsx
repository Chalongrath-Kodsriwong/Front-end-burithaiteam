"use client";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useRef, useState } from "react";

export default function Promote() {
  const carouselRef = useRef<any>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const images = [
    { src: "/image/logo_black.jpg", alt: "Logo Black" },
    { src: "/image/logo_white.jpeg", alt: "Logo White" },
  ];

  return (
    <div className="w-full flex flex-col items-center">
      {/* Carousel & Arrows */}
      <div className="relative w-full max-w-[90%] lg:max-w-full mx-auto">
  {/* ปุ่ม Prev */}
  <button
    onClick={() => carouselRef.current?.decrement()}
    className="absolute left-0 lg:-left-10 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 lg:p-3 rounded-full z-10"
  >
    ❮
  </button>

  {/* ปุ่ม Next */}
  <button
    onClick={() => carouselRef.current?.increment()}
    className="absolute right-0 lg:-right-10 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 lg:p-3 rounded-full z-10"
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
    autoPlay
    infiniteLoop
    interval={4000}
    transitionTime={700}
  >
    {images.map((img, index) => (
      <div key={index}>
        <img
          src={img.src}
          alt={img.alt}
          className="object-cover w-full max-h-[60vh] lg:max-h-[55vh] rounded-lg"
        />
      </div>
    ))}
  </Carousel>
</div>


      {/* External Indicators */}
      <div className="mt-4 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={`w-3 h-3 rounded-full ${
              selectedIndex === index ? "bg-blue-600" : "bg-gray-300"
            }`}
          ></button>
        ))}
      </div>
    </div>
  );
}
