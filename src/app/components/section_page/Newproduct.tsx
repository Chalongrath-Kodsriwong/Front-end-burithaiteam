"use client";
import "flowbite";
import { useEffect, useState } from "react";
import { BookmarkIcon } from "@heroicons/react/24/solid";

// For Section New products
// 🔸 Mock data สินค้า 20 ชิ้น
const products = new Array(20).fill(0).map((_, i) => ({
  id: i + 1,
  name: `สินค้า ${i + 1}`,
  price: (i + 1) * 100,
  brand: "Nova",
  img: i % 2 === 0 ? "/image/logo_white.jpeg" : "/image/logo_black.jpg",
}));

// 🔸 กำหนดจำนวนสินค้าต่อหน้า
const ITEMS_PER_PAGE = 4;

export default function Newproducts () {

    const [isClient, setIsClient] = useState(false);
    
      // 🔸 page = index ของหน้า (0-based), เช่น หน้าแรก = 0
      const [page, setPage] = useState(0);
      const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE); // คำนวณจำนวนหน้าทั้งหมด
    
      // ✅ เพิ่ม: ฟังก์ชันกด Next โดยวนกลับหน้าแรกถ้าถึงหน้าสุดท้าย
      const handleNext = () => {
        setPage((prev) => (prev + 1) % totalPages);
      };
    
      // ✅ เพิ่ม: ฟังก์ชันกด Previous โดยวนกลับหน้าสุดท้ายถ้าอยู่หน้าแรก
      const handlePrev = () => {
        setPage((prev) => (prev - 1 + totalPages) % totalPages);
      };
    
      // 🔸 slice ข้อมูลสินค้าเฉพาะหน้าปัจจุบัน
      const paginatedItems = products.slice(
        page * ITEMS_PER_PAGE,
        (page + 1) * ITEMS_PER_PAGE
      );
        useEffect(() => {
            setIsClient(true);
        }, []);
  return (
    <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <div className="relative w-14 h-14">
                      <BookmarkIcon className="w-20 h-16 text-red-600 rotate-[4.70rad]" />
                      <span className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold ml-4">
                        New
                      </span>
                    </div>
                    <p>สินค้ามาใหม่</p>
                  </h2>
                  <div className="relative">
                    <button
                      onClick={handlePrev}
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-300 hover:bg-gray-400 px-3 py-2 rounded-l"
                    >
                      ‹
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mx-12">
                      {paginatedItems.map((product) => (
                        <div
                          key={product.id}
                          className="p-4 border rounded bg-white"
                        >
                          <img
                            src={product.img}
                            alt={product.name}
                            className="w-full h-[250px] object-cover"
                          />
                          <h3 className="font-semibold mt-2">
                            ฿ {product.price.toLocaleString()}
                          </h3>
                          <p>{product.name}</p>
                          <p className="text-sm text-gray-600">
                            Brand: {product.brand}
                          </p>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleNext}
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-300 hover:bg-gray-400 px-3 py-2 rounded-r"
                    >
                      ›
                    </button>
                  </div>

                  <div className="flex justify-center gap-2 mt-4">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i)}
                        className={`w-3 h-3 rounded-full ${
                          i === page ? "bg-blue-600" : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
  );
}