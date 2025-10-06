"use client";
import "flowbite";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function PaymentSummary() {
  const searchParams = useSearchParams();
  const totalParam = searchParams.get("total");
  const total = totalParam ? parseFloat(totalParam) : 0;
  const shippingFee = 30;
  const grandTotal = useMemo(() => total + shippingFee, [total]);

  return (
    <div>
      {/* ยังไม่ได้ทำช่องทางการจ่ายเงิน */}
      <div className="mb-4 flex justify-between border-b border-gray-300 pb-4">
        <h2 className="text-xl font-semibold mb-4">ยอดรวมทั้งหมด</h2>
        <div className="flex flex-col items-center">
            <h2 className="text-lg font-semibold">เลือกช่องทางการชำระเงิน</h2>
            <select className="border border-gray-300 rounded-md p-2">
              <option value="credit-card">บัตรเครดิต/เดบิต</option>
              <option value="paypal">PayPal</option>
              <option value="bank-transfer">โอนผ่านธนาคาร</option>
            </select>
        </div>
      </div>
      <div>
        <div className="flex flex-col flex-end items-end gap-2">
          <h2 className="text-lg font-semibold">รวมการสั่งซื้อ
            <span className="text-blue-600"> {total.toFixed(2)} THB</span>
          </h2>
          <h2 className="text-lg font-semibold">ค่าจัดส่ง
            <span className="text-blue-600"> {shippingFee.toFixed(2)} THB</span>
          </h2>
          <h2 className="text-lg font-semibold">ยอดชำระทั้งหมด
            <span className="text-blue-600"> {grandTotal.toFixed(2)} THB</span>
          </h2>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            ยืนยันการชำระเงิน
          </button>
        </div>
      </div>
    </div>
  );
}
