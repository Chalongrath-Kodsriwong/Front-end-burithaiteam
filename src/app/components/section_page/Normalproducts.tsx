"use client";
import "flowbite";
import { useEffect, useState } from "react";
import Link from "next/link";

import { Product } from "@/types/Normalproducts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const ITEMS_PER_PAGE = 20;

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

        const productData = Array.isArray(json.data) ? json.data : [];

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

        const seen = new Set<number>();
        const unique: Product[] = mapped.filter((item) => {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });

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
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 rounded-xl shadow-xl">
      <div className="flex flex-col item-center justify-center text-center p-2 sm:p-4 mb-4">
      <h2 className="text-lg sm:text-2xl font-bold">
        <div>My Product</div>
      </h2>
      <h2 className="text-sm sm:text-[20px] font-bold mt-0.5">(สินค้าทั้งหมดของเรา)</h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mx-1 sm:mx-4 md:mx-12 mt-4">
        {visibleItems.map((product) => (
          <Link
            key={product.id}
            href={`/detail_product/${product.id}`}
            className="h-full"
          >
            <div
              className="h-full w-full p-1.5 sm:p-2 border border-gray-300 rounded-md bg-white cursor-pointer flex flex-col
              hover:border-yellow-500
              hover:shadow-[0_0_4px_rgba(212,175,55,0.5),0_0_8px_rgba(184,134,11,0.4)]
              transition-all duration-300"
            >
              <div className="w-full h-24 sm:h-32 md:h-[200px] rounded-md overflow-hidden bg-gray-100">
                <img
                  src={product.avatar}
                  alt={product.name}
                  onError={(e) =>
                    (e.currentTarget.src = "/image/logo_white.jpeg")
                  }
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-1 flex-1 flex flex-col">
                <h3 className="font-semibold text-[10px] sm:text-xs md:text-base leading-snug line-clamp-3 min-h-[2.7rem] sm:min-h-[3rem] md:min-h-[3.5rem]">
                  {product.name}
                </h3>

                <div className="mt-1 sm:mt-2">
                  <p className="font-bold text-[10px] sm:text-xs md:text-base">฿ {product.price}</p>
                </div>

                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 mt-1 sm:mt-2 break-words">
                  Brand: {product.brand}
                </p>
              </div>
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
