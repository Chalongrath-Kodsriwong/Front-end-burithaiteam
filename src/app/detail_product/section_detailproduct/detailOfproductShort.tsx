"use client";

import { useRouter, useParams, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { Heart } from "lucide-react";
import { useCart } from "@/app/context/CartContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function DetailOfProductShort({ product }: any) {
  if (!product) return <div>กำลังโหลดสินค้า...</div>;

  const hasVisibleVariant = Array.isArray(product?.variants)
    ? product.variants.some((variant: any) => `${variant?.variant_name ?? ""}`.trim().length > 0)
    : false;

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

  useEffect(() => {
    if (hasVisibleVariant) return;
    if (allInventories.length === 0) return;

    setSelectedInventory((current: any) => current ?? allInventories[0]);
  }, [allInventories, hasVisibleVariant]);

  const variantId = Number(selectedInventory?.variant_id);
  const inventoryId = Number(selectedInventory?.inventory_id);

  // ✅ ถ้ายังไม่เลือก → แสดง range
  const displayPrice = selectedInventory
    ? selectedInventory.price.toLocaleString()
    : priceText;

  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const handledActionRef = useRef<string | null>(null);

  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistMsg, setWishlistMsg] = useState("");

  const clearPendingActionParams = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("action");
    params.delete("productId");
    params.delete("variantId");
    params.delete("inventoryId");
    params.delete("qty");

    const pid = Array.isArray(id) ? id[0] : String(id);
    const query = params.toString();
    router.replace(query ? `/detail_product/${pid}?${query}` : `/detail_product/${pid}`);
  };

  useEffect(() => {
    const action = searchParams.get("action");
    if (!action || (action !== "add_to_cart" && action !== "buy_now")) return;

    const username = localStorage.getItem("username");
    if (!username) return;

    const actionProductId = Number(searchParams.get("productId") || "0");
    const actionVariantId = Number(searchParams.get("variantId") || "0");
    const actionInventoryId = Number(searchParams.get("inventoryId") || "0");
    const actionQty = Math.max(1, Number(searchParams.get("qty") || "1"));
    const currentProductId = Number(product.id_products);

    if (!currentProductId || actionProductId !== currentProductId) return;

    const key = `${action}:${actionProductId}:${actionVariantId}:${actionInventoryId}:${actionQty}`;
    if (handledActionRef.current === key) return;

    const inventory = allInventories.find(
      (inv: any) =>
        Number(inv.variant_id) === actionVariantId &&
        Number(inv.inventory_id) === actionInventoryId
    );
    if (!inventory) return;

    handledActionRef.current = key;
    setSelectedInventory(inventory);
    setQuantity(actionQty);

    (async () => {
      try {
        await addToCart(
          currentProductId,
          actionQty,
          actionVariantId,
          actionInventoryId
        );

        if (action === "buy_now") {
          router.replace("/shoppingcart");
          return;
        }

        clearPendingActionParams();
      } catch (error) {
        console.error("Auto add-to-cart after login failed:", error);
        handledActionRef.current = null;
        alert("ไม่สามารถเพิ่มสินค้าหลัง login ได้ กรุณาลองใหม่");
      }
    })();
  }, [searchParams, product.id_products, allInventories, addToCart, id, router]);

  const handleAddToCartClick = () => {
    if (!selectedInventory) {
      alert("กรุณาเลือกสินค้า");
      return;
    }

    const username = localStorage.getItem("username");

    // 🔥 ถ้ายังไม่ได้ login → เด้งไปหน้า login
    if (!username) {
      const pid = Array.isArray(id) ? id[0] : String(id);
      const redirectTarget =
        `/detail_product/${pid}?action=add_to_cart` +
        `&productId=${Number(product.id_products)}` +
        `&variantId=${variantId}` +
        `&inventoryId=${inventoryId}` +
        `&qty=${quantity}`;
      router.replace(`/login?redirect=${encodeURIComponent(redirectTarget)}`);
      return;
    }

    addToCart(Number(product.id_products), quantity, variantId, inventoryId);
  };

  const handleBuyNow = async () => {
    if (!selectedInventory) {
      alert("กรุณาเลือกสินค้า");
      return;
    }

    const username = localStorage.getItem("username");

    if (!username) {
      const pid = Array.isArray(id) ? id[0] : String(id);
      const redirectTarget =
        `/detail_product/${pid}?action=buy_now` +
        `&productId=${Number(product.id_products)}` +
        `&variantId=${variantId}` +
        `&inventoryId=${inventoryId}` +
        `&qty=${quantity}`;
      router.replace(`/login?redirect=${encodeURIComponent(redirectTarget)}`);
      return;
    }

    try {
      await addToCart(
        Number(product.id_products),
        quantity,
        variantId,
        inventoryId
      );
      router.push("/shoppingcart");
    } catch (error) {
      console.error("Buy now error:", error);
      alert("ไม่สามารถเพิ่มสินค้าลงตะกร้าได้");
    }
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
    <div className="p-3 sm:p-4 bg-white rounded shadow">
      <h2 className="text-xl sm:text-2xl font-bold mb-1 break-words">{product.name}</h2>

      <p className="text-lg sm:text-xl font-semibold mb-4">ราคา: ฿ {displayPrice}</p>

      {hasVisibleVariant ? (
        <>
          <div className="mb-2 font-medium text-gray-700">
            {product.variants?.[0]?.variant_name || "ตัวเลือกสินค้า"}
          </div>

          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {allInventories.map((inv: any) => (
                <button
                  key={inv.inventory_id}
                  onClick={() => setSelectedInventory(inv)}
                  disabled={inv.stock === 0}
                  className={`px-2.5 sm:px-3 py-1 text-sm sm:text-base border rounded ${
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
        </>
      ) : null}

      <div className="flex items-center gap-2 sm:gap-4 mb-6">
        <button
          onClick={decreaseQty}
          className="px-2.5 sm:px-3 py-1.5 bg-gray-300 hover:bg-gray-400 rounded-l text-base sm:text-lg font-bold"
        >
          -
        </button>

        <input
          type="text"
          value={quantity}
          readOnly
          className="w-12 sm:w-14 text-center border border-gray-300 py-1.5 text-base sm:text-lg"
        />

        <button
          onClick={increaseQty}
          className="px-2.5 sm:px-3 py-1.5 bg-gray-300 hover:bg-gray-400 rounded-r text-base sm:text-lg font-bold"
        >
          +
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-5">
        <button
          onClick={handleBuyNow}
          className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          ซื้อสินค้า
        </button>

        <button
          className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
          onClick={handleAddToCartClick}
        >
          เพิ่มลงตะกร้า ({quantity})
        </button>
      </div>

      <div className="flex flex-col sm:flex-row mb-2 gap-1 sm:gap-6 text-sm">
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
        {wishlistLoading ? "กำลังเพิ่มลงใน Wishlist..." : "เพิ่มใน Wishlist"}
      </button>

      {wishlistMsg && (
        <p className="mt-2 text-sm text-green-700">{wishlistMsg}</p>
      )}
    </div>
  );
}
