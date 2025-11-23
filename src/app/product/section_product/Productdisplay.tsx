"use client";
import "flowbite";
import { useEffect, useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const ITEMS_PER_PAGE = 20; // แสดง 20 ชิ้นต่อหน้า

interface Product {
  id: number;
  name: string;
  price: string; // string เพื่อรองรับ "300 - 310"
  brand: string;
  avatar: string;
}

export default function Productdisplay() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);

    async function fetchProducts() {
      try {
        const res = await fetch(`${API_URL}/api/products`, {
          cache: "no-store",
        });
        const json = await res.json();
        console.log("Fetched products (Productdisplay):", json);

        const productData = Array.isArray(json.data) ? json.data : [];

        // ⭐ map ข้อมูลให้ตรงกับ UI (ใช้ logic เดียวกับ Newproducts)
        const mapped: Product[] = productData.map((p: any) => {
          let price = "0";

          if (Array.isArray(p.prices) && p.prices.length > 0) {
            const prices = p.prices
              .map((x: any) => Number(x))
              .filter((n: number) => !isNaN(n));

            if (prices.length === 1) {
              price = prices[0].toLocaleString();
            } else if (prices.length > 1) {
              const min = Math.min(...prices);
              const max = Math.max(...prices);
              price = `${min.toLocaleString()} - ${max.toLocaleString()}`;
            }
          }

          return {
            id: p.id_products ?? p.id ?? 0,
            name: p.name ?? "No name",
            price,
            brand: p.brand ?? "-",
            avatar:
              p.avatar ??
              (p.images && p.images.length > 0
                ? p.images[0].url
                : "/image/logo_white.jpeg"),
          };
        });

        // ⭐ ลบซ้ำแบบใช้ Set (ไม่ใช้ findIndex แล้ว)
        const seen = new Set<number>();
        const unique: Product[] = mapped.filter((item) => {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });

        // ⭐ เอาเฉพาะ 100 ชิ้นแรก
        const trimmed = unique.slice(0, 100);

        setProducts(trimmed);
      } catch (err) {
        console.error("Error fetching products (Productdisplay):", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

  const handleNextPage = () => {
    setPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  const handlePrevPage = () => {
    setPage((prev) => Math.max(prev - 1, 0));
  };

  const visibleItems = products.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE
  );

  if (loading) return <div className="p-4 text-center">กำลังโหลดสินค้า...</div>;
  if (!isClient || products.length === 0)
    return <div className="p-4 text-center">ไม่มีข้อมูลสินค้า</div>;

  return (
    <div className="container mx-auto px-4 py-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold flex items-center justify-center gap-2 mb-4">
        <div>Products</div>
      </h2>

      {/* Grid สินค้าแบบตาราง */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mx-12 mt-4">
        {visibleItems.map((product) => (
          <Link key={product.id} href={`/detail_product/${product.id}`}>
            <div className="border p-4 rounded-lg bg-white shadow-sm cursor-pointer hover:shadow-md transition">
              <img
                src={product.avatar}
                alt={product.name}
                onError={(e) =>
                  (e.currentTarget.src = "/image/logo_white.jpeg")
                }
                className="w-full h-32 object-cover mb-2 rounded"
              />
              <h3 className="text-lg font-semibold line-clamp-2">
                {product.name}
              </h3>
              <p className="text-gray-700 font-medium">฿ {product.price}</p>
              <p className="text-sm text-gray-500">Brand: {product.brand}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={handlePrevPage}
            disabled={page === 0}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 disabled:opacity-50 rounded"
          >
            ย้อนกลับ
          </button>

          <span className="font-semibold">
            Page {page + 1} / {totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={page === totalPages - 1}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 disabled:opacity-50 rounded"
          >
            ถัดไป
          </button>
        </div>
      )}
    </div>
  );
}
