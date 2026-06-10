"use client";
import "flowbite";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { ApiProduct, ProductUI } from "@/types/Mostseller";
import { isSellableProduct } from "@/app/utils/productVisibility";
import PriceTag from "@/app/components/PriceTag";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const ITEMS_PER_PAGE = 4;


export default function Mostsell() {
  const [products, setProducts] = useState<ProductUI[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopSell() {
      try {
        setLoading(true);

        const res = await fetch(`${API_URL}/api/products/topsell`, {
          cache: "no-store",
        });

        const json = await res.json().catch(() => ({}));
        const data: ApiProduct[] = Array.isArray(json?.data)
          ? json.data.filter(isSellableProduct)
          : [];

        const mapped: ProductUI[] = data.map((p) => {
          const rawPrices = (p.prices ?? []).map(Number).filter((n) => Number.isFinite(n) && n > 0);
          const finalPrices = (p.discount?.finalPrices ?? []).map(Number).filter((n) => Number.isFinite(n) && n > 0);

          return {
            id: p.id_products,
            name: p.name ?? "No name",
            brand: p.brand ?? "-",
            avatar:
              p.images && p.images.length > 0
                ? p.images[0].url
                : "/image/logo_white.jpeg",
            priceText: rawPrices.length > 0 ? rawPrices[0].toLocaleString() : "0",
            rawPrices,
            finalPrices,
            preorder: p.preorder ?? null,
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

  if (loading) return <div className="p-4 text-center text-gray-400">กำลังโหลดสินค้า...</div>;
  if (products.length === 0)
    return <div className="p-4 text-center text-gray-400">ไม่มีข้อมูลสินค้า</div>;

  return (
    <div className="pb-6">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
        <span className="section-eyebrow-led mb-4">Best Sellers</span>
        <h2 className="section-heading mb-3">สินค้าขายดี</h2>
        <p className="text-sm text-[#5A7A98]">สินค้าที่ลูกค้าเลือกซื้อมากที่สุด</p>
        <div className="gold-dot-sep">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00CFFF] shadow-[0_0_8px_rgba(0,207,255,0.9)]" />
        </div>
      </div>

      <div className="relative">
        <button
          onClick={handlePrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10
            w-9 h-9 md:w-10 md:h-10 flex items-center justify-center
            rounded-sm bg-[#0a0c10] border border-[rgba(0,207,255,0.25)] text-[#00CFFF]
            hover:border-[rgba(0,207,255,0.7)] hover:shadow-[0_0_12px_rgba(0,207,255,0.3)]
            text-base md:text-xl font-bold transition-all duration-300"
        >
          ‹
        </button>

        <div className="grid grid-cols-2 gap-3 px-10 sm:grid-cols-2 sm:gap-4 sm:px-12 md:grid-cols-4 md:px-12 lg:px-14">
          {paginatedItems.map((product) => (
            <Link
              key={product.id}
              href={`/detail_product/${product.id}`}
              className="h-full"
            >
              <div className="product-card w-full h-full p-2.5 cursor-pointer flex flex-col relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <div className="relative w-full aspect-square rounded-sm overflow-hidden bg-[#0a0c10] border border-[rgba(0,207,255,0.06)]">
                  <img
                    src={product.avatar}
                    alt={product.name}
                    onError={(e) =>
                      (e.currentTarget.src = "/image/logo_white.jpeg")
                    }
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  {/* Hot badge */}
                  <span className="absolute top-2 left-2 led-badge text-[9px] px-1.5 py-0.5">
                    <span className="led-badge-dot" />Hot
                  </span>
                </div>

                <div className="p-1.5 flex-1 flex flex-col mt-1">
                  <h3 className="font-semibold text-sm md:text-base leading-snug line-clamp-2 min-h-[2.5rem] md:min-h-0 text-[#E8F0F8]">
                    {product.name}
                  </h3>

                  <PriceTag
                    prices={product.rawPrices}
                    finalPrices={product.finalPrices}
                    preorder={product.preorder}
                    size="lg"
                  />

                  <p className="text-[10px] sm:text-xs text-[#445566] mt-1 break-words">
                    {product.brand}
                  </p>
                  <p className="text-[10px] sm:text-xs text-[#2A3A4A] mt-0.5">
                    ขายไปแล้ว {product.soldQty?.toLocaleString() ?? "0"} ชิ้น
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10
            w-9 h-9 md:w-10 md:h-10 flex items-center justify-center
            rounded-sm bg-[#0a0c10] border border-[rgba(0,207,255,0.25)] text-[#00CFFF]
            hover:border-[rgba(0,207,255,0.7)] hover:shadow-[0_0_12px_rgba(0,207,255,0.3)]
            text-base md:text-xl font-bold transition-all duration-300"
        >
          ›
        </button>
      </div>

      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            className={`transition-all duration-300 rounded-full ${
              i === page
                ? "w-6 h-2.5 bg-[#00CFFF] shadow-[0_0_8px_rgba(0,207,255,0.7)]"
                : "w-2.5 h-2.5 bg-[#1a2a3a] hover:bg-[#2a3a4a]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
