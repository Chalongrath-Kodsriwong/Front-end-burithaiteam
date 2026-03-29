"use client";

import { useRouter, useParams } from "next/navigation";
import React, { useState } from "react";
import { Heart } from "lucide-react";
import { useCart } from "@/app/context/CartContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://158.173.159.107";

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
      ...prices,
    ).toLocaleString()}`;
  };

  const priceText = extractPriceRange(product);

  const [quantity, setQuantity] = useState(1);

  const increaseQty = () => setQuantity((q) => q + 1);
  const decreaseQty = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const { addToCart } = useCart();

  // ✅ รวม inventories
  const allInventories =
    product?.variants?.flatMap((v: any) =>
      v.inventories.map((inv: any) => ({
        ...inv,
        variant_name: v.variant_name,
        variant_id: v.variant_id,
      })),
    ) || [];

  // ❌ ไม่มี default แล้ว
  const [selectedInventory, setSelectedInventory] = useState<any>(null);

  const variantId = Number(selectedInventory?.variant_id);
  const inventoryId = Number(selectedInventory?.inventory_id);

  // ✅ ถ้ายังไม่เลือก → แสดง range
  const displayPrice = selectedInventory
    ? selectedInventory.price.toLocaleString()
    : priceText;

  const router = useRouter();
  const { id } = useParams();

  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistMsg, setWishlistMsg] = useState("");

  const handleAddToCartClick = () => {
    if (!selectedInventory) {
      alert("กรุณาเลือกสินค้า");
      return;
    }

    const username = localStorage.getItem("username");

    // 🔥 ถ้ายังไม่ได้ login → เด้งไปหน้า login
    if (!username) {
      router.replace(`/login?redirect=/detail_product/${id}`);
      return;
    }

    addToCart(Number(product.id_products), quantity, variantId, inventoryId);
  };

  const handleBuyNow = () => {
    if (!selectedInventory) {
      alert("กรุณาเลือกสินค้า");
      return;
    }

    const username = localStorage.getItem("username");

    if (!username) {
      router.push("/shoppingcart");
      return;
    }
    
    addToCart(Number(product.id_products), quantity, variantId, inventoryId);
  };

  const handleAddWishlist = async () => {
    try {
      setWishlistMsg("");
      setWishlistLoading(true);

      const productId = Number(product.id_products);

      const res = await fetch(`${API_URL}/api/wish-list`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (res.status === 401 || res.status === 403) {
        router.replace(`/login?redirect=/detail_product/${id}`);
        return;
      }

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 409) {
          setWishlistMsg("สินค้านี้อยู่ใน Wishlist แล้ว ❤️");
          return;
        }
        setWishlistMsg(json?.message || "เพิ่ม Wishlist ไม่สำเร็จ");
        return;
      }

      setWishlistMsg("เพิ่มสินค้าเข้า Wishlist แล้ว ✅");
    } catch (e) {
      console.error(e);
      setWishlistMsg("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    } finally {
      setWishlistLoading(false);
      setTimeout(() => setWishlistMsg(""), 2000);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-1">{product.name}</h2>

      <p className="text-xl font-semibold mb-4">ราคา: ฿ {displayPrice}</p>

      {/* ✅ variant_name เป็น label เฉยๆ */}
      <div className="mb-2 font-medium text-gray-700">
        {product.variants?.[0]?.variant_name || "ตัวเลือกสินค้า"}
      </div>

      {/* ✅ inventory */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {allInventories.map((inv: any) => (
            <button
              key={inv.inventory_id}
              onClick={() => setSelectedInventory(inv)}
              disabled={inv.stock === 0}
              className={`px-3 py-1 border rounded ${
                selectedInventory?.inventory_id === inv.inventory_id
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300"
              } ${inv.stock === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {inv.inventory_name}
            </button>
          ))}
        </div>
      </div>

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
        <button
          onClick={handleBuyNow}
          className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
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

      <button
        onClick={handleAddWishlist}
        disabled={wishlistLoading}
        className={`px-6 py-2 rounded flex items-center gap-2 text-white ${
          wishlistLoading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-black hover:bg-gray-800"
        }`}
      >
        <Heart className="w-4 h-4" />
        {wishlistLoading ? "Adding..." : "Add Wishlist"}
      </button>

      {wishlistMsg && (
        <p className="mt-2 text-sm text-green-700">{wishlistMsg}</p>
      )}
    </div>
  );
}
