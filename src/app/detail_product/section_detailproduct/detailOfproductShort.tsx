"use client";
import React, { useState } from "react";
import { Heart } from "lucide-react";


export default function DetailOfProductShort({ product }: any) {
  if (!product) return <div>กำลังโหลดสินค้า...</div>;

  // ฟังก์ชันเพื่อดึงช่วงราคาจาก variants และ inventories ราคาสินค้า
  const extractPriceRange = (product: any) => {
    if (!product?.variants) return "0";

    const allPrices = product.variants.flatMap((variant: any) =>
      variant.inventories.map((inv: any) => Number(inv.price))
    );

    const prices = allPrices.filter((x: number) => !isNaN(x));

    if (prices.length === 0) return "0";
    if (prices.length === 1) return prices[0].toLocaleString();

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return `${min.toLocaleString()} - ${max.toLocaleString()}`;
  };

  const priceText = extractPriceRange(product);

  // ⭐ State สำหรับเก็บจำนวนสินค้า
  const [quantity, setQuantity] = useState(1);
  // ⭐ ฟังก์ชันเพิ่ม & ลดจำนวนสินค้า
  const increaseQty = () => setQuantity((prev) => prev + 1);
  const decreaseQty = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-1">{product.name}</h2>

      {/* <span className="text-base text-gray-600 mb-2 block">
        brand: {product.brand ?? "-"}
      </span> */}

      <p className="text-xl font-semibold mb-4">ราคา: ฿ {priceText}</p>

      {/* ⭐ Quantity Selector */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={decreaseQty}
          className="px-3 py-1.5 bg-gray-300 hover:bg-gray-400 rounded-l text-lg font-bold transition duration-300 ease-in-out"
        >
          -
        </button>

        <input
          type="text"
          value={quantity}
          readOnly
          className="w-14 text-center border border-gray-300 py-1.5 text-lg"
        />

        <button
          onClick={increaseQty}
          className="px-3 py-1.5 bg-gray-300 hover:bg-gray-400 rounded-r text-lg font-bold transition duration-300 ease-in-out"
        >
          +
        </button>
      </div>
      <div className="flex items-center gap-4 mb-5">
        <button className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition duration-300 ease-in-out">
          ซื้อสินค้า
        </button>
        <button className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition duration-300 ease-in-out">
          เพิ่มลงตะกร้า ({quantity})
        </button>
      </div>

      <div className="flex mb-2 gap-6 text-sm">
        <span className="text-gray-600">
          หมวดหมู่: {product.category?.name ?? "-"}
        </span>
        <span className="text-gray-600">BRAND: {product.brand ?? "-"}</span>
      </div>
      <div>
        <p className="text-gray-700 mb-3">
          {product.short_description ?? "ไม่มีรายละเอียดสินค้า"}
        </p>
      </div>
      <div>
        <button className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition duration-300 ease-in-out flex items-center gap-2">
          <Heart className="w-4 h-4" /> Add Wishlist
        </button>
      </div>
    </div>
  );
}
