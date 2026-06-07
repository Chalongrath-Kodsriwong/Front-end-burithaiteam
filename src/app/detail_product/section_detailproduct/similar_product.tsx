"use client";
import "flowbite";
import { useEffect, useState } from "react";
import Link from "next/link";
import { isSellableProduct } from "@/app/utils/productVisibility";
import PreorderBadge from "@/app/components/PreorderBadge";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

function normalizeProducts(json: any) {
  if (!json) return [];
  if (Array.isArray(json?.data?.products)) return json.data.products;
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
        const products = normalizeProducts(json).filter(isSellableProduct);
        const filtered = products.filter((p: any) => {
          const pid = String(p.id_products ?? p.id);
          const categoryName = p.category?.name ?? "";
          return pid !== String(currentProductId) && categoryName === currentCategory;
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

  const extractPriceFromBackendFormat = (p: any) => {
    if (!Array.isArray(p.prices) || p.prices.length === 0) return "0";
    const prices = p.prices.map((x: any) => Number(x)).filter((n: number) => !isNaN(n));
    if (prices.length === 1) return prices[0].toLocaleString();
    if (prices.length > 1) return `${Math.min(...prices).toLocaleString()} - ${Math.max(...prices).toLocaleString()}`;
    return "0";
  };

  if (loading) return (
    <div className="flex items-center gap-2 text-[#5A7A98] text-sm p-4">
      <span className="w-4 h-4 border-2 border-[#00CFFF] border-t-transparent rounded-full animate-spin" />
      กำลังโหลดสินค้าที่ใกล้เคียง...
    </div>
  );

  if (similarProducts.length === 0) return null;

  return (
    <div className="bg-[rgba(6,8,14,0.95)] border border-[rgba(0,207,255,0.12)] rounded-xl p-5 sm:p-6">

      {/* Section header */}
      <div className="flex items-center gap-3 mb-5">
        <span className="w-1 h-6 rounded-full bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.7)]" />
        <h3 className="text-base sm:text-lg font-black text-[#E8F0F8] tracking-wide">
          สินค้าที่ใกล้เคียง
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {similarProducts.map((p) => {
          const image = p.images?.length > 0 ? p.images[0].url : "/image/logo_white.jpeg";
          const priceText = extractPriceFromBackendFormat(p);

          return (
            <Link
              key={p.id_products ?? p.id}
              href={`/detail_product/${p.id_products ?? p.id}`}
              className="group h-full"
            >
              <div className="h-full flex flex-col bg-[rgba(0,207,255,0.03)] border border-[rgba(0,207,255,0.12)] rounded-lg overflow-hidden
                hover:border-[rgba(0,207,255,0.4)] hover:bg-[rgba(0,207,255,0.07)]
                hover:shadow-[0_0_16px_rgba(0,207,255,0.1)]
                transition-all duration-300">

                {/* Image */}
                <div className="relative overflow-hidden bg-[rgba(0,207,255,0.04)]">
                  <img
                    src={image}
                    alt={p.name}
                    className="w-full h-28 sm:h-36 object-cover group-hover:scale-[1.04] transition-transform duration-300"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/image/logo_white.jpeg"; }}
                  />
                </div>

                {/* Info */}
                <div className="flex flex-col flex-1 p-2.5 sm:p-3 gap-1">
                  <h4 className="text-xs sm:text-sm font-semibold text-[#C0D8EE] line-clamp-2 leading-snug">
                    {p.name}
                  </h4>
                  {p.preorder ? (
                    <PreorderBadge preorder={p.preorder} />
                  ) : (
                    <p className="text-[#D4AF37] text-xs sm:text-sm font-bold mt-auto">
                      ฿ {priceText}
                    </p>
                  )}
                  <p className="text-[#5A7A98] text-[11px]">{p.brand}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
