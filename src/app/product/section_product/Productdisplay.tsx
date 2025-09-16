"use client";
import "flowbite";
import { useEffect, useState } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  branch: string;
  avatar: string;
}

export default function Productdisplay() {
  const [isClient, setIsClient] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  // 🔸 จำนวนสินค้าต่อ Tab
  const ITEMS_PER_TAB = 20;

  const TOTAL_PRODUCTS = 100;

  useEffect(() => {
    setIsClient(true);

    // ดึงข้อมูลจาก API
    const fetchProducts = async () => {
  try {
    const res = await fetch(
      "https://68be95bc9c70953d96eccd35.mockapi.io/api/product/E-commerse"
    );
    const data = await res.json();

    // 👉 วนซ้ำข้อมูลให้ครบ 200 ชิ้น
    const repeatCount = Math.ceil(TOTAL_PRODUCTS / data.length);
    const multiplied = Array.from({ length: repeatCount }, (_, i) =>
      data.map((p: Product, idx: number) => ({
        ...p,
        id: `${p.id}-${i}-${idx}`, // 🔁 ป้องกัน id ซ้ำ
      }))
    ).flat();

    const trimmed = multiplied.slice(0, TOTAL_PRODUCTS); // ✂️ ตัดให้เหลือพอดี
    setProducts(trimmed);
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};


    fetchProducts();
  }, []);

  if (!isClient) return null;

  // 🔸 จำนวนแท็บทั้งหมด
  const totalTabs = Math.ceil(products.length / ITEMS_PER_TAB);

  // 🔸 แสดงชื่อแท็บ
  const tabs = Array.from({ length: totalTabs }, (_, i) => `Tab ${i + 1}`);

  // 🔸 สินค้าเฉพาะใน tab ปัจจุบัน
  const visibleProducts = products.slice(
    activeIndex * ITEMS_PER_TAB,
    (activeIndex + 1) * ITEMS_PER_TAB
  );

  return (
    <div className="container mx-auto px-4 py-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold flex items-center justify-center gap-2 ">
        {/* <div className="">Products</div> */}
      </h2>
      
      {/* Grid สินค้า */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mx-12 mt-4">
        {visibleProducts.map((product) => (
          <div
            key={product.id}
            className="border p-4 rounded-lg bg-white shadow-sm"
          >
            <img
              src={product.avatar}
              alt={product.name}
              className="w-full h-32 object-cover mb-2 rounded"
              onError={(e) =>
                (e.currentTarget.src = "/image/logo_white.jpeg")
              } // fallback ถ้ารูปเสีย
            />
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <p className="text-gray-600">ราคา: {product.price} บาท</p>
            <p className="text-sm text-gray-500">Branch: {product.branch}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
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
  );
}
