"use client";
import "flowbite";
import React from "react";

export default function DetailOfProductFull({ product }: any) {
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

  const category = product.category?.name ?? "-";
  const description = product.description ?? "ไม่มีรายละเอียดสินค้า";

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex gap-5 items-center justify-center">
        <h3 className="text-xl font-bold mb-2">รายละเอียดสินค้า</h3>
        {/* <span className="text-gray-600 text-sm">หมวดหมู่: {category}</span> */}
      </div>
      <p className="text-gray-700 mb-3">{description}</p>
      {/* <p className="text-gray-600">ราคา: ฿ {priceText}</p> */}
    </div>
  );
}
