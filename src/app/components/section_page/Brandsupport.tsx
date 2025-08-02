"use client";
import "flowbite";
import { useEffect, useState } from "react";
import { BookmarkIcon } from "@heroicons/react/24/solid";

// For Section Brand Support
// 🔸 Mock data แบรนด์ 6 แบรนด์
const brandList = [
  { name: "Nova", img: "/image/logo_black.jpg" },
  { name: "Samsung", img: "/image/logo_white.jpeg" },
  { name: "LG", img: "/image/logo_black.jpg" },
  { name: "Sony", img: "/image/logo_white.jpeg" },
  { name: "Panasonic", img: "/image/logo_black.jpg" },
  { name: "Sharp", img: "/image/logo_white.jpeg" },
];

export default function BrandSupport () {
    return (
        <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                          <div className="relative w-14 h-14">
                            <BookmarkIcon className="w-20 h-16 text-red-600 rotate-[4.70rad]" />
                            <span className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold ml-4">
                              Brand
                            </span>
                          </div>
                          <p>แบรนด์ที่เราสนับสนุน</p>
                        </h2>
        
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mx-auto mt-4">
                          {brandList.map((brand, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-center p-4 border rounded bg-white"
                            >
                              <img
                                src={brand.img}
                                alt={brand.name}
                                className="w-full h-[50px] object-contain"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
    );
}