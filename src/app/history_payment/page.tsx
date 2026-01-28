// ✅ สร้างหน้าใหม่: /app/order_history/page.tsx
// ใช้ API เดิม: GET http://localhost:8080/api/orders/users
// แสดงเฉพาะของ user ที่ login อยู่ (ฝั่ง backend จะคืนของ user นั้นเอง เพราะใช้ cookie session)

"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function thStatus(s?: string) {
  if (!s) return "-";
  if (s === "checking") return "กำลังดำเนินการ";
  if (s === "success") return "เสร็จสิ้น";
  if (s === "pending") return "รอชำระเงิน";
  if (s === "canceled") return "ยกเลิก";
  return s;
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // sort ล่าสุดขึ้นก่อน
  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const ta = new Date(a?.created_at || 0).getTime();
      const tb = new Date(b?.created_at || 0).getTime();
      return tb - ta;
    });
  }, [orders]);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_URL}/api/orders/users`, {
          method: "GET",
          credentials: "include", // ✅ Beer Token cookie
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(txt || `โหลดประวัติไม่สำเร็จ (${res.status})`);
        }

        const json = await res.json();
        setOrders(Array.isArray(json?.data) ? json.data : []);
      } catch (e: any) {
        setError(e?.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold">ประวัติการสั่งซื้อ</h1>
          <Link href="/products">
            <button className="border border-gray-400 bg-gray-200 px-5 py-2 font-semibold">
              กลับไปหน้าสินค้า
            </button>
          </Link>
        </div>

        {loading && (
          <div className="mt-6 border border-gray-300 bg-gray-100 p-4">
            กำลังโหลด...
          </div>
        )}

        {error && (
          <div className="mt-6 border border-red-300 bg-red-50 p-4 text-red-700 font-semibold">
            {error}
          </div>
        )}

        {!loading && !error && sortedOrders.length === 0 && (
          <div className="mt-6 border border-gray-300 bg-gray-100 p-6 text-gray-700">
            ยังไม่มีประวัติการสั่งซื้อ
          </div>
        )}

        <div className="mt-6 space-y-6">
          {sortedOrders.map((o) => (
            <div
              key={o.id_order}
              className="border border-gray-300 bg-gray-100 p-6"
            >
              {/* Header Order */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xl font-bold">
                  Order #{o.id_order}
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-lg font-semibold">
                    สถานะ:{" "}
                    <span
                      className={
                        o.status === "success"
                          ? "text-green-700"
                          : o.status === "checking"
                          ? "text-yellow-600"
                          : o.status === "canceled"
                          ? "text-red-600"
                          : "text-gray-700"
                      }
                    >
                      {thStatus(o.status)}
                    </span>
                  </div>

                  {/* ไปหน้าเช็คออเดอร์ (ใช้ของเดิม) */}
                  <Link href={`/check_order?order_id=${o.id_order}`}>
                    <button className="border border-gray-400 bg-gray-200 px-4 py-2 font-semibold">
                      ดูรายละเอียด
                    </button>
                  </Link>
                </div>
              </div>

              {/* Meta */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800">
                <div>
                  <div className="font-semibold">วันที่สั่งซื้อ</div>
                  <div>
                    {o.created_at
                      ? new Date(o.created_at).toLocaleString()
                      : "-"}
                  </div>
                </div>

                <div>
                  <div className="font-semibold">ราคารวมทั้งหมด</div>
                  <div>{o.dynamic_total_price ?? "-"}</div>
                </div>
              </div>

              {/* Shipping */}
              <div className="mt-4">
                <div className="font-semibold">ที่อยู่จัดส่ง</div>
                <pre className="whitespace-pre-wrap bg-white border border-gray-300 p-3 mt-2 text-sm">
                  {o.shipping_address || "-"}
                </pre>
              </div>

              {/* Items */}
              <div className="mt-6">
                <div className="font-semibold text-lg">รายการสินค้า</div>

                <div className="mt-3 space-y-4">
                  {(o.order_items || []).map((it: any) => (
                    <div
                      key={it.id_orderitem}
                      className="flex items-start gap-4 border border-gray-300 bg-white p-4"
                    >
                      <div className="w-20 h-20 bg-gray-200 border border-gray-300 overflow-hidden flex items-center justify-center">
                        {it.product_image ? (
                          <img
                            src={it.product_image}
                            alt={it.product_name || "product"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-gray-600">
                            no image
                          </span>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="font-bold text-lg">
                          {it.product_name || "-"}
                        </div>
                        <div className="text-gray-700">
                          {it.variant_name || "-"}
                          {it.inventory_name ? ` • ${it.inventory_name}` : ""}
                        </div>

                        <div className="mt-2 flex flex-wrap gap-6 font-semibold">
                          <div>จำนวน: {it.quantity ?? "-"}</div>
                          <div>ราคา: {it.dynamic_total ?? "-"}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracking */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <div className="font-semibold">
                  หมายเลขพัสดุ: {o.tracking_number || "-"}
                </div>

                <Link href={`/check_order?order_id=${o.id_order}`}>
                  <button className="border border-gray-400 bg-gray-200 px-5 py-2 font-semibold">
                    ไปหน้าเช็คสถานะ
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
