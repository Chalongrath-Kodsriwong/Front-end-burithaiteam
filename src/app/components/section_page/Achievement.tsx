"use client";
import "flowbite";
import { useEffect, useState } from "react";

const brandList = [
  { name: "งานเฉลิมพระเกียรตื 70 พรรษา", img: "/image/logo_black.jpg" },
  { name: "งานติดจอ LED บนรถโปรโมท", img: "/image/logo_white.jpeg" },
  { name: "งานยอยศยิ่งฟ้าอยุธยา มรดกโลก", img: "/image/logo_black.jpg" },
  { name: "งานติดตั้งร้าน Hastach รังสิต", img: "/image/logo_white.jpeg" },
  // { name: "Panasonic", img: "/image/logo_black.jpg" },
  // { name: "Sharp", img: "/image/logo_white.jpeg" },
];

export default function Achievement() {
  return (
    <div className="container mx-auto px-4 py-6 bg-gray-100 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-bold flex items-center justify-center gap-2 ">
        <div className="">
            Achievement
        </div>
      </h2>
      <h2 className="text-xl font-bold flex items-center justify-center gap-2">
        <div className="">
          (ผลงานของเรา)
        </div>
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 mx-auto mt-4">
        {brandList.map((brand, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center p-4 border-0 rounded bg-gray-100"
          >
            <img className="rounded-full w-40 h-40" src={brand.img} alt={brand.name} />
            <div className="text-center mt-2">
              <h3 className="text-lg font-semibold">{brand.name}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}