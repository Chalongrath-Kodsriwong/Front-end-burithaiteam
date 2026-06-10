"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";

import { Product } from "@/types/DisplayItemCart";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function DisplayItemCart() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [footerFixed, setFooterFixed] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const { refreshCart } = useCart();

  useEffect(() => {
    if (products.length === 0) return;
    const check = () => {
      if (!sentinelRef.current) return;
      const top = sentinelRef.current.getBoundingClientRect().top;
      // sentinel below footer area → keep fixed; at/above it → release to natural position
      setFooterFixed(top > window.innerHeight - 72);
    };
    window.addEventListener("scroll", check, { passive: true });
    check();
    return () => window.removeEventListener("scroll", check);
  }, [products.length]);

  const loadCart = async () => {
    try {
      const res = await fetch(`${API_URL}/api/carts`, {
        method: "GET",
        credentials: "include",
      });

      if (res.status === 401) {
        router.replace(`/login?redirect=/shoppingcart`);
        return;
      }

      const json = await res.json();
      const items = json?.data?.items || [];

      const mapped: Product[] = items.map((ci: any) => {
        const effectivePrice: number = ci.unit_price;
        const originalPrice: number = ci.original_price ?? ci.unit_price;
        const hasDiscount = originalPrice > effectivePrice;
        const discountPct = hasDiscount
          ? Math.round((1 - effectivePrice / originalPrice) * 100)
          : undefined;

        return {
          cartItemId: ci.id_itemcart,
          id: ci.product.id_products,
          name: ci.product.name,
          branch: ci.product.brand,
          price: effectivePrice,
          discountedPrice: hasDiscount ? effectivePrice : null,
          originalPrice: hasDiscount ? originalPrice : undefined,
          discountPct,
          description: ci.product.short_description ?? "-",
          avatar: ci.product.images?.[0]?.url || "/image/logo_white.jpeg",
          quantity: ci.quantity,
          inventoryId: ci.inventory_id ?? null,
          isPreorder: ci.is_preorder === true,
        };
      });

      // Group items by product id — สินค้าตัวเดียวกันอยู่ติดกัน
      // Group order: by earliest cartItemId in group (ascending)
      // Within group: ascending by cartItemId
      const grouped = new Map<number, typeof mapped>();
      for (const item of mapped) {
        if (!grouped.has(item.id)) grouped.set(item.id, []);
        grouped.get(item.id)!.push(item);
      }
      for (const items of grouped.values()) {
        items.sort((a, b) => a.cartItemId - b.cartItemId);
      }
      const sortedGroups = [...grouped.entries()].sort(
        ([, a], [, b]) => a[0].cartItemId - b[0].cartItemId,
      );
      const sorted = sortedGroups.flatMap(([, items]) => items);

      setProducts(sorted);

      // auto-select item จาก buy now
      const buyNowInventoryId = sessionStorage.getItem("buynow_inventory_id");
      if (buyNowInventoryId) {
        sessionStorage.removeItem("buynow_inventory_id");
        const targetInventoryId = Number(buyNowInventoryId);
        const match = mapped.find((p) => p.inventoryId === targetInventoryId);
        if (match) {
          setSelectedIds([match.cartItemId]);
        } else if (mapped.length > 0) {
          setSelectedIds([mapped[0].cartItemId]);
        }
      }
    } catch (err) {
      console.error("Cart fetch error:", err);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    function handleUserLogout() {
      router.replace(`/login?redirect=/shoppingcart`);
    }
    window.addEventListener("user-logout", handleUserLogout);
    return () => window.removeEventListener("user-logout", handleUserLogout);
  }, [router]);

  const handleIncrease = async (cartItemId: number) => {
    const target = products.find((p) => p.cartItemId === cartItemId);
    if (!target) return;
    try {
      await fetch(`${API_URL}/api/carts/items/${cartItemId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: target.quantity + 1 }),
      });
      await loadCart();
      await refreshCart();
    } catch (err) {
      console.error("Increase quantity error:", err);
    }
  };

  const handleDecrease = async (cartItemId: number) => {
    const target = products.find((p) => p.cartItemId === cartItemId);
    if (!target) return;
    if (target.quantity - 1 < 1) {
      setConfirmDeleteId(cartItemId);
      return;
    }
    try {
      await fetch(`${API_URL}/api/carts/items/${cartItemId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: target.quantity - 1 }),
      });
      await loadCart();
      await refreshCart();
    } catch (err) {
      console.error("Decrease quantity error:", err);
    }
  };

  const confirmDeleteItem = async () => {
    if (!confirmDeleteId) return;
    try {
      await fetch(`${API_URL}/api/carts/items/${confirmDeleteId}`, {
        method: "DELETE",
        credentials: "include",
      });
      setConfirmDeleteId(null);
      await loadCart();
      await refreshCart();
    } catch (err) {
      console.error("Delete item error:", err);
    }
  };

  const toggleItem = (cartItemId: number) => {
    setSelectedIds((prev) =>
      prev.includes(cartItemId)
        ? prev.filter((id) => id !== cartItemId)
        : [...prev, cartItemId],
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) setSelectedIds([]);
    else setSelectedIds(products.map((p) => p.cartItemId));
    setSelectAll(!selectAll);
  };

  const selectedItems = products.filter((p) => selectedIds.includes(p.cartItemId));

  const selectedSummary = selectedItems.reduce(
    (acc, p) => acc + (p.discountedPrice ?? p.price) * p.quantity,
    0,
  );

  const totalSelectedQuantity = selectedItems.reduce((acc, p) => acc + p.quantity, 0);

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-5">🛒</div>
        <p className="text-[#5A7A98] text-lg font-medium mb-6">ยังไม่มีสินค้าในตะกร้า</p>
        <Link
          href="/product"
          className="inline-block px-6 py-2.5 text-sm font-bold btn-gold"
        >
          ดูสินค้าทั้งหมด
        </Link>
      </div>
    );
  }

  return (
    <div className={footerFixed ? "pb-24" : ""}>
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <span className="section-eyebrow-led mb-3">Shopping Cart</span>
        <h1 className="section-heading">ตะกร้าสินค้า</h1>
      </div>

      {/* Cart items */}
      <div className="space-y-3">
        {products.map((product) => (
          <div
            key={product.cartItemId}
            className="relative flex items-center gap-3 bg-[rgba(6,8,14,0.95)] border border-[rgba(0,207,255,0.1)] rounded-xl p-3 sm:p-4 hover:border-[rgba(0,207,255,0.2)] transition-colors"
          >
            {/* Checkbox */}
            <button
              onClick={() => toggleItem(product.cartItemId)}
              className={`w-5 h-5 shrink-0 rounded border flex items-center justify-center transition-all duration-150 ${
                selectedIds.includes(product.cartItemId)
                  ? "bg-[#00CFFF] border-[#00CFFF]"
                  : "border-[rgba(0,207,255,0.35)] bg-transparent hover:border-[rgba(0,207,255,0.7)]"
              }`}
            >
              {selectedIds.includes(product.cartItemId) && (
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="#060810" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 6l3 3 5-5" />
                </svg>
              )}
            </button>

            {/* Product image */}
            <Link href={`/detail_product/${product.id}`} className="shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-[#0a0c10] border border-[rgba(0,207,255,0.06)]">
                <img
                  src={product.avatar}
                  alt={product.name}
                  onError={(e) => (e.currentTarget.src = "/image/logo_white.jpeg")}
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 flex-wrap">
                <Link href={`/detail_product/${product.id}`} className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-[#E8F0F8] line-clamp-2 leading-snug hover:text-[#00CFFF] transition-colors">
                    {product.name}
                  </h3>
                </Link>
                {product.isPreorder && (
                  <span className="shrink-0 text-[9px] font-black tracking-widest text-[#D4AF37] border border-[rgba(212,175,55,0.5)] bg-[rgba(212,175,55,0.08)] px-1.5 py-0.5 rounded-sm uppercase whitespace-nowrap">
                    Preorder
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#5A7A98] mt-0.5">{product.branch}</p>

              {/* Price */}
              {product.originalPrice != null ? (
                <div className="flex flex-wrap items-baseline gap-1.5 mt-1.5">
                  <span className="text-xs text-[#445566] line-through">
                    ฿{product.originalPrice.toLocaleString()}
                  </span>
                  <span className="text-base sm:text-lg font-black text-[#D4AF37]">
                    ฿{product.price.toLocaleString()}
                  </span>
                  {product.discountPct != null && product.discountPct > 0 && (
                    <span className="text-[10px] font-bold bg-[rgba(212,175,55,0.2)] border border-[rgba(212,175,55,0.6)] text-[#F5CC40] px-1.5 py-0.5 rounded-sm shadow-[0_0_6px_rgba(212,175,55,0.3)]">
                      ลด {product.discountPct}%
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-base sm:text-lg font-black text-[#D4AF37] mt-1.5">
                  ฿{product.price.toLocaleString()}
                </p>
              )}
            </div>

            {/* Qty controls + delete */}
            <div className="flex flex-col items-end gap-2.5 shrink-0">
              {/* Delete */}
              <button
                onClick={() => setConfirmDeleteId(product.cartItemId)}
                className="text-[#3A5A78] hover:text-red-400 transition-colors"
                title="ลบสินค้า"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Qty */}
              <div className="flex items-center">
                <button
                  onClick={() => handleDecrease(product.cartItemId)}
                  className="w-7 h-7 flex items-center justify-center bg-[rgba(0,207,255,0.06)] border border-[rgba(0,207,255,0.2)] border-r-0 text-[#00CFFF] hover:bg-[rgba(0,207,255,0.15)] rounded-l-sm text-base font-bold transition"
                >
                  −
                </button>
                <span className="w-8 h-7 flex items-center justify-center bg-[rgba(0,207,255,0.04)] border border-[rgba(0,207,255,0.2)] text-[#E8F0F8] text-sm font-bold">
                  {product.quantity}
                </span>
                <button
                  onClick={() => handleIncrease(product.cartItemId)}
                  className="w-7 h-7 flex items-center justify-center bg-[rgba(0,207,255,0.06)] border border-[rgba(0,207,255,0.2)] border-l-0 text-[#00CFFF] hover:bg-[rgba(0,207,255,0.15)] rounded-r-sm text-base font-bold transition"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sentinel — marks natural footer position */}
      <div ref={sentinelRef} className="h-px" />

      {/* Footer bar */}
      <div className={`z-40 border-t border-[rgba(0,207,255,0.15)] bg-[rgba(4,5,10,0.97)] backdrop-blur-sm shadow-[0_-4px_20px_rgba(0,0,0,0.5)] ${footerFixed ? "fixed bottom-0 left-0 right-0" : "relative mt-6"}`}>
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 ${footerFixed ? "max-w-7xl mx-auto px-4" : ""}`}>
        {/* Select all */}
        <button onClick={toggleSelectAll} className="flex items-center gap-2">
          <div className={`w-5 h-5 shrink-0 rounded border flex items-center justify-center transition-all duration-150 ${
            selectAll
              ? "bg-[#00CFFF] border-[#00CFFF]"
              : "border-[rgba(0,207,255,0.35)] bg-transparent hover:border-[rgba(0,207,255,0.7)]"
          }`}>
            {selectAll && (
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="#060810" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 6l3 3 5-5" />
              </svg>
            )}
          </div>
          <span className="text-sm text-[#7A9AB8]">เลือกทั้งหมด ({products.length} ชิ้น)</span>
        </button>

        {/* Summary + order button */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-[#5A7A98]">รวม</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-[#D4AF37]">
                ฿{selectedSummary.toLocaleString()}
              </span>
              <span className="text-xs text-[#445566]">({totalSelectedQuantity} ชิ้น)</span>
            </div>
          </div>

          <Link
            href={{
              pathname: "/orderbuy",
              query: {
                items: JSON.stringify(
                  selectedItems.map((c) => ({
                    cartItemId: c.cartItemId,
                    id: c.id,
                    quantity: c.quantity,
                    price: c.discountedPrice ?? c.price,
                    name: c.name,
                    avatar: c.avatar,
                  })),
                ),
                itemcart_ids: JSON.stringify(selectedItems.map((c) => c.cartItemId)),
                total: selectedSummary,
                totalQuantity: totalSelectedQuantity,
              },
            }}
            className="btn-gold text-sm px-5 py-2.5 whitespace-nowrap"
          >
            สั่งซื้อสินค้า
          </Link>
        </div>
      </div>
      </div>

      {/* Bottom actions */}
      <div className="flex justify-end mt-4">
        <Link
          href="/product"
          className="px-4 py-2 text-sm border border-[rgba(0,207,255,0.25)] text-[#00CFFF] rounded-sm hover:border-[rgba(0,207,255,0.6)] hover:bg-[rgba(0,207,255,0.05)] transition-all"
        >
          ดูสินค้าเพิ่มเติม
        </Link>
      </div>

      {/* Confirm delete modal */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[rgba(6,8,14,0.98)] border border-[rgba(0,207,255,0.2)] rounded-xl p-6 shadow-[0_0_30px_rgba(0,207,255,0.1)] text-center w-72">
            <p className="text-base font-semibold text-[#E8F0F8] mb-5">
              ต้องการลบสินค้านี้ออกจากตะกร้าใช่ไหม?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={confirmDeleteItem}
                className="btn-gold px-6 py-2 text-sm"
              >
                ใช่ ลบออก
              </button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-6 py-2 text-sm border border-[rgba(0,207,255,0.3)] text-[#00CFFF] rounded-lg hover:bg-[rgba(0,207,255,0.08)] transition"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
