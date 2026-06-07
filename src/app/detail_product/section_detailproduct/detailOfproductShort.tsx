"use client";

import { useRouter, useParams, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Heart, Share2, Copy, Check } from "lucide-react";
import { FaFacebook, FaInstagram, FaWeixin } from "react-icons/fa";
import { SiLine } from "react-icons/si";
import { useCart } from "@/app/context/CartContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function DetailOfProductShort({ product }: any) {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const handledActionRef = useRef<string | null>(null);
  const { addToCart } = useCart();

  const productVariants = useMemo(
    () => (Array.isArray(product?.variants) ? product.variants : []),
    [product?.variants],
  );

  const hasVisibleVariant = productVariants.some(
    (variant: any) => `${variant?.variant_name ?? ""}`.trim().length > 0,
  );

  const extractPriceRange = (product: any) => {
    const variants = Array.isArray(product?.variants) ? product.variants : [];
    if (variants.length === 0) return "0";

    const prices = variants
      .flatMap((v: any) =>
        Array.isArray(v?.inventories)
          ? v.inventories.map((i: any) => Number(i.price))
          : [],
      )
      .filter((n: number) => !isNaN(n));

    if (prices.length <= 0) return "0";
    if (prices.length === 1) return prices[0].toLocaleString();

    return `${Math.min(...prices).toLocaleString()} - ${Math.max(...prices).toLocaleString()}`;
  };

  const priceText = extractPriceRange(product);
  const currentProductId = Number(product?.id_products || 0);

  const [quantity, setQuantity] = useState(1);
  const increaseQty = () => setQuantity((q) => q + 1);
  const decreaseQty = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const allInventories = useMemo(
    () =>
      productVariants.flatMap((v: any) =>
        Array.isArray(v?.inventories)
          ? v.inventories.map((inv: any) => ({
              ...inv,
              variant_name: v.variant_name,
              variant_id: v.variant_id,
            }))
          : [],
      ),
    [productVariants],
  );

  const [selectedInventory, setSelectedInventory] = useState<any>(null);

  useEffect(() => {
    if (hasVisibleVariant) return;
    if (allInventories.length === 0) return;
    setSelectedInventory((current: any) => current ?? allInventories[0]);
  }, [allInventories, hasVisibleVariant]);

  const variantId = Number(selectedInventory?.variant_id);
  const inventoryId = Number(selectedInventory?.inventory_id);

  const displayPrice = selectedInventory
    ? selectedInventory.price.toLocaleString()
    : priceText;

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
    if (!currentProductId || actionProductId !== currentProductId) return;
    const key = `${action}:${actionProductId}:${actionVariantId}:${actionInventoryId}:${actionQty}`;
    if (handledActionRef.current === key) return;
    const inventory = allInventories.find(
      (inv: any) =>
        Number(inv.variant_id) === actionVariantId &&
        Number(inv.inventory_id) === actionInventoryId,
    );
    if (!inventory) return;
    handledActionRef.current = key;
    setSelectedInventory(inventory);
    setQuantity(actionQty);
    (async () => {
      try {
        await addToCart(currentProductId, actionQty, actionVariantId, actionInventoryId);
        if (action === "buy_now") {
          sessionStorage.setItem("buynow_inventory_id", String(actionInventoryId));
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
  }, [searchParams, currentProductId, allInventories, addToCart, id, router]);

  const handleAddToCartClick = () => {
    if (!selectedInventory) { alert("กรุณาเลือกสินค้า"); return; }
    const username = localStorage.getItem("username");
    if (!username) {
      const pid = Array.isArray(id) ? id[0] : String(id);
      router.replace(
        `/login?redirect=${encodeURIComponent(
          `/detail_product/${pid}?action=add_to_cart&productId=${currentProductId}&variantId=${variantId}&inventoryId=${inventoryId}&qty=${quantity}`
        )}`
      );
      return;
    }
    addToCart(currentProductId, quantity, variantId, inventoryId);
  };

  const handleBuyNow = async () => {
    if (!selectedInventory) { alert("กรุณาเลือกสินค้า"); return; }
    const username = localStorage.getItem("username");
    if (!username) {
      const pid = Array.isArray(id) ? id[0] : String(id);
      router.replace(
        `/login?redirect=${encodeURIComponent(
          `/detail_product/${pid}?action=buy_now&productId=${currentProductId}&variantId=${variantId}&inventoryId=${inventoryId}&qty=${quantity}`
        )}`
      );
      return;
    }
    try {
      await addToCart(currentProductId, quantity, variantId, inventoryId);
      sessionStorage.setItem("buynow_inventory_id", String(inventoryId));
      router.push("/shoppingcart");
    } catch (error) {
      console.error("Buy now error:", error);
      alert("ไม่สามารถเพิ่มสินค้าลงตะกร้าได้");
    }
  };

  const pid = Array.isArray(id) ? id[0] : String(id);
  const productUrl = `https://burithaiteam.com/detail_product/${pid}`;

  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShowShare(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(productUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareFacebook = async () => {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isIOS && navigator.share) {
      try { await navigator.share({ title: product?.name ?? "สินค้า BuriThaiTeam", url: productUrl }); return; }
      catch { /* cancelled */ }
    }
    window.location.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;
  };

  const handleShareLine = () => {
    window.open(`https://line.me/R/msg/text/?${encodeURIComponent(productUrl)}`, "_blank", "noopener,noreferrer");
  };

  const handleShareInstagram = async () => {
    await navigator.clipboard.writeText(productUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWeChat = async () => {
    await navigator.clipboard.writeText(productUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddWishlist = async () => {
    try {
      setWishlistMsg("");
      setWishlistLoading(true);
      const res = await fetch(`${API_URL}/api/wish-list`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: currentProductId }),
      });
      if (res.status === 401 || res.status === 403) {
        router.replace(`/login?redirect=/detail_product/${id}`);
        return;
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setWishlistMsg(res.status === 409 ? "สินค้านี้อยู่ใน Wishlist แล้ว ❤️" : (json?.message || "เพิ่ม Wishlist ไม่สำเร็จ"));
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

  if (!product) return <div>กำลังโหลดสินค้า...</div>;

  return (
    <div className="bg-[rgba(6,8,14,0.95)] border border-[rgba(0,207,255,0.15)] rounded-xl p-5 sm:p-6">

      {/* Category + Brand */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="led-badge">
          <span className="led-badge-dot" />
          {product.category?.name ?? "-"}
        </span>
        <span className="text-[10px] font-bold tracking-widest text-[#D4AF37]/80 uppercase border border-[rgba(212,175,55,0.25)] px-2.5 py-1 rounded-sm">
          {product.brand ?? "-"}
        </span>
      </div>

      {/* Product name */}
      <h2 className="text-xl sm:text-2xl lg:text-[1.75rem] font-black text-[#E8F0F8] mb-2 leading-tight break-words">
        {product.name}
      </h2>

      {/* Price */}
      <div className="flex items-baseline gap-2 mb-5">
        <span className="text-xs text-[#5A7A98] font-medium">ราคา</span>
        <span className="text-2xl sm:text-3xl font-black text-[#D4AF37]">
          ฿ {displayPrice}
        </span>
      </div>

      {/* Variants */}
      {hasVisibleVariant && (
        <div className="mb-5">
          <div className="text-[10px] font-bold tracking-widest text-[#00CFFF]/60 uppercase mb-2">
            {product.variants?.[0]?.variant_name || "ตัวเลือกสินค้า"}
          </div>
          <div className="flex flex-wrap gap-2">
            {allInventories.map((inv: any) => (
              <button
                key={inv.inventory_id}
                onClick={() => setSelectedInventory(inv)}
                disabled={inv.stock === 0}
                className={`px-3 py-1.5 text-sm font-semibold rounded-sm border transition-all duration-200
                  ${selectedInventory?.inventory_id === inv.inventory_id
                    ? "border-[#00CFFF] bg-[rgba(0,207,255,0.12)] text-[#00CFFF] shadow-[0_0_10px_rgba(0,207,255,0.2)]"
                    : "border-[rgba(0,207,255,0.2)] text-[#7A9AB8] hover:border-[rgba(0,207,255,0.45)] hover:text-[#B0CEEA]"
                  }
                  ${inv.stock === 0 ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {inv.inventory_name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Qty control */}
      <div className="flex items-center mb-5">
        <button
          onClick={decreaseQty}
          className="w-9 h-9 flex items-center justify-center bg-[rgba(0,207,255,0.06)] border border-[rgba(0,207,255,0.2)] border-r-0 text-[#00CFFF] hover:bg-[rgba(0,207,255,0.15)] rounded-l-sm text-xl font-bold transition"
        >
          −
        </button>
        <input
          type="text"
          value={quantity}
          readOnly
          className="w-12 h-9 text-center bg-[rgba(0,207,255,0.04)] border border-[rgba(0,207,255,0.2)] text-[#E8F0F8] text-base font-bold outline-none"
        />
        <button
          onClick={increaseQty}
          className="w-9 h-9 flex items-center justify-center bg-[rgba(0,207,255,0.06)] border border-[rgba(0,207,255,0.2)] border-l-0 text-[#00CFFF] hover:bg-[rgba(0,207,255,0.15)] rounded-r-sm text-xl font-bold transition"
        >
          +
        </button>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <button onClick={handleBuyNow} className="btn-gold flex-1 text-sm font-bold">
          ซื้อสินค้า
        </button>
        <button onClick={handleAddToCartClick} className="btn-outline-gold flex-1 text-sm font-bold">
          เพิ่มลงตะกร้า ({quantity})
        </button>
      </div>

      {/* Short description */}
      <p className="text-sm text-[#5A7A98] leading-relaxed mb-4">
        {product.short_description ?? "ไม่มีรายละเอียดสินค้า"}
      </p>

      {/* Divider */}
      <div className="border-t border-[rgba(0,207,255,0.08)] mb-4" />

      {/* Wishlist + Share */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleAddWishlist}
          disabled={wishlistLoading}
          className={`flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium border transition-all duration-200
            ${wishlistLoading
              ? "border-[rgba(0,207,255,0.08)] text-[#3A5A78] cursor-not-allowed"
              : "border-[rgba(0,207,255,0.2)] text-[#7A9AB8] hover:border-[rgba(0,207,255,0.45)] hover:text-[#B0CEEA] hover:bg-[rgba(0,207,255,0.05)]"
            }`}
        >
          <Heart className="w-4 h-4" />
          {wishlistLoading ? "กำลังเพิ่ม..." : "เพิ่มใน Wishlist"}
        </button>

        <div className="relative" ref={shareRef}>
          <button
            onClick={() => setShowShare((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium border border-[rgba(0,207,255,0.2)] text-[#7A9AB8] hover:border-[rgba(0,207,255,0.45)] hover:text-[#B0CEEA] hover:bg-[rgba(0,207,255,0.05)] transition-all duration-200"
          >
            <Share2 className="w-4 h-4" />
            แชร์
          </button>

          {showShare && (
            <div className="absolute bottom-full mb-2 left-0 z-50 bg-[rgba(6,8,14,0.98)] border border-[rgba(0,207,255,0.2)] rounded-xl shadow-xl p-4 w-72">
              <p className="text-sm font-semibold text-[#E8F0F8] mb-3">แชร์สินค้านี้</p>
              <div className="flex gap-4 mb-4">
                <button onClick={handleShareFacebook} className="flex flex-col items-center gap-1">
                  <div className="w-11 h-11 rounded-full bg-[#1877F2] flex items-center justify-center text-white">
                    <FaFacebook className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-[#5A7A98]">Facebook</span>
                </button>
                <button onClick={handleShareLine} className="flex flex-col items-center gap-1">
                  <div className="w-11 h-11 rounded-full bg-[#00B900] flex items-center justify-center text-white">
                    <SiLine className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-[#5A7A98]">Line</span>
                </button>
                <button onClick={handleShareInstagram} className="flex flex-col items-center gap-1">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white"
                    style={{ background: "linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)" }}>
                    <FaInstagram className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-[#5A7A98]">Instagram</span>
                </button>
                <button onClick={handleShareWeChat} className="flex flex-col items-center gap-1">
                  <div className="w-11 h-11 rounded-full bg-[#07C160] flex items-center justify-center text-white">
                    <FaWeixin className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-[#5A7A98]">WeChat</span>
                </button>
              </div>
              <div className="flex items-center gap-2 bg-[rgba(0,207,255,0.05)] rounded-lg px-3 py-2 border border-[rgba(0,207,255,0.15)]">
                <span className="text-xs text-[#5A7A98] flex-1 truncate">{productUrl}</span>
                <button
                  onClick={handleCopyUrl}
                  className="flex items-center gap-1 text-xs font-medium whitespace-nowrap text-[#00CFFF] hover:text-white"
                >
                  {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? "คัดลอกแล้ว" : "คัดลอก"}
                </button>
              </div>
              {copied && (
                <p className="mt-2 text-xs text-green-400">คัดลอก URL แล้ว วางใน IG / WeChat ได้เลย</p>
              )}
            </div>
          )}
        </div>
      </div>

      {wishlistMsg && (
        <p className="mt-2 text-sm text-green-400">{wishlistMsg}</p>
      )}
    </div>
  );
}
