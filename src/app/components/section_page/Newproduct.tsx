"use client";
import "flowbite";
import { useEffect, useMemo, useState } from "react";
import { BookmarkIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

import { ApiProduct, ProductUI } from "@/types/Newproduct";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "" ;
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

export default function Newproducts() {
  const [products, setProducts] = useState<ProductUI[]>([]);
  const [page, setPage] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);

    async function fetchNewProducts() {
      try {
        setLoading(true);

        const res = await fetch(`${API_URL}/api/products/newsell`, {
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
          };
        });

        // newsell backend take:2 แต่เผื่อในอนาคตเพิ่ม → รองรับ paginate
        setProducts(mapped);
        setPage(0);
      } catch (err) {
        console.error("Error fetching products (Newproduct):", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchNewProducts();
  }, []);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(products.length / ITEMS_PER_PAGE)),
    [products.length]
  );

  const handleNext = () => setPage((prev) => (prev + 1) % totalPages);
  const handlePrev = () =>
    setPage((prev) => (prev - 1 + totalPages) % totalPages);

  const paginatedItems = products.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE
  );

  if (loading) return <div className="p-4">กำลังโหลดสินค้า...</div>;
  if (!isClient || products.length === 0)
    return <div className="p-4">ไม่มีข้อมูลสินค้า</div>;

  return (
    <div className="pb-3">
      <h2 className="text-2xl font-bold flex items-center mb-4">
        <div className="relative w-28 h-16">
          <BookmarkIcon className="w-full h-full text-red-600 rotate-[4.71rad]" />
          <span className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold -translate-x-1">
            New
          </span>
        </div>
        <p className="-ml-6">สินค้าใหม่</p>
      </h2>

      <div className="relative">
        <button
          onClick={handlePrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 
             w-9 h-9 md:w-12 md:h-12 flex items-center justify-center
            rounded-full bg-gray-300 hover:text-[rgb(255,215,0)]
      hover:[text-shadow:0_0_6px_rgb(255,215,0),0_0_12px_rgb(255,215,0),0_0_20px_rgb(212,175,55)] hover:bg-black/70
             text-base md:text-xl font-bold shadow-md  transition"
        >
          ‹
        </button>

        <div className="grid grid-cols-2 gap-4 px-10 sm:grid-cols-2 sm:gap-5 sm:px-12 md:grid-cols-4 md:px-16 lg:px-20">
          {paginatedItems.map((product) => (
            <Link
              key={product.id}
              href={`/detail_product/${product.id}`}
              className="h-full"
            >
              <div
                className="w-full h-full p-2 border border-gray-300 rounded-md bg-white cursor-pointer flex flex-col
                  hover:border-yellow-500
                  hover:shadow-[0_0_4px_rgba(212,175,55,0.5),0_0_8px_rgba(184,134,11,0.4)]
                  transition-all duration-300"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <div className="relative w-full aspect-square rounded-md overflow-hidden bg-gray-100">
                  <img
                    src={product.avatar}
                    alt={product.name}
                    onError={(e) =>
                      (e.currentTarget.src = "/image/logo_white.jpeg")
                    }
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>

                <div className="p-1 flex-1 flex flex-col">
                  <h3 className="font-semibold text-base md:text-lg leading-snug line-clamp-2 min-h-[2.75rem] md:min-h-0">
                    {product.name}
                  </h3>

                  <div className="mt-1.5 md:mt-1 min-h-[2.6rem] md:min-h-0">
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

                  <p className="text-[11px] sm:text-xs md:text-sm text-gray-600 mt-1 break-words">
                    Brand: {product.brand}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 
             w-9 h-9 md:w-12 md:h-12 flex items-center justify-center
             rounded-full bg-gray-300 hover:text-[rgb(255,215,0)]
      hover:[text-shadow:0_0_6px_rgb(255,215,0),0_0_12px_rgb(255,215,0),0_0_20px_rgb(212,175,55)] hover:bg-black/70
             text-base md:text-xl font-bold shadow-md  transition"
        >
          ›
        </button>
      </div>

      {/* <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            className={`w-3 h-3 rounded-full ${
              i === page ? "bg-gray-400" : "bg-gray-300"
            }`}
          />
        ))}
      </div> */}
    </div>
  );
}
