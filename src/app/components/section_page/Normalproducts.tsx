"use client";
import "flowbite";
import { useEffect, useState } from "react";
import Link from "next/link";

import { Product } from "@/types/Normalproducts";
import { isSellableProduct } from "@/app/utils/productVisibility";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const ITEMS_PER_PAGE = 20;

export default function Productdisplay() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(`${API_URL}/api/products`, {
          cache: "no-store",
        });
        const json = await res.json();

        const productData = Array.isArray(json.data)
          ? json.data.filter(isSellableProduct)
          : [];

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

  if (loading) return <div className="p-4 text-center text-gray-400">กำลังโหลดสินค้า...</div>;
  if (products.length === 0)
    return <div className="p-4 text-center text-gray-400">ไม่มีข้อมูลสินค้า</div>;

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
        <span className="section-eyebrow-led mb-4">Our Products</span>
        <h2 className="section-heading mb-3">สินค้าทั้งหมด</h2>
        <p className="text-sm text-[#5A7A98]">เลือกชมสินค้าจาก LED Module คุณภาพสูงทุกรูปแบบ</p>
        <div className="gold-dot-sep">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00CFFF] shadow-[0_0_8px_rgba(0,207,255,0.9)]" />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mx-1 sm:mx-2 md:mx-6">
        {visibleItems.map((product) => (
          <Link
            key={product.id}
            href={`/detail_product/${product.id}`}
            className="h-full"
          >
            <div className="product-card h-full w-full p-1.5 sm:p-2.5 cursor-pointer flex flex-col">
              <div className="w-full h-24 sm:h-32 md:h-[180px] rounded-sm overflow-hidden bg-[#0a0c10] border border-[rgba(0,207,255,0.06)]">
                <img
                  src={product.avatar}
                  alt={product.name}
                  onError={(e) =>
                    (e.currentTarget.src = "/image/logo_white.jpeg")
                  }
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>

              <div className="p-1 flex-1 flex flex-col mt-1">
                <h3 className="font-semibold text-[10px] sm:text-xs md:text-sm leading-snug line-clamp-3 min-h-[2.5rem] sm:min-h-[2.8rem] text-[#E8F0F8]">
                  {product.name}
                </h3>
                <p className="font-bold text-[10px] sm:text-xs md:text-sm text-[#D4AF37] mt-1">
                  ฿ {product.price}
                </p>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-[#445566] mt-0.5 break-words">
                  {product.brand}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <button
            onClick={handlePrevPage}
            disabled={page === 0}
            className="px-4 py-2 text-sm bg-[#0a0c10] border border-[rgba(0,207,255,0.25)] text-[#00CFFF]
              hover:border-[rgba(0,207,255,0.7)] hover:shadow-[0_0_10px_rgba(0,207,255,0.25)] disabled:opacity-30 disabled:cursor-not-allowed rounded-sm transition-all"
          >
            ย้อนกลับ
          </button>
          <span className="text-sm text-[#5A7A98]">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={page === totalPages - 1}
            className="px-4 py-2 text-sm bg-[#0a0c10] border border-[rgba(0,207,255,0.25)] text-[#00CFFF]
              hover:border-[rgba(0,207,255,0.7)] hover:shadow-[0_0_10px_rgba(0,207,255,0.25)] disabled:opacity-30 disabled:cursor-not-allowed rounded-sm transition-all"
          >
            ถัดไป
          </button>
        </div>
      )}
    </div>
  );
}
