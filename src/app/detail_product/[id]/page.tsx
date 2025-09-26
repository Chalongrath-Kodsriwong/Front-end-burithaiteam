"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ImageProduct from "../section_detailproduct/ImageProduct";
import DetailOfProductShort from "../section_detailproduct/detailOfproductShort";
import DetailOfProductFull from "../section_detailproduct/detailOfproductFull";
import SimilarProduct from "../section_detailproduct/similar_product";

export default function DetailProduct() {
  const params = useParams();
  const productId = params.id as string; // รับ `id` จาก URL

  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      const res = await fetch(`http://localhost:3000/products/${productId}`);
      const data = await res.json();
      setProduct(data); // เก็บข้อมูลสินค้าที่ดึงมาใน state
    };

    fetchProduct(); // เรียกใช้ฟังก์ชัน fetch เพื่อดึงข้อมูล
  }, [productId]); // เมื่อ `productId` เปลี่ยน จะ fetch ข้อมูลใหม่

  if (!product) return <p>Loading...</p>; // ถ้าข้อมูลยังไม่มา แสดงข้อความ Loading...

  return (
    <div className="container mx-auto px-4 py-6">
      {/* แสดงข้อมูลสินค้าที่เลือก */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ImageProduct product={product} />
        <DetailOfProductShort product={product} />
      </div>

      <div className="mt-8">
        {/* รายละเอียดสินค้าเต็ม */}
        <DetailOfProductFull product={product} />
      </div>
      
      <div className="mt-8">
        {/* สินค้าที่เกี่ยวข้อง */}
      </div>
      <SimilarProduct productId={productId} />
    </div>
  );
}
