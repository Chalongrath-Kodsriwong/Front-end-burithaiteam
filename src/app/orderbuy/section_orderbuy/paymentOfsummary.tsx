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
      // กันพัง + บังคับเป็น number
      return Array.isArray(raw) ? raw.map((x) => Number(x)).filter((x) => !Number.isNaN(x)) : [];
    } catch (err) {
      console.error("[orderbuy] Failed to parse itemcart_ids:", err);
      return [];
    }
  })();

  const shippingFee = 0;
  const grandTotal = total + shippingFee;

  const [loading, setLoading] = useState(false);

  async function handleOrder() {
    console.log("[orderbuy] addressId:", addressId);
    console.log("[orderbuy] itemcartIds:", itemcartIds);
    console.log("[orderbuy] total:", total, "shippingFee:", shippingFee, "grandTotal:", grandTotal);

    const address_id = Number(addressId);
    if (!addressId || Number.isNaN(address_id)) {
      alert("กรุณาเลือกที่อยู่จัดส่ง");
      return;
    }

    if (!Array.isArray(itemcartIds) || itemcartIds.length === 0) {
      alert("ไม่พบสินค้าในตะกร้าที่เลือก");
      console.error("[orderbuy] itemcart_ids invalid:", itemcartIds);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        address_id,
        shipping_fee: shippingFee,
        itemcart_ids: itemcartIds,
      };

      console.log("[orderbuy] create order payload:", payload);

      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);
      console.log("[orderbuy] create order response:", json);

      if (!res.ok) {
        alert(json?.message || json?.data?.message || `เกิดข้อผิดพลาดในการสั่งซื้อ (${res.status})`);
        return;
      }

      // ✅ รองรับหลายรูปแบบ response
      // แบบที่คุณบอก: { status, message, data: { status, message, data: order } }
      // หรือบางทีอาจเป็น: { status, data: order }
      const createdOrder =
        json?.data?.data?.data || // ซ้อน 3 ชั้น (เผื่อบางที)
        json?.data?.data ||      // ซ้อน 2 ชั้น (ตามที่คุณคอมเมนต์)
        json?.data ||            // ไม่ซ้อน
        null;

      const id_order = createdOrder?.id_order;
      const total_price_raw = createdOrder?.total_price;

      const total_price = Number(total_price_raw);
      const finalTotalForPayment =
        !Number.isNaN(total_price) && total_price > 0 ? total_price : grandTotal;

      console.log("[orderbuy] createdOrder:", createdOrder);
      console.log("[orderbuy] extracted id_order:", id_order);
      console.log("[orderbuy] extracted total_price:", total_price_raw, "=> final:", finalTotalForPayment);

      if (!id_order) {
        alert("สร้างออเดอร์ไม่สำเร็จ (ไม่พบ id_order จาก backend)");
        return;
      }

      await refreshCart();

      // ✅ ส่งทั้ง id_order และ total_price ไปหน้า payment
      router.replace(`/payment?order_id=${id_order}&total_price=${finalTotalForPayment}`);
    } catch (err) {
      console.error("[orderbuy] Order error:", err);
      alert("Server error. กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="text-right mt-6">
      <h2 className="text-lg font-semibold">
        รวมสินค้า: <span className="text-blue-600">{total} THB</span>
      </h2>

      <h2 className="text-lg font-semibold">
        ค่าจัดส่ง: <span className="text-blue-600">{shippingFee} THB</span>
      </h2>

      <h2 className="text-xl font-bold">
        ยอดสุทธิ: <span className="text-blue-600">{grandTotal.toFixed(2)} THB</span>
      </h2>

      <button
        onClick={handleOrder}
        disabled={loading}
        className={`mt-4 px-4 py-2 text-white rounded ${
          loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "กำลังดำเนินการ..." : "ยืนยันการสั่งซื้อ"}
      </button>
    </div>
  );
}
