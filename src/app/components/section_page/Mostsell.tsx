"use client";
import "flowbite";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { ApiProduct, ProductUI } from "@/types/Mostseller";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://158.173.159.107";
const ITEMS_PER_PAGE = 4;

function formatPriceRange(prices?: number[]) {
  if (!Array.isArray(prices) || prices.length === 0) return "0";
  const nums = prices.map((x) => Number(x)).filter((n) => !isNaN(n));
  if (nums.length === 0) return "0";
  if (nums.length === 1) return nums[0].toLocaleString();
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  return `${min.toLocaleString()} - ${max.toLocaleString()}`;
}

export default function Mostsell() {
  const [products, setProducts] = useState<ProductUI[]>([]);
  const [page, setPage] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);

    async function fetchTopSell() {
      try {
        setLoading(true);

        const res = await fetch(`${API_URL}/api/products/topsell`, {
          cache: "no-store",
        });

        const json = await res.json().catch(() => ({}));
        const data: ApiProduct[] = Array.isArray(json?.data) ? json.data : [];

        const mapped: ProductUI[] = data.map((p) => {
          const priceText = formatPriceRange(p.prices);
          const finalPriceText = p.discount?.finalPrices
            ? formatPriceRange(p.discount.finalPrices)
            : undefined;

          return {
            id: p.id_products,
            name: p.name ?? "No name",
            brand: p.brand ?? "-",
            avatar:
              p.images && p.images.length > 0
                ? p.images[0].url
                : "/image/logo_white.jpeg",
            priceText,
            finalPriceText,
            soldQty: p.soldQuantity ?? 0,
          };
        });

        setProducts(mapped);
        setPage(0);
      } catch (err) {
        console.error("Error fetching products (Mostsell):", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTopSell();
  }, []);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(products.length / ITEMS_PER_PAGE)),
    [products.length]
  );

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
    <div className="pb-3">
      <div className="flex flex-col p-4 mb-4 justify-center items-center gap-3">
        <h2 className="text-3xl font-bold text-center">
          Most Seller
        </h2>
        <h2 className="text-2xl font-bold text-center">
          (สินค้าที่ขายดีที่สุด)
        </h2>
      </div>

      <div className="relative">
        {/* ปุ่มซ้าย */}
        <button
          onClick={handlePrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 
            w-12 h-12 flex items-center justify-center
            rounded-full bg-gray-300 hover:text-[rgb(255,215,0)]
            hover:[text-shadow:0_0_6px_rgb(255,215,0),0_0_12px_rgb(255,215,0),0_0_20px_rgb(212,175,55)] 
            hover:bg-black/70
            text-xl font-bold shadow-md transition"
        >
          ‹
        </button>

        {/* สินค้า */}
        <div className="grid grid-cols-[repeat(auto-fit,220px)] gap-5 mx-20">
          {paginatedItems.map((product) => (
            <Link key={product.id} href={`/detail_product/${product.id}`}>
              <div
                className="w-[220px] p-2 border border-gray-300 rounded-md bg-white cursor-pointer 
                  hover:border-yellow-500
                  hover:shadow-[0_0_4px_rgba(212,175,55,0.5),0_0_8px_rgba(184,134,11,0.4)]
                  transition-all duration-300"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.avatar}
                  alt={product.name}
                  onError={(e) =>
                    (e.currentTarget.src = "/image/logo_white.jpeg")
                  }
                  className="w-full h-[200px] object-cover rounded-md"
                />

                <div className="p-1">
                  <h3 className="font-semibold text-lg leading-snug line-clamp-2">
                    {product.name}
                  </h3>

                  <div className="mt-2">
                    {product.finalPriceText ? (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 line-through">
                          ฿ {product.priceText}
                        </p>
                        <p className="font-bold text-red-600 text-base">
                          ฿ {product.finalPriceText}
                        </p>
                      </div>
                    ) : (
                      <p className="font-bold text-base">
                        ฿ {product.priceText}
                      </p>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mt-2">
                    Brand: {product.brand}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    ขายไปแล้ว: {product.soldQty?.toLocaleString() ?? "0"} ชิ้น
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ปุ่มขวา */}
        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 
            w-12 h-12 flex items-center justify-center
            rounded-full bg-gray-300 hover:text-[rgb(255,215,0)]
            hover:[text-shadow:0_0_6px_rgb(255,215,0),0_0_12px_rgb(255,215,0),0_0_20px_rgb(212,175,55)] 
            hover:bg-black/70
            text-xl font-bold shadow-md transition"
        >
          ›
        </button>
      </div>

      {/* pagination dot */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            className={`w-3 h-3 rounded-full ${
              i === page ? "bg-yellow-500" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}