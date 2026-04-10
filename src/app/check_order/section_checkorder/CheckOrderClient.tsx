"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MdContentCopy } from "react-icons/md";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const CheckOrderPage = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const statusText = useMemo(() => {
    if (status === "checking") return "กําลังดําเนินการ";
    if (status === "success") return "เสร็จสิ้น";
    if (status === "pending") return "รอชําระเงิน";
    if (status === "canceled") return "ยกเลิก";
    if (status === "confirmed") return "ยืนยันคําสั่งซื้อแล้ว";
    return "-";
  }, [status]);

  const progressPercent = useMemo(() => {
    if (status === "success") return 100;
    if (status === "confirmed") return 70;
    if (status === "checking") return 40;
    if (status === "pending") return 20;
    return 0;
  }, [status]);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async (showLoader = false) => {
      if (showLoader) setLoading(true);

      try {
        const res = await fetch(`${API_URL}/api/account/orders`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          throw new Error(errText || "ไม่สามารถดึงข้อมูลออร์เดอร์ได้");
        }

        const json = await res.json();

        const foundOrder = json?.data?.find(
          (o: any) => o.id_order === Number(orderId)
        );

        if (!foundOrder) throw new Error("ไม่พบคําสั่งซื้อที่ต้องการ");

        setOrder(foundOrder);

        const mappedItems = Array.isArray(foundOrder.items)
          ? foundOrder.items.map((it: any) => ({
              id_orderitem:
                it?.id_orderitems ??
                `${foundOrder.id_order}-${it?.name ?? "item"}`,
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
        setError(null);
      } catch (err: any) {
        setError(err?.message || "เกิดข้อผิดพลาด");
      } finally {
        if (showLoader) setLoading(false);
      }
    };

    fetchOrder(true);

    // Auto-refresh every 5s so tracking number and status update from management.
    const pollingId = window.setInterval(() => {
      fetchOrder(false);
    }, 5000);

    // Also refresh when user returns to this tab/window.
    const refreshNow = () => fetchOrder(false);
    window.addEventListener("focus", refreshNow);
    document.addEventListener("visibilitychange", refreshNow);

    return () => {
      window.clearInterval(pollingId);
      window.removeEventListener("focus", refreshNow);
      document.removeEventListener("visibilitychange", refreshNow);
    };
  }, [orderId]);

  const actionButtonClass =
    "relative inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-yellow-500 rounded overflow-hidden bg-black [text-shadow:0_0_0_rgba(255,215,0,0)] hover:text-[rgb(255,215,0)] hover:[text-shadow:0_0_6px_rgba(255,215,0,0.45),0_0_12px_rgba(255,215,0,0.30),0_0_20px_rgba(212,175,55,0.20)] hover:bg-gray-900 focus:bg-gray-900 transition-all duration-500 ease-out";

  const handleCopyTracking = async () => {
    if (!order?.tracking_number) return;
    try {
      await navigator.clipboard.writeText(String(order.tracking_number));
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      console.error("Copy tracking failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl md:text-3xl font-bold">ที่อยู่การจัดส่ง</h1>
          <div className="mt-4 text-base md:text-lg text-gray-700 whitespace-pre-wrap">
            {loading ? "กําลังโหลด..." : order?.shipping_address || "-"}
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold">สถานะสินค้า</div>
            <div className="mt-3 text-lg md:text-xl font-semibold text-yellow-600">
              {loading ? "กําลังโหลด..." : statusText}
            </div>
            {error && <div className="mt-4 text-red-600 font-semibold">{error}</div>}
          </div>

          <div className="mt-8">
            <div className="h-3 w-full rounded-full border border-gray-300 bg-gray-100 overflow-hidden">
              <div
                className="h-full bg-yellow-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-3 flex justify-between text-sm md:text-base font-semibold text-gray-700">
              <span>เริ่มดําเนินการ</span>
              <span>เสร็จสิ้น</span>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {items.length === 0 ? (
              <div className="text-center text-gray-600 text-lg">
                {loading ? "กําลังโหลดรายการสินค้า..." : "ไม่พบรายการสินค้า"}
              </div>
            ) : (
              items.map((it: any) => (
                <div
                  key={it.id_orderitem}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-4 md:p-5"
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
                    <div className="w-full md:w-40 h-40 bg-white border border-gray-300 overflow-hidden flex items-center justify-center rounded">
                      {it?.product_image ? (
                        <img
                          src={it.product_image}
                          alt={it.product_name || "product"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-base font-semibold text-gray-600">รูปสินค้า</span>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="text-lg md:text-xl font-semibold">
                        {it?.product_name || "-"}
                      </div>
                      <div className="mt-1 text-sm md:text-base text-gray-600">
                        {it?.variant_name || "-"}
                        {it?.inventory_name ? ` • ${it.inventory_name}` : ""}
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:text-base">
                        <div className="font-semibold text-gray-700">
                          จํานวน: {it?.quantity ?? "-"}
                        </div>
                        <div className="font-semibold text-gray-700 text-right">
                          ราคา: {it?.dynamic_total ?? "-"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            <div className="border-t border-gray-300 pt-6 flex justify-end text-lg md:text-xl font-semibold">
              ราคารวมทั้งหมด: {order?.dynamic_total_price ?? "-"}
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
          <div className="text-center text-2xl md:text-3xl font-bold">ข้อมูลการจัดส่ง</div>

          <div className="mt-6 text-base md:text-xl">
            <div>จัดส่งแบบธรรมดา (Standard International Delivery)</div>

            <div className="mt-6 flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
              <div className="font-semibold break-all">
                หมายเลขพัสดุ: {order?.tracking_number || "xxxxxxxxxxx"}
              </div>
              <button
                onClick={handleCopyTracking}
                disabled={!order?.tracking_number}
                className="inline-flex items-center gap-1 whitespace-nowrap text-sm text-gray-600 underline disabled:opacity-50"
              >
               <MdContentCopy className="shrink-0" size={16} />
                {copied ? "คัดลอกแล้ว" : "คัดลอกหมายเลขพัสดุ"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap justify-end gap-4">
          <Link href="/product">
            <button className={actionButtonClass}>
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_top,_rgba(212,175,55,0.16)_0%,_rgba(212,175,55,0.06)_25%,_rgba(212,175,55,0)_60%)]" />
              <span className="relative z-10">กลับไปหน้าสินค้า</span>
            </button>
          </Link>

          <Link href="/shoppingcart">
            <button className={actionButtonClass}>
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_top,_rgba(212,175,55,0.16)_0%,_rgba(212,175,55,0.06)_25%,_rgba(212,175,55,0)_60%)]" />
              <span className="relative z-10">สั่งซื้ออีกครั้ง</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckOrderPage;
