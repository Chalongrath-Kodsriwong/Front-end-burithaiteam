"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/app/context/CartContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function PaymentSummary({ addressId }: any) {
  const searchParams = useSearchParams();

  const total = Number(searchParams.get("total") || 0);

  // ⭐ รับ itemcart_ids ที่ส่งมาจากหน้า cart
  const itemcartIds = (() => {
    try {
      return JSON.parse(searchParams.get("itemcart_ids") || "[]");
    } catch (err) {
      console.error("Failed to parse itemcart_ids:", err);
      return [];
    }
  })();

  const router = useRouter();
  const { refreshCart } = useCart();

  const shippingFee = 50;
  const grandTotal = total + shippingFee;

  const [loading, setLoading] = useState(false);

  // 🔥 ฟังก์ชันสร้างคำสั่งซื้อจริง
  async function handleOrder() {
    if (!addressId) {
      alert("กรุณาเลือกที่อยู่จัดส่ง");
      return;
    }

    if (!Array.isArray(itemcartIds) || itemcartIds.length === 0) {
      alert("ไม่พบสินค้าในตะกร้าที่เลือก");
      console.error("itemcart_ids invalid:", itemcartIds);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address_id: addressId,
          shipping_fee: shippingFee,
          itemcart_ids: itemcartIds,  // ⭐ ส่งให้ backend ใช้สร้าง order_items
        }),
      });

      if (res.status === 401) {
        alert("กรุณาเข้าสู่ระบบใหม่");
        router.replace(`/login?redirect=/orderbuy`);
        return;
      }

      const json = await res.json();

      if (!res.ok) {
        alert(json.message || "เกิดข้อผิดพลาดในการสั่งซื้อ");
        return;
      }

      // ⭐ เคลียร์ตะกร้าเฉพาะรายการที่สั่ง
      await refreshCart();

      // ⭐ ไปหน้า success พร้อม order_id
      router.replace(`/orderbuy/success?order_id=${json.data.id_order}`);

    } catch (err) {
      console.error("Order error:", err);
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
