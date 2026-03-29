"use client";
import "flowbite";
import { useEffect, useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://158.173.159.107";

function normalizeProducts(json: any) {
  if (!json) return [];

  // Backend ส่งแบบนี้:
  // data: { products: [...] }
  if (Array.isArray(json?.data?.products)) return json.data.products;

  // สำรอง
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json)) return json;

  return [];
}

export default function SimilarProduct({ currentProductId, currentCategory }: any) {
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSimilarProducts() {
      try {
        const res = await fetch(`${API_URL}/api/products`, { cache: "no-store" });
        const json = await res.json();

        const products = normalizeProducts(json);

        // ฟิลเตอร์ตามหมวดหมู่
        const filtered = products.filter((p: any) => {
          const pid = String(p.id_products ?? p.id);
          const categoryName = p.category?.name ?? "";
          return (
            pid !== String(currentProductId) &&
            categoryName === currentCategory
          );
        });

        setSimilarProducts(filtered.slice(0, 4));
      } catch (err) {
        console.error("Error fetching similar products:", err);
      } finally {
        setLoading(false);
      }
    }

    if (currentProductId && currentCategory !== undefined) {
      fetchSimilarProducts();
    }
  }, [String(currentProductId), String(currentCategory)]);

  if (loading) return <div>กำลังโหลดสินค้าที่ใกล้เคียง...</div>;

  // ดึงราคาแบบ Productdisplay
  const extractPriceFromBackendFormat = (p: any) => {
    let price = "0";

    if (Array.isArray(p.prices) && p.prices.length > 0) {
      const prices = p.prices
        .map((x: any) => Number(x))
        .filter((n: number) => !isNaN(n));

      if (prices.length === 1) price = prices[0].toLocaleString();
      else if (prices.length > 1) {
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        price = `${min.toLocaleString()} - ${max.toLocaleString()}`;
      }
    }

    return price;
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow">
      <h3 className="text-xl font-bold mb-3">สินค้าที่ใกล้เคียง</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {similarProducts.map((p) => {
          const image =
            p.images?.length > 0 ? p.images[0].url : "/image/logo_white.jpeg";

          const priceText = extractPriceFromBackendFormat(p);

          return (
            <Link
              key={p.id_products ?? p.id}
              href={`/detail_product/${p.id_products ?? p.id}`}
            >
              <div className="p-3 bg-white rounded hover:shadow-md cursor-pointer transition">
                <img
                  src={image}
                  alt={p.name}
                  className="w-full h-[150px] object-cover rounded"
                />
                <h4 className="font-semibold mt-2 text-sm">{p.name}</h4>
                <p className="text-black-100 text-sm">
                  ฿ {priceText}
                </p>
                <p className="text-gray-500 text-sm">{p.brand}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
