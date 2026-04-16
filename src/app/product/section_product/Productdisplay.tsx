"use client";
import "flowbite";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Product } from "@/types/Productdisplay"
import { isSellableProduct } from "@/app/utils/productVisibility";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const ITEMS_PER_PAGE = 20; // แสดง 20 ชิ้นต่อหน้า

function toNumberArrayFromUnknown(value: unknown): number[] {
  if (Array.isArray(value)) {
    return value
      .map((x) => Number(x))
      .filter((n) => Number.isFinite(n));
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return [value];
  }

  if (typeof value === "string") {
    const nums = value.match(/\d+(?:\.\d+)?/g);
    if (!nums) return [];
    return nums
      .map((x) => Number(x))
      .filter((n) => Number.isFinite(n));
  }

  return [];
}

// ฟังก์ชันเช็คความใกล้เคียงแบบง่าย ๆ จากตัวอักษรที่ซ้ำกัน
function charOverlapScore(query: string, target: string): number {
  if (!query || !target) return 0;

  const q = query.toLowerCase();
  const t = target.toLowerCase();

  const targetSet = new Set(t.split(""));
  let count = 0;

  for (const ch of q) {
    if (targetSet.has(ch)) count++;
  }

  return count / q.length; // 1 = ซ้ำครบทุกตัว, 0 = ไม่ซ้ำเลย
}

