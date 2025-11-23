"use client";
import "flowbite";
import { useEffect, useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const ITEMS_PER_PAGE = 4;

interface Product {
  id: number;
  name: string;
  price: string; // ✅ ใช้ string เพราะอาจเป็น "300 - 310"
  brand: string;
  avatar: string;
}

export default function Mostsell() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
    async function fetchProducts() {
      try {
        const res = await fetch(`${API_URL}/api/products`, { cache: "no-store" });
        const json = await res.json();
        console.log("Fetched products (Mostsell):", json);

        const productData = Array.isArray(json.data) ? json.data : [];

        const mapped = productData.map((p: any) => {
          // ✅ แปลง prices array → string สำหรับแสดงผล
          let price = "0";
          if (Array.isArray(p.prices) && p.prices.length > 0) {
            const prices = p.prices.map((x: any) => Number(x)).filter((n:any) => !isNaN(n));
            if (prices.length === 1) {
              price = prices[0].toLocaleString();
            } else {
              const min = Math.min(...prices);
              const max = Math.max(...prices);
              price = `${min.toLocaleString()} - ${max.toLocaleString()}`;
            }
          }

          return {
            id: p.id_products ?? p.id ?? 0,
            name: p.name ?? "No name",
            price,
            brand: p.brand ?? "-", // ✅ ใช้ชื่อแบรนด์จาก p.brand
            avatar:
              p.avatar ??
              (p.images && p.images.length > 0 ? p.images[0].url : "/image/logo_white.jpeg"),
          };
        });

        // ✅ สุ่มสินค้า “ขายดี” (จำลอง)
        const shuffled = mapped.sort(() => 0.5 - Math.random());
        setProducts(shuffled.slice(0, 20));
      } catch (err) {
        console.error("Error fetching products (Mostsell):", err);
      } finally {
        setLoading(false);
      }

      
    }

    fetchProducts();
  }, []);

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const handleNext = () => setPage((p) => (p + 1) % totalPages);
  const handlePrev = () => setPage((p) => (p - 1 + totalPages) % totalPages);

  const paginatedItems = products.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE
  );

  if (loading) return <div className="p-4 text-center">กำลังโหลดสินค้า...</div>;
  if (!isClient || products.length === 0)
    return <div className="p-4 text-center">ไม่มีข้อมูลสินค้า</div>;

  return (
    <div className="container mx-auto px-4 py-6 bg-gray-100 rounded-lg shadow-md my-6">
      <h2 className="text-2xl font-bold text-center">Most Seller</h2>
      <h2 className="text-xl font-bold text-center mt-2 mb-5">
        (สินค้าที่ขายดีที่สุด)
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
                  onError={(e) => (e.currentTarget.src = "/image/logo_white.jpeg")}
                  className="w-full h-[250px] object-cover rounded"
                />
                <h3 className="font-semibold mt-2">{product.name}</h3>
                <p>฿ {product.price}</p>
                <p className="text-sm text-gray-600">Brand: {product.brand}</p>
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
    </div>
  );
}
