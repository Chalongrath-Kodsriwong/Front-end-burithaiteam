"use client";
import "flowbite";
import { useEffect, useState } from "react";

const Mission_list = [
  { name: "งานติดตั้งภายในอาคาร", img: ["/image/logo_black.jpg", "/image/logo_white.jpeg"] },
  { name1: "งานติดตั้งภายนอก", img1: [ "/image/logo_white.jpeg","/image/logo_black.jpg"] },
  {
    name2: "งานเช่าจอสำหรับจัดอีเวนต์",
    img2: ["/image/logo_black.jpg", "/image/logo_white.jpeg"],
  },
  {
    name3: "งานระบบน้ำ",
    img3: ["/image/logo_white.jpeg", "/image/logo_black.jpg"],
  },
];

// ---- helper ทำให้คีย์ใช้ร่วมกันได้ ----
const getName = (b: any) =>
  b.name ?? b.name1 ?? b.name2 ?? b.name3 ?? "Unknown";
const getImgs = (b: any): string[] => b.img ?? b.img1 ?? b.img2 ?? b.img3 ?? [];
const getImgAt = (b: any, i: number) => {
  const imgs = getImgs(b);
  if (!imgs.length) return "/image/placeholder.png";
  return imgs[i % imgs.length];
};

export default function Ourmission() {
  const [isClient, setIsClient] = useState(false);

  // เก็บ index ภาพของแต่ละรายการ (ตัวแปรเดียวกัน)
  const [imageIndexes, setImageIndexes] = useState(
    Array(Mission_list.length).fill(0)
  );

  useEffect(() => setIsClient(true), []);

  // สลับภาพทุก 5 วิ แบบอิงจำนวนรูปของแต่ละรายการ
  useEffect(() => {
    if (!isClient) return;
    const interval = setInterval(() => {
      setImageIndexes((prev) =>
        prev.map((index, i) => {
          const len = getImgs(Mission_list[i]).length || 1;
          return (index + 1) % len;
        })
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [isClient]);

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8 py-6 my-3 bg-gray-100 rounded-lg">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6">
        Our Mission
      </h1>

      {isClient && (
        <div className="flex flex-col gap-6 sm:gap-8">
          {/* งานติดตั้งภายในอาคาร (รูปซ้าย ข้อความขวา บนจอใหญ่) */}
          <div className="flex flex-col md:flex-row items-center md:items-stretch p-4 sm:p-6 md:p-8 border rounded-2xl bg-white shadow-md w-full gap-4 sm:gap-6">
            <img
              className="w-full md:w-1/2 h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 object-cover rounded-[10px] transition-all duration-700 ease-in-out"
              src={getImgAt(Mission_list[0], imageIndexes[0])}
              alt={getName(Mission_list[0])}
              loading="lazy"
              decoding="async"
            />
            <div className="w-full md:w-1/2 flex items-center justify-center md:justify-center px-2 sm:px-4 md:px-10 lg:px-16">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-center">
                {getName(Mission_list[0])}
              </h2>
            </div>
          </div>

          {/* งานติดตั้งภายนอก (สลับด้าน: ข้อความซ้าย รูปขวา บนจอใหญ่) */}
          <div className="flex flex-col md:flex-row-reverse items-center md:items-stretch p-4 sm:p-6 md:p-8 border rounded-2xl bg-white shadow-md w-full gap-4 sm:gap-6">
            <img
              className="w-full md:w-1/2 h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 object-cover rounded-[10px] transition-all duration-700 ease-in-out"
              src={getImgAt(Mission_list[1], imageIndexes[1])}
              alt={getName(Mission_list[1])}
              loading="lazy"
              decoding="async"
            />
            <div className="w-full md:w-1/2 flex items-center justify-center md:justify-center px-2 sm:px-4 md:px-10 lg:px-16">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-center">
                {getName(Mission_list[1])}
              </h2>
            </div>
          </div>

          {/* งานเช่าจอสำหรับจัดอีเวนต์ (รูปซ้าย ข้อความขวา) */}
          <div className="flex flex-col md:flex-row items-center md:items-stretch p-4 sm:p-6 md:p-8 border rounded-2xl bg-white shadow-md w-full gap-4 sm:gap-6">
            <img
              className="w-full md:w-1/2 h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 object-cover rounded-[10px] transition-all duration-700 ease-in-out"
              src={getImgAt(Mission_list[2], imageIndexes[2])}
              alt={getName(Mission_list[2])}
              loading="lazy"
              decoding="async"
            />
            <div className="w-full md:w-1/2 flex items-center justify-center md:justify-center px-2 sm:px-4 md:px-10 lg:px-16">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-center">
                {getName(Mission_list[2])}
              </h2>
            </div>
          </div>

          {/* งานระบบน้ำ (สลับด้าน: ข้อความซ้าย รูปขวา) */}
          <div className="flex flex-col md:flex-row-reverse items-center md:items-stretch p-4 sm:p-6 md:p-8 border rounded-2xl bg-white shadow-md w-full gap-4 sm:gap-6">
            <img
              className="w-full md:w-1/2 h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 object-cover rounded-[10px] transition-all duration-700 ease-in-out"
              src={getImgAt(Mission_list[3], imageIndexes[3])}
              alt={getName(Mission_list[3])}
              loading="lazy"
              decoding="async"
            />
            <div className="w-full md:w-1/2 flex items-center justify-center md:justify-center px-2 sm:px-4 md:px-10 lg:px-16">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-center">
                {getName(Mission_list[3])}
              </h2>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
