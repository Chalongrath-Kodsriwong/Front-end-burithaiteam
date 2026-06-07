"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import DetailOfProductShort from "../section_detailproduct/detailOfproductShort";
import DetailOfProductFull from "../section_detailproduct/detailOfproductFull";
import ImageProduct from "../section_detailproduct/ImageProduct";
import SimilarProduct from "../section_detailproduct/similar_product";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

type ProductDetailClientProps = {
  id: string;
};

export default function ProductDetailClient({ id }: ProductDetailClientProps) {
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const handledIdRef = useRef<string | null>(null);

  useEffect(() => {
    function handleLogout() {
      router.replace(`/login?redirect=/detail_product/${id}`);
    }

    window.addEventListener("user-logout", handleLogout);
    return () => window.removeEventListener("user-logout", handleLogout);
  }, [id, router]);

  useEffect(() => {
    if (!id) return;
    if (handledIdRef.current === id) return;
    handledIdRef.current = id;

    async function fetchProduct() {
      try {
        const res = await fetch(`${API_URL}/api/products/${id}`, {
          credentials: "include",
        });

        if (res.status === 401) {
          router.replace(`/login?redirect=/detail_product/${id}`);
          return;
        }

        const result = await res.json();
        setProduct(result.data);
      } catch (error) {
        console.error("Error fetching product:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id, router]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[40vh] gap-2 text-[#5A7A98]">
      <span className="w-5 h-5 border-2 border-[#00CFFF] border-t-transparent rounded-full animate-spin" />
      กำลังโหลดสินค้า...
    </div>
  );
  if (!product) return (
    <div className="flex items-center justify-center min-h-[40vh] text-[#5A7A98]">
      ไม่พบสินค้า
    </div>
  );

  return (
    <section className="relative w-full bg-[#08090d] overflow-hidden">
      {/* LED grid background */}
      <div className="absolute inset-0 bg-led-grid opacity-20 pointer-events-none" />
      <div className="relative z-10 w-full px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        <div className="col-span-1 flex justify-center md:justify-start">
          <ImageProduct product={product} />
        </div>

        <div className="col-span-1 md:col-span-2 space-y-3">
          <DetailOfProductShort product={product} />
        </div>

        <div className="col-span-1 md:col-span-3 space-y-3">
          <DetailOfProductFull product={product} />
        </div>

        <div className="col-span-1 md:col-span-3 mt-2">
          <SimilarProduct
            currentProductId={id}
            currentCategory={product.category?.name ?? ""}
          />
        </div>
      </div>
      </div>
    </section>
  );
}
