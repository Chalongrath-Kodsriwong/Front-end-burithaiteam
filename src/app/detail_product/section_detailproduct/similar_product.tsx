"use client";
import { useEffect, useState } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  avatar: string;
}

interface Props {
  productId: string;
  limit: number; // เพิ่ม prop limit เพื่อกำหนดจำนวนสินค้าที่จะแสดง
}

export default function SimilarProduct({ productId, limit }: Props) {
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      const res = await fetch(`http://localhost:3000/products?exclude=${productId}`);
      const data = await res.json();
      // ใช้ฟังก์ชัน random เพื่อสุ่มรายการสินค้า
      const shuffled = data.sort(() => Math.random() - 0.5);
      setSimilarProducts(shuffled);
    };

    fetchSimilarProducts();
  }, [productId]);

  // ใช้ slice เพื่อลิมิตจำนวนสินค้า
  const displayedProducts = similarProducts.slice(0, 12); // แสดงแค่จำนวนที่กำหนดใน limit

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Similar Products</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {displayedProducts.map((product) => (
          <div key={product.id} className="p-4 border rounded hover:shadow cursor-pointer">
            <img
              src={product.avatar}
              alt={product.name}
              className="w-full h-40 object-cover rounded"
            />
            <h3 className="font-semibold mt-2">{product.name}</h3>
            <p className="text-gray-600">{product.price} THB</p>
          </div>
        ))}
      </div>
    </div>
  );
}
