// ✅ /check_order/page.tsx
// เปลี่ยน API จาก /api/orders/users -> /api/account/orders
// ✅ โครงสร้างหน้า + state + UI เดิม (order, items, status, progress, layout) ไว้เหมือนเดิม

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const CheckOrderPage = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusText = useMemo(() => {
    if (status === "checking") return "กำลังดำเนินการ";
    if (status === "success") return "เสร็จสิ้น";
    return "-";
  }, [status]);

  const progressPercent = useMemo(() => {
    if (status === "success") return 100;
    if (status === "checking") return 10;
    return 0;
  }, [status]);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      setLoading(true);
      setError(null);

      try {
        // ✅ เปลี่ยนมาใช้ API ใหม่
        const res = await fetch(`${API_URL}/api/account/orders`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          throw new Error(errText || "ไม่สามารถดึงข้อมูลออร์เดอร์ได้");
        }

        const json = await res.json();

        // ✅ โครงสร้างใหม่: data[].id_order
        const foundOrder = json?.data?.find(
          (o: any) => o.id_order === Number(orderId)
        );

        if (!foundOrder) throw new Error("ไม่พบคำสั่งซื้อที่ต้องการ");

        // ✅ คง state เดิม: order, items, status
        // - API ใหม่ใช้ items (แทน order_items)
        // - item ใหม่ใช้ imageUrl, name, id_orderitems
        // - แต่ UI เดิมอ้าง product_image, product_name, id_orderitem
        // 👉 จึง "map แปลงชื่อ field" ให้หน้าเดิมใช้ได้เหมือนเดิม
        setOrder(foundOrder);

        const mappedItems = Array.isArray(foundOrder.items)
          ? foundOrder.items.map((it: any) => ({
              // ให้ key เดิมยังทำงาน: it.id_orderitem
              id_orderitem: it?.id_orderitems ?? `${foundOrder.id_order}-${it?.name ?? "item"}`,
              product_image: it?.imageUrl ?? null,
              product_name: it?.name ?? null,
              variant_name: it?.variant_name ?? null,
              inventory_name: it?.inventory_name ?? null,
              quantity: it?.quantity ?? null,
              dynamic_total: it?.dynamic_total ?? it?.price ?? null,
            }))
          : [];

        setItems(mappedItems);
        setStatus(foundOrder.status || null);
      } catch (err: any) {
        setError(err?.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* ================= ที่อยู่การจัดส่ง ================= */}
        <div className="border border-gray-300 bg-gray-200 p-6">
          <h1 className="text-4xl font-bold">ที่อยู่การจัดส่ง</h1>
          <div className="mt-6 text-xl text-gray-700">
            {loading ? "กำลังโหลด..." : order?.shipping_address || "-"}
          </div>
        </div>

        {/* ================= สถานะสินค้า ================= */}
        <div className="mt-10 border border-gray-300 bg-gray-200 p-10">
          <div className="text-center">
            <div className="text-4xl font-bold">สถานะสินค้า...</div>
            <div className="mt-3 text-xl font-semibold text-yellow-500">
              {loading ? "กำลังโหลด..." : statusText}
            </div>
            {error && (
              <div className="mt-4 text-red-600 font-semibold">{error}</div>
            )}
          </div>

          {/* Progress */}
          <div className="mt-8">
            <div className="h-4 w-full rounded-full border border-black bg-gray-100 overflow-hidden">
              <div
                className="h-full bg-yellow-400 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-3 flex justify-between text-xl font-semibold">
              <span>กำลังดำเนินการ</span>
              <span>เสร็จสิ้น</span>
            </div>
          </div>

          {/* ================= รายการสินค้า: เพิ่มบล็อกตามจำนวนสินค้า ================= */}
          <div className="mt-10 space-y-10">
            {items.length === 0 ? (
              <div className="text-center text-gray-600 text-lg">
                {loading ? "กำลังโหลดรายการสินค้า..." : "ไม่พบรายการสินค้า"}
              </div>
            ) : (
              items.map((it: any) => (
                <div key={it.id_orderitem} className="flex items-start gap-10">
                  {/* รูปสินค้า */}
                  <div className="w-56 h-56 bg-gray-300 border border-gray-500 overflow-hidden flex items-center justify-center">
                    {it?.product_image ? (
                      <img
                        src={it.product_image}
                        alt={it.product_name || "product"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-semibold">รูปสินค้า</span>
                    )}
                  </div>

                  {/* ชื่อและรายละเอียด + จำนวน/ราคา */}
                  <div className="flex-1">
                    <div className="text-2xl font-semibold">
                      ชื่อและรายละเอียดสินค้า
                    </div>

                    <div className="mt-4 text-lg text-gray-700 space-y-1">
                      <div className="font-semibold">
                        {it?.product_name || "-"}
                      </div>
                      <div className="text-gray-600">
                        {it?.variant_name || "-"}
                        {it?.inventory_name ? ` • ${it.inventory_name}` : ""}
                      </div>
                    </div>

                    <div className="mt-16 flex justify-end gap-24 text-xl font-semibold">
                      <div>จำนวน: {it?.quantity ?? "-"}</div>
                      <div>ราคา: {it?.dynamic_total ?? "-"}</div>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* เส้นคั่น + ราคารวม */}
            <div className="border-t border-gray-500 pt-6 flex justify-end text-xl font-semibold">
              ราคารวมทั้งหมด: {order?.dynamic_total_price ?? "-"}
            </div>
          </div>
        </div>

        {/* ================= ข้อมูลการจัดส่ง ================= */}
        <div className="mt-10 border border-gray-300 bg-gray-200 p-10">
          <div className="text-center text-4xl font-bold">ข้อมูลการจัดส่ง</div>

          <div className="mt-10 text-2xl">
            <div>จัดส่งแบบธรรมดา (Standard International Delivery)</div>

            <div className="mt-10 flex items-center gap-6">
              <div className="font-semibold">
                หมายเลขพัสดุ: {order?.tracking_number || "xxxxxxxxxxx"}
              </div>
              <button className="text-gray-500 underline">
                คัดลอกหมายเลขพัสดุ
              </button>
            </div>
          </div>
        </div>

        {/* ================= ปุ่มล่าง ================= */}
        <div className="mt-14 flex justify-end gap-10">
          <Link href="/product">
            <button className="border border-gray-400 bg-gray-200 px-10 py-4 text-xl font-semibold">
              กลับไปหน้าสินค้า
            </button>
          </Link>

          <Link href="/shoppingcart">
            <button className="border border-gray-400 bg-gray-200 px-10 py-4 text-xl font-semibold">
              สั่งซื้ออีกครั้ง
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckOrderPage;
