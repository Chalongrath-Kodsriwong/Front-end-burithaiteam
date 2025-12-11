"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function DetailOfSummaryProduct() {
  const searchParams = useSearchParams();
  const itemsParam = searchParams.get("items");

  // รับค่าจาก shoppingcart → id, name, price, avatar, quantity
  const selectedItems = itemsParam ? JSON.parse(itemsParam) : [];

  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (selectedItems.length === 0) return;
    setProducts(selectedItems); // ⭐ ใช้ข้อมูลที่ส่งมาจาก cart โดยตรง
  }, []);

  if (products.length === 0)
    return <p className="text-gray-500 text-center mt-6">ไม่พบสินค้า</p>;

  return (
    <div className="p-4 border-b border-gray-300 shadow-md rounded">
      <h1 className="text-2xl font-bold mb-4">📦 สรุปรายการสินค้า</h1>

      <table className="min-w-full divide-y divide-gray-200">
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((p: any) => (
            <tr key={p.id}>
              <td className="px-6 py-4">
                <img src={p.avatar} className="w-20 h-20 rounded" />
              </td>

              <td className="px-6 py-4">{p.name}</td>

              <td className="px-6 py-4">{p.price} THB</td>

              <td className="px-6 py-4">{p.quantity} ชิ้น</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
