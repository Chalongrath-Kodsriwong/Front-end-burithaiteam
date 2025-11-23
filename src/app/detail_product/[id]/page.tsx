"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DetailOfProductShort from "../section_detailproduct/detailOfproductShort";
import DetailOfProductFull from "../section_detailproduct/detailOfproductFull";
import ImageProduct from "../section_detailproduct/ImageProduct";
import SimilarProduct from "../section_detailproduct/similar_product";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function ProductDetailPage() {
  const { id } = useParams(); // ดึง ID จาก URL
  const router = useRouter();

  const [tokenChecked, setTokenChecked] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ⭐ เช็ค token เมื่อเริ่มต้น
  useEffect(() => {
    const userData = document.cookie.split("; ").find(row => row.startsWith("user_data="))?.split('=')[1];

    if (!userData) {
      // ถ้าไม่มีข้อมูลใน Cookie ให้ redirect ไปหน้า login
      router.replace(`/login?redirect=/detail_product/${id}`);
    } else {
      setTokenChecked(true); // ถ้ามีข้อมูลผู้ใช้, เช็คให้เสร็จ
    }
  }, [id, router]);

  // ⭐ ขั้นสอง: โหลดข้อมูลสินค้า หลังจาก token ตรวจเสร็จ
  useEffect(() => {
    if (!tokenChecked || !id) return;  // ถ้า token ยังไม่เช็คหรือไม่มี id

    async function fetchProduct() {
      try {
        const res = await fetch(`${API_URL}/api/products/${id}`, {
          credentials: "include", // ส่ง cookies ไปกับ request
        });

        if (res.status === 401) {
          router.replace(`/login?redirect=/detail_product/${id}`);
          return;
        }

        const result = await res.json();
        setProduct(result.data); // ตั้งค่าข้อมูลสินค้า
      } catch (error) {
        console.error("Error fetching product:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [tokenChecked, id, router]);

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
