"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DetailOfProductShort from "../section_detailproduct/detailOfproductShort";
import DetailOfProductFull from "../section_detailproduct/detailOfproductFull";
import ImageProduct from "../section_detailproduct/ImageProduct";
import SimilarProduct from "../section_detailproduct/similar_product";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [authChecked, setAuthChecked] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ⭐ ดักเหตุการณ์ logout จาก TopNavbar
  useEffect(() => {
    function handleLogout() {
      router.replace(`/login?redirect=/detail_product/${id}`);
    }

    window.addEventListener("user-logout", handleLogout);
    return () => window.removeEventListener("user-logout", handleLogout);
  }, [id, router]);

  useEffect(() => {
  if (!id) return;

  async function fetchProduct() {
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        credentials: "include",
      });

      // กันกรณี token หมดอายุ
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


  if (loading) return <p className="p-4">กำลังโหลดสินค้า...</p>;
  if (!product) return <p className="p-4">ไม่พบสินค้า</p>;

  return (
    <div className="w-full p-5">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

        <div className="col-span-1 flex justify-center md:justify-start">
          <ImageProduct product={product} />
        </div>

        <div className="col-span-2 space-y-3">
          <DetailOfProductShort product={product} />
        </div>

        <div className="col-span-3 space-y-3">
          <DetailOfProductFull product={product} />
        </div>

        <div className="col-span-4 mt-12">
          <SimilarProduct
            currentProductId={id}
            currentCategory={product.category?.name ?? ""}
          />
        </div>
      </div>
    </div>
  );
}
