"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/app/context/CartContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function PaymentSummary({ addressId }: { addressId: number | null }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshCart } = useCart();

  const total = Number(searchParams.get("total") || 0);

  const itemcartIds: number[] = (() => {
    try {
      const raw = JSON.parse(searchParams.get("itemcart_ids") || "[]");
      return Array.isArray(raw) ? raw.map((x) => Number(x)).filter((x) => !Number.isNaN(x)) : [];
    } catch {
      return [];
    }
  })();

  const shippingFee = 0;
  const grandTotal = total + shippingFee;

  const [loading, setLoading] = useState(false);

  async function handleOrder() {
    const address_id = Number(addressId);
    if (!addressId || Number.isNaN(address_id)) {
      alert("กรุณาเลือกที่อยู่จัดส่ง");
      return;
    }
    if (!Array.isArray(itemcartIds) || itemcartIds.length === 0) {
      alert("ไม่พบสินค้าในตะกร้าที่เลือก");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address_id, shipping_fee: shippingFee, itemcart_ids: itemcartIds }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        alert(json?.message || json?.data?.message || `เกิดข้อผิดพลาดในการสั่งซื้อ (${res.status})`);
        return;
      }

      const createdOrder = json?.data?.data?.data || json?.data?.data || json?.data || null;
      const id_order = createdOrder?.id_order;
      const total_price = Number(createdOrder?.total_price);
      const finalTotal = !Number.isNaN(total_price) && total_price > 0 ? total_price : grandTotal;

      if (!id_order) {
        alert("สร้างออเดอร์ไม่สำเร็จ (ไม่พบ id_order จาก backend)");
        return;
      }

      await refreshCart();
      router.replace(`/payment?order_id=${id_order}&total_price=${finalTotal}`);
    } catch {
      alert("Server error. กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[rgba(6,8,14,0.95)] border border-[rgba(0,207,255,0.1)] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[rgba(0,207,255,0.08)]">
        <span className="text-xs font-bold tracking-widest text-[#00CFFF] uppercase">สรุปยอดชำระ</span>
      </div>

      <div className="px-4 py-4 space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-[#5A7A98]">รวมสินค้า</span>
          <span className="text-[#C8D8E8]">฿{total.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-[#5A7A98]">ค่าจัดส่ง</span>
          <span className="text-[#00CFFF]">ฟรี</span>
        </div>
        <div className="border-t border-[rgba(0,207,255,0.1)] pt-3 mt-1 flex justify-between items-center">
          <span className="text-sm font-semibold text-[#7A9AB8]">ยอดสุทธิ</span>
          <span className="text-2xl font-black text-[#D4AF37]">฿{grandTotal.toLocaleString()}</span>
        </div>
      </div>

      <div className="px-4 pb-4">
        <button
          onClick={handleOrder}
          disabled={loading}
          className={`w-full py-3 rounded-lg text-sm font-bold transition-all duration-200 active:scale-[0.98] ${
            loading
              ? "bg-[rgba(0,207,255,0.05)] text-[#5A7A98] cursor-not-allowed border border-[rgba(0,207,255,0.1)]"
              : "btn-gold"
          }`}
        >
          {loading ? "กำลังดำเนินการ..." : "ยืนยันการสั่งซื้อ"}
        </button>
      </div>
    </div>
  );
}