export default function Productdisplay() {
  const [products, setProducts] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("category");
  const keywordSearch = searchParams.get("search");
  const qualityFilter = searchParams.get("quality");
  const selectedQualities = (qualityFilter || "")
    .split(",")
    .map((q) => q.trim().toLowerCase())
    .filter(Boolean);

  const minPrice = Number(searchParams.get("min"));
  const maxPrice = Number(searchParams.get("max"));

  const sortPrice = searchParams.get("sortPrice");
  const sortName = searchParams.get("sortName");

  useEffect(() => {
    setIsClient(true);

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

          // รองรับหลายรูปแบบจาก backend: prices[], price, min/max
          let prices = toNumberArrayFromUnknown(p.prices);
          if (prices.length === 0) prices = toNumberArrayFromUnknown(p.price);

          if (prices.length === 0) {
            const minCandidates = [
              Number(p.min_price),
              Number(p.price_min),
              Number(p.low_price),
            ].filter((n) => Number.isFinite(n));
            const maxCandidates = [
              Number(p.max_price),
              Number(p.price_max),
              Number(p.high_price),
            ].filter((n) => Number.isFinite(n));

            if (minCandidates.length > 0) prices.push(minCandidates[0]);
            if (maxCandidates.length > 0) prices.push(maxCandidates[0]);
          }

          if (prices.length === 1) {
            price = prices[0].toLocaleString();
          } else if (prices.length > 1) {
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            price = `${min.toLocaleString()} - ${max.toLocaleString()}`;
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
            category: p.category?.name || "",
            quality: p.quality ?? "",
            numericPrices: prices, // ⭐⭐ ต้องมีบรรทัดนี้!!
          };
        });

        // ลบซ้ำ
        const seen = new Set<number>();
        const unique = mapped.filter((p) => {
          if (seen.has(p.id)) return false;
          seen.add(p.id);
          return true;
        });

        let filtered = [...unique];

        // ⭐ Filter by Category
        if (categoryFilter && categoryFilter !== "All") {
          filtered = filtered.filter(
            (p) => p.category?.toLowerCase() === categoryFilter.toLowerCase()
          );
        }

        // ⭐ Filter by Quality (รองรับเลือกหลายค่า: new,used)
        if (selectedQualities.length > 0) {
          filtered = filtered.filter((p) => {
            const qualityText = (p.quality ?? "").toLowerCase();
            const hasNew = /มือ\s*1|new/.test(qualityText);
            const hasUsed = /มือ\s*2|used/.test(qualityText);

            return (
              (selectedQualities.includes("new") && hasNew) ||
              (selectedQualities.includes("used") && hasUsed)
            );
          });
        }

        // ⭐ Filter by Min Price
        if (searchParams.has("min")) {
          filtered = filtered.filter((p: any) =>
            p.numericPrices?.some((n: number) => n >= minPrice)
          );
        }

        // ⭐ Filter by Max Price
        if (searchParams.has("max")) {
          filtered = filtered.filter((p: any) =>
            p.numericPrices?.some((n: number) => n <= maxPrice)
          );
        }

        // ⭐ SORT BY PRICE
        if (sortPrice === "asc") {
          filtered.sort((a, b) => {
            const minA = Math.min(...(a.numericPrices || [0]));
            const minB = Math.min(...(b.numericPrices || [0]));
            return minA - minB;
          });
        }

        if (sortPrice === "desc") {
          filtered.sort((a, b) => {
            const maxA = Math.max(...(a.numericPrices || [0]));
            const maxB = Math.max(...(b.numericPrices || [0]));
            return maxB - maxA;
          });
        }

        // ⭐ SORT BY NAME
        if (sortName === "az") {
          filtered.sort((a, b) => a.name.localeCompare(b.name));
        }

        if (sortName === "za") {
          filtered.sort((a, b) => b.name.localeCompare(a.name));
        }

        // ⭐ Filter by Search Keyword
        if (keywordSearch) {
          const lower = keywordSearch.toLowerCase().trim();

          // filter ตรงๆ ก่อน
          filtered = filtered.filter(
            (p) =>
              p.name.toLowerCase().includes(lower) ||
              p.brand.toLowerCase().includes(lower) ||
              (p.category ?? "").toLowerCase().includes(lower)
          );

          // ❌ ถ้าไม่พบสินค้า → แนะนำสินค้าใกล้เคียงด้วย fuzzy
          if (filtered.length === 0) {
            const q = lower.replace(/\s+/g, ""); // ตัดช่องว่างออกให้เหลือแต่ตัวอักษร

            const similar = unique.filter((p) => {
              const fields = [
                p.name?.toLowerCase() || "",
                p.brand?.toLowerCase() || "",
                p.category?.toLowerCase() || "",
              ];

              return fields.some((f) => {
                const fClean = f.replace(/\s+/g, "");
                const score = charOverlapScore(q, fClean);
                // ถ้า score >= 0.6 ถือว่าใกล้เคียง (เช่น gaem ~ game, soyn ~ sony)
                return score >= 0.6;
              });
            });

            setSuggestions(similar.slice(0, 10));
            setProducts([]);
            setLoading(false);
            return;
          }
        }

        setSuggestions([]); // reset suggestion เมื่อหาเจอ
        setProducts(filtered.slice(0, 100));
      } catch (err) {
        console.error("Error fetching products (Productdisplay):", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [
    searchParams,
    categoryFilter,
    keywordSearch,
    qualityFilter,
    minPrice,
    maxPrice,
    sortPrice,
    sortName,
  ]);

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

  /* ===========================================
      ⭐ UI: หากไม่พบสินค้า (กรณี keyword)
  ============================================ */
  if (!loading && products.length === 0 && keywordSearch) {
    return (
      <div className="p-4 sm:p-6 text-center bg-white rounded-lg shadow-md">
        <h2 className="text-lg sm:text-2xl font-bold text-red-600 mb-4">
          ไม่พบสินค้าที่คุณค้นหา: “{keywordSearch}”
        </h2>

        {suggestions.length > 0 ? (
          <>
            <p className="text-gray-700 mb-3">
              สินค้าใกล้เคียงที่อาจตรงกับที่คุณต้องการ:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mx-1 sm:mx-4 md:mx-12 mt-4">
              {suggestions.map((product) => (
                <Link
                  key={product.id}
                  href={`/detail_product/${product.id}`}
                  className="h-full"
                >
                  <div
                    className="h-full border p-2 sm:p-4 rounded-lg bg-white shadow-sm cursor-pointer flex flex-col
                    hover:border-yellow-500
                    hover:shadow-[0_0_4px_rgba(212,175,55,0.5),0_0_8px_rgba(184,134,11,0.4)]
                    transition-all duration-300"
                  >
                    <div className="w-full h-24 sm:h-40 rounded mb-2 overflow-hidden bg-gray-100">
                      <img
                        src={product.avatar}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <h3 className="text-sm sm:text-lg font-semibold line-clamp-2 min-h-[2.3rem] sm:min-h-[3.5rem]">
                        {product.name}
                      </h3>
                      <p className="text-gray-700 font-medium text-xs sm:text-base">฿ {product.price}</p>
                      <p className="text-[10px] sm:text-sm text-gray-500 mt-1 break-words">Brand: {product.brand}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <p className="text-gray-600">ไม่มีสินค้าใกล้เคียงกับคำค้นนี้เลย</p>
        )}
      </div>
    );
  }

  if (loading) return <div className="p-4 text-center">กำลังโหลดสินค้า...</div>;
  if (!isClient || products.length === 0)
    return <div className="p-4 text-center">ไม่มีข้อมูลสินค้า</div>;

  /* ===========================================
      ⭐ UI: แสดงรายการสินค้า
  ============================================ */
  return (
    <div className="container mx-auto px-1 sm:px-3 py-3 sm:py-6 rounded-lg shadow-md">
      {/* <h2 className="text-2xl font-bold flex items-center justify-center gap-2 mb-4">
        <div>Products</div>
      </h2> */}

      {/* Grid สินค้าแบบตาราง */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-6 gap-1.5 sm:gap-4 mt-3 sm:mt-4">
        {visibleItems.map((product) => (
          <Link
            key={product.id}
            href={`/detail_product/${product.id}`}
            className="h-full"
          >
            <div
              className="h-full border p-1.5 sm:p-4 rounded-lg bg-white shadow-sm cursor-pointer flex flex-col
              hover:border-yellow-500
              hover:shadow-[0_0_4px_rgba(212,175,55,0.5),0_0_8px_rgba(184,134,11,0.4)]
              transition-all duration-300"
            >
              <div className="w-full h-20 sm:h-40 rounded mb-1.5 sm:mb-2 overflow-hidden bg-gray-100">
                <img
                  src={product.avatar}
                  alt={product.name}
                  onError={(e) =>
                    (e.currentTarget.src = "/image/logo_white.jpeg")
                  }
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 flex flex-col">
                <h3 className="text-xs sm:text-lg font-semibold line-clamp-2 min-h-[2rem] sm:min-h-[3.5rem] leading-snug">
                  {product.name}
                </h3>
                <p className="text-gray-700 font-medium text-[11px] sm:text-base">฿ {product.price}</p>
                <p className="text-[10px] sm:text-sm text-gray-500 mt-0.5 sm:mt-1 break-words">Brand: {product.brand}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 sm:gap-4 mt-6">
          <button
            onClick={handlePrevPage}
            disabled={page === 0}
            className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-gray-300 hover:bg-gray-400 disabled:opacity-50 rounded"
          >
            ย้อนกลับ
          </button>

          <span className="font-semibold text-sm sm:text-base">
            Page {page + 1} / {totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={page === totalPages - 1}
            className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-gray-300 hover:bg-gray-400 disabled:opacity-50 rounded"
          >
            ถัดไป
          </button>
        </div>
      )}
    </div>
  );
}
