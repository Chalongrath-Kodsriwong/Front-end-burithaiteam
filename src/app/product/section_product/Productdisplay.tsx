"use client";
import "flowbite";
import { useEffect, useState } from "react";

export default function Productdisplay() {
  const [isClient, setIsClient] = useState(false);

  // 🔸 Mock data สินค้า 20 ชิ้น
  const products = new Array(20).fill(0).map((_, i) => ({
    id: i + 1,
    name: `สินค้า ${i + 1}`,
    price: (i + 1) * 100,
    brand: "Nova",
    img: i % 2 === 0 ? "/image/logo_white.jpeg" : "/image/logo_black.jpg",
  }));

  const tabs = ["Tab 1", "Tab 2", "Tab 3", "Tab 4", "Tab 5"];
  const [activeIndex, setActiveIndex] = useState(0); // เก็บ tab ที่ active

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold flex items-center justify-center gap-2 ">
        {/* <div className="">Products</div> */}
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mx-12 mt-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="border p-4 rounded-lg bg-white shadow-sm"
          >
            <img
              src={product.img}
              alt={product.name}
              className="w-full h-32 object-cover mb-2"
            />
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <p className="text-gray-600">ราคา: {product.price} บาท</p>
          </div>
        ))}
      </div>
      <div>
      <ul className="flex flex-wrap text-sm font-medium text-center justify-center text-gray-500 dark:text-gray-400 my-4">
        {tabs.map((tab, index) => (
          <li className="me-2" key={index}>
            <a
              href="#"
              className={`inline-block px-4 py-3 rounded-lg ${
                activeIndex === index
                  ? "text-white bg-blue-600 active"
                  : "hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white"
              }`}
              aria-current={activeIndex === index ? "page" : undefined}
              onClick={(e) => {
                e.preventDefault();
                setActiveIndex(index);
              }}
            >
              {tab}
            </a>
          </li>
        ))}
      </ul>
    </div>
    </div>
  );
}
