"use client";
import "flowbite";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Product } from "@/types/Productdisplay"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const ITEMS_PER_PAGE = 20; // แสดง 20 ชิ้นต่อหน้า

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

        const productData = Array.isArray(json.data) ? json.data : [];

        const mapped: Product[] = productData.map((p: any) => {
          let price = "0";

          // ป้องกัน p.prices ไม่ใช่ array
          const prices = Array.isArray(p.prices)
            ? p.prices
                .map((x: any) => Number(x))
                .filter((n: number) => !isNaN(n))
            : [];

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

        // ⭐ Filter by Quality
        if (qualityFilter) {
          filtered = filtered.filter(
            (p) =>
              (p.quality ?? "").toLowerCase() === qualityFilter.toLowerCase()
          );
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
      <div className="p-6 text-center bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          ไม่พบสินค้าที่คุณค้นหา: “{keywordSearch}”
        </h2>

        {suggestions.length > 0 ? (
          <>
            <p className="text-gray-700 mb-3">
              สินค้าใกล้เคียงที่อาจตรงกับที่คุณต้องการ:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mx-12 mt-4">
              {suggestions.map((product) => (
                <Link key={product.id} href={`/detail_product/${product.id}`}>
                  <div className="border p-4 rounded-lg bg-white shadow-sm cursor-pointer hover:shadow-md transition">
                    <img
                      src={product.avatar}
                      alt={product.name}
                      className="w-full h-32 object-cover mb-2 rounded"
                    />
                    <h3 className="text-lg font-semibold line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-700 font-medium">
                      ฿ {product.price}
                    </p>
                    <p className="text-sm text-gray-500">
                      Brand: {product.brand}
                    </p>
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
