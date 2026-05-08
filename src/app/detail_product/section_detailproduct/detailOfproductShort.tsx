"use client";

import { useRouter, useParams, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Copy, Heart, Share2, X } from "lucide-react";
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";
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

    return `${Math.min(...prices).toLocaleString()} - ${Math.max(
      ...prices,
    ).toLocaleString()}`;
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

  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistMsg, setWishlistMsg] = useState("");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copyMsg, setCopyMsg] = useState("");

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
  }, [searchParams, currentProductId, allInventories, addToCart, id, router]);

  useEffect(() => {
    if (!isShareOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsShareOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isShareOpen]);

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
        `&productId=${currentProductId}` +
        `&variantId=${variantId}` +
        `&inventoryId=${inventoryId}` +
        `&qty=${quantity}`;
      router.replace(`/login?redirect=${encodeURIComponent(redirectTarget)}`);
      return;
    }

    addToCart(currentProductId, quantity, variantId, inventoryId);
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
        `&productId=${currentProductId}` +
        `&variantId=${variantId}` +
        `&inventoryId=${inventoryId}` +
        `&qty=${quantity}`;
      router.replace(`/login?redirect=${encodeURIComponent(redirectTarget)}`);
      return;
    }

    try {
      await addToCart(
        currentProductId,
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

      const productId = currentProductId;

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

  const productTitle = product?.name || "สินค้า";

  const buildFacebookShareUrl = () => {
    const productId = String(product?.id_products ?? id ?? "product");
    return `https://burithaiteam.com/share-card/product/${productId}/${productId}`;
  };

  const buildProductUrl = () => {
    const productId = String(product?.id_products ?? id ?? "product");
    return `https://burithaiteam.com/detail_product/${productId}`;
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    setShareUrl(buildFacebookShareUrl());
  }, [id, currentProductId]);

  const copyShareLink = async () => {
    const urlToCopy = buildProductUrl();
    try {
      await navigator.clipboard.writeText(urlToCopy);
      setCopyMsg("คัดลอกลิงก์แล้ว");
    } catch (error) {
      console.error("Copy link failed:", error);
      setCopyMsg("คัดลอกลิงก์ไม่สำเร็จ");
    } finally {
      window.setTimeout(() => setCopyMsg(""), 1800);
    }
  };

  const handleOpenShareModal = () => {
    setShareUrl(buildFacebookShareUrl());
    setIsShareOpen(true);
  };

  const openShareWindow = async (type: "facebook" | "whatsapp" | "instagram" | "tiktok") => {
    const productUrl = buildProductUrl();
    const facebookShareUrl = shareUrl || buildFacebookShareUrl();
    const shareSummary = `ดูสินค้า ${productTitle}${priceText ? ` ราคา ฿${priceText}` : ""}`;
    const encodedText = encodeURIComponent(`${shareSummary} ${productUrl}`);

    let targetUrl = "";

    if (type === "facebook") {
      const encodedUrl = encodeURIComponent(facebookShareUrl);
      const encodedQuote = encodeURIComponent(shareSummary);
      targetUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedQuote}`;
    }

    if (type === "whatsapp") {
      targetUrl = `https://wa.me/?text=${encodedText}`;
    }

    if (type === "instagram") {
      await copyShareLink();
      targetUrl = "https://www.instagram.com/create/select/";
    }

    if (type === "tiktok") {
      await copyShareLink();
      targetUrl = "https://www.tiktok.com/upload";
    }

    if (type === "facebook") {
      window.open(targetUrl, "_blank");
      return;
    }

    window.open(targetUrl, "_blank", "noopener,noreferrer,width=900,height=700");
  };

  const shareActions = [
    {
      key: "facebook",
      label: "Facebook",
      icon: FaFacebookF,
      className: "bg-[#1877F2] text-white",
      note: "แชร์ลิงก์ไปยัง Facebook",
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      icon: FaWhatsapp,
      className: "bg-[#25D366] text-white",
      note: "แชร์ลิงก์ไปยัง WhatsApp",
    },
    {
      key: "instagram",
      label: "Instagram",
      icon: FaInstagram,
      className:
        "bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#515BD4] text-white",
      note: "คัดลอกลิงก์แล้วเปิดหน้าโพสต์ Instagram",
    },
    {
      key: "tiktok",
      label: "TikTok",
      icon: FaTiktok,
      className: "bg-black text-white",
      note: "คัดลอกลิงก์แล้วเปิดหน้าอัปโหลด TikTok",
    },
  ] as const;

  if (!product) return <div>กำลังโหลดสินค้า...</div>;

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

      <div className="flex flex-wrap items-center gap-3">
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

        <button
          type="button"
          onClick={handleOpenShareModal}
          className="px-6 py-2 rounded flex items-center gap-2 border border-gray-300 text-gray-800 hover:bg-gray-50"
        >
          <Share2 className="w-4 h-4" />
          แชร์สินค้า
        </button>
      </div>

      {wishlistMsg && (
        <p className="mt-2 text-sm text-green-700">{wishlistMsg}</p>
      )}

      {isShareOpen && (
        <div
          className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setIsShareOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">แชร์สินค้า</h3>
                <p className="text-sm text-gray-500">เลือกช่องทางที่ต้องการแชร์สินค้า</p>
              </div>
              <button
                type="button"
                onClick={() => setIsShareOpen(false)}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="ปิดหน้าต่างแชร์สินค้า"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 px-5 py-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {shareActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.key}
                      type="button"
                      onClick={() =>
                        openShareWindow(
                          action.key as "facebook" | "whatsapp" | "instagram" | "tiktok"
                        )
                      }
                      className="flex flex-col items-center gap-2 rounded-2xl border border-gray-200 px-3 py-4 hover:border-gray-300 hover:bg-gray-50"
                    >
                      <span
                        className={`flex h-12 w-12 items-center justify-center rounded-full text-xl ${action.className}`}
                      >
                        <Icon />
                      </span>
                      <span className="text-sm font-medium text-gray-800">{action.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3 rounded-2xl bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-700">ลิงก์สินค้า</p>
                <div className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-700 break-all">
                  {buildProductUrl()}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-gray-500">
                    Instagram และ TikTok จะคัดลอกลิงก์ให้ก่อน แล้วเปิดหน้าโพสต์/อัปโหลดของบัญชีที่ล็อกอินไว้
                  </p>
                  <button
                    type="button"
                    onClick={copyShareLink}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                  >
                    <Copy className="h-4 w-4" />
                    คัดลอกลิงก์
                  </button>
                </div>
                {copyMsg && <p className="text-sm text-green-700">{copyMsg}</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
