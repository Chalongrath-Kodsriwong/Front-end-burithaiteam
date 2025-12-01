"use client";

import React, { useState } from "react";
import { Heart } from "lucide-react";
import { useCart } from "@/app/context/CartContext";

export default function DetailOfProductShort({ product }: any) {
  if (!product) return <div>กำลังโหลดสินค้า...</div>;

  const extractPriceRange = (product: any) => {
    if (!product?.variants) return "0";

    const prices = product.variants
      .flatMap((v: any) => v.inventories.map((i: any) => Number(i.price)))
      .filter((n: number) => !isNaN(n));

    if (prices.length <= 0) return "0";
    if (prices.length === 1) return prices[0].toLocaleString();

    return `${Math.min(...prices).toLocaleString()} - ${Math.max(
      ...prices
    ).toLocaleString()}`;
  };

  const priceText = extractPriceRange(product);

  const [quantity, setQuantity] = useState(1);

  const increaseQty = () => setQuantity((q) => q + 1);
  const decreaseQty = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const { addToCart } = useCart();

  // ✅ ดึงค่า variant/inventory ตรงกับ Database
  const variant = product?.variants?.[0];
  const inventory = variant?.inventories?.[0];

  const variantId = Number(variant?.variant_id);
  const inventoryId = Number(inventory?.inventory_id);

  const handleAddToCartClick = () => {
  addToCart(
    Number(product.id_products),
    quantity,
    variantId,
    inventoryId
  );
};


  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-1">{product.name}</h2>

      <p className="text-xl font-semibold mb-4">ราคา: ฿ {priceText}</p>

      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={decreaseQty}
          className="px-3 py-1.5 bg-gray-300 hover:bg-gray-400 rounded-l text-lg font-bold"
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
          className="px-3 py-1.5 bg-gray-300 hover:bg-gray-400 rounded-r text-lg font-bold"
        >
          +
        </button>
      </div>

      <div className="flex items-center gap-4 mb-5">
        <button className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800">
          ซื้อสินค้า
        </button>

        <button
          className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
          onClick={handleAddToCartClick}
        >
          เพิ่มลงตะกร้า ({quantity})
        </button>
      </div>

      <div className="flex mb-2 gap-6 text-sm">
        <span className="text-gray-600">
          หมวดหมู่: {product.category?.name ?? "-"}
        </span>
        <span className="text-gray-600">BRAND: {product.brand ?? "-"}</span>
      </div>

      <p className="text-gray-700 mb-3">
        {product.short_description ?? "ไม่มีรายละเอียดสินค้า"}
      </p>

      <button className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 flex items-center gap-2">
        <Heart className="w-4 h-4" /> Add Wishlist
      </button>
    </div>
  );
}
