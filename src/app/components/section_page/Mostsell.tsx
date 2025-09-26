"use client";
import "flowbite";
import { useEffect, useState } from "react";
import { BookmarkIcon } from "@heroicons/react/24/solid";
import Link from "next/link"; // ✅ เพิ่ม

// 🔸 กำหนดจำนวนสินค้าต่อหน้า
const ITEMS_PER_PAGE = 4;

interface Product {
  id: string;
  name: string;
  price: number;
  branch: string;
  avatar: string;
}

export default function Newproducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // 🔹 ดึงข้อมูลสินค้าแบบสุ่ม
  useEffect(() => {
    setIsClient(true);
    async function fetchProducts() {
      try {
        const res = await fetch("http://localhost:3000/products");
        const data = await res.json();

        // สุ่มเรียงลำดับ (shuffle)
        const shuffled = data.sort(() => 0.5 - Math.random());

        // เลือก N รายการ (สมมุติ 8)
        const selected = shuffled.slice(0, 20);
        setProducts(selected);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    }

    fetchProducts();
  }, []);

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

  const handleNext = () => {
    setPage((prev) => (prev + 1) % totalPages);
  };

  const handlePrev = () => {
    setPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const paginatedItems = products.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE
  );

  if (!isClient || products.length === 0) {
    return <div className="p-4">กำลังโหลดสินค้า...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6 bg-gray-100 rounded-lg shadow-md my-6">
      <h2 className="text-2xl font-bold flex items-center justify-center gap-2 ">
        <div className="">Most Seller</div>
      </h2>
      <h2 className="text-xl font-bold flex items-center justify-center gap-2 mt-2 mb-5">
        <div className="">(สินค้าที่ขายดีที่สุด)</div>
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
            <Link key={product.id} href={`/detail_product/${product.id}`}>
              <div className="p-4 border rounded bg-white cursor-pointer hover:shadow-lg transition">
                <img
                  src={product.avatar}
                  alt={product.name}
                  onError={(e) =>
                    (e.currentTarget.src = "/image/logo_white.jpeg")
                  }
                  className="w-full h-[250px] object-cover rounded"
                />
                <h3 className="font-semibold mt-2">
                  ฿ {product.price.toLocaleString()}
                </h3>
                <p>{product.name}</p>
                <p className="text-sm text-gray-600">
                  Branch: {product.branch}
                </p>
              </div>
            </Link>
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

      {/* Content for Most Sell Products will go here */}
    </div>
  );
}
