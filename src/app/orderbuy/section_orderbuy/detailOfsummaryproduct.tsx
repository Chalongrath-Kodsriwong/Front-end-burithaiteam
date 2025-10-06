"use client";
import "flowbite";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: number;
  branch: string;
  avatar: string;
}

interface SelectedItem {
  id: string;
  quantity: number;
}

export default function DetailOfSummaryProduct() {
  const searchParams = useSearchParams();
  const itemsParam = searchParams.get("items");
  const selectedItems: SelectedItem[] = itemsParam
    ? JSON.parse(itemsParam)
    : [];

  const [products, setProducts] = useState<(Product & { quantity: number })[]>(
    []
  );

  useEffect(() => {
    if (selectedItems.length > 0) {
      const fetchData = async () => {
        const fetched = await Promise.all(
          selectedItems.map(async (item) => {
            const res = await fetch(
              `http://localhost:3000/products/${item.id}`
            );
            const data = await res.json();
            return { ...data, quantity: item.quantity }; // ✅ ผูก quantity มาด้วย
          })
        );
        setProducts(fetched);
      };
      fetchData();
    }
  }, [itemsParam]);

  if (products.length === 0)
    return (
      <>
        <p className="text-center mt-6 text-gray-500">
          ไม่พบสินค้าที่เลือก กรุณากลับไปเลือกสินค้าก่อน
        </p>
        <div className="flex justify-center gap-4">

        <Link href="/product">
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            กลับไปเลือกสินค้า
          </button>
        </Link>

        <Link href="/shoppingcart">
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            กลับไปตะกร้าสินค้า
          </button>
        </Link>
        </div>
      </>
    );

  return (
    <div className="overflow-x-auto p-4 border-b border-gray-300 shadow-md rounded">
      <h1 className="text-2xl font-bold mb-4">
        📦 สรุปรายการสินค้าที่เลือก
      </h1>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              รูปภาพ
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              ข้อมูลสินค้า
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              ราคาต่อหน่วย
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              จำนวนที่เลือก
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <img
                  src={product.avatar}
                  alt={product.name}
                  className="w-24 h-24 object-cover rounded"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {product.name}
                </div>
                <div className="text-sm text-gray-500">{product.branch}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {product.price} THB
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {product.quantity} ชิ้น
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
