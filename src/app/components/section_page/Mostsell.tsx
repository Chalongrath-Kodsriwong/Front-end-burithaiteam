"use client";
import "flowbite";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const ITEMS_PER_PAGE = 4;

type ApiProduct = {
  id_products: number;
  name: string;
  brand?: string | null;
  images?: { url: string }[];
  prices?: number[];
  discount?: null | {
    name: string;
    discountType: string;
    discountValue: number;
    finalPrices?: number[];
  };
  soldQuantity?: number;
};

interface ProductUI {
  id: number;
  name: string;
  brand: string;
  avatar: string;
  priceText: string; // ราคาปกติ
  finalPriceText?: string; // ราคาหลังลด (ถ้ามี)
  soldQty?: number;
}

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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.avatar}
                  alt={product.name}
                  onError={(e) =>
                    (e.currentTarget.src = "/image/logo_white.jpeg")
                  }
                  className="w-full h-[250px] object-cover rounded"
                />

                <h3 className="font-semibold mt-2 line-clamp-2">
                  {product.name}
                </h3>

                {/* ราคา */}
                <div className="mt-1">
                  {product.finalPriceText ? (
                    <div className="space-y-0.5">
                      <p className="text-sm text-gray-500 line-through">
                        ฿ {product.priceText}
                      </p>
                      <p className="font-semibold text-red-600">
                        ฿ {product.finalPriceText}
                      </p>
                    </div>
                  ) : (
                    <p className="font-semibold">฿ {product.priceText}</p>
                  )}
                </div>

                <p className="text-sm text-gray-600 mt-1">
                  Brand: {product.brand}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  ขายไปแล้ว: {product.soldQty?.toLocaleString() ?? "0"} ชิ้น
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
    </div>
  );
}