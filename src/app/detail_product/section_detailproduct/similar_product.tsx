"use client";
import { useEffect, useState } from "react";
import Link from "next/link"; // ✅ เพิ่ม

interface Product {
  id: string;
  name: string;
  price: number;
  branch: string;
  avatar: string;
}

interface Props {
  productId: string;
  limit: number; // prop limit เพื่อกำหนดจำนวนสินค้าที่จะแสดง
}

export default function SimilarProduct({ productId, limit }: Props) {
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      const res = await fetch(`http://localhost:3000/products?exclude=${productId}`);
      const data = await res.json();
      const shuffled = data.sort(() => Math.random() - 0.5); // ✅ สุ่มรายการ
      setSimilarProducts(shuffled);
    };

    fetchSimilarProducts();
  }, [productId]);

  const displayedProducts = similarProducts.slice(0, 12); // ✅ ลิมิตตาม prop

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Similar Products</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {displayedProducts.map((product) => (
          <Link key={product.id} href={`/detail_product/${product.id}`}>
            <div className="p-4 border rounded hover:shadow cursor-pointer transition duration-200 hover:bg-gray-50">
              <img
                src={product.avatar}
                alt={product.name}
                className="w-full h-40 object-cover rounded"
              />
              <h3 className="font-semibold mt-2">{product.name}</h3>
              <p className="text-gray-600">Branch: {product.branch}</p>
              <p className="text-gray-600">{product.price} THB</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
