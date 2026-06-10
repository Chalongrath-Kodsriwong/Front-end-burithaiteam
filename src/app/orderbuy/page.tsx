"use client";

import { useState, Suspense } from "react";
import AddressLocation from "./section_orderbuy/addressOflocation";
import DetailOfSummaryProduct from "./section_orderbuy/detailOfsummaryproduct";
import PaymentSummary from "./section_orderbuy/paymentOfsummary";

export default function OrderPage() {
  const [addressId, setAddressId] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex flex-col items-center text-center mb-10">
        <span className="section-eyebrow-led mb-3">Checkout</span>
        <h1 className="section-heading">ยืนยันการสั่งซื้อ</h1>
      </div>

      <div className="space-y-5">
        <Suspense fallback={<div className="text-[#5A7A98] text-center py-4">กำลังโหลด...</div>}>
          <AddressLocation onAddressSelect={setAddressId} />
        </Suspense>

        <Suspense fallback={<div className="text-[#5A7A98] text-center py-4">กำลังโหลด...</div>}>
          <DetailOfSummaryProduct />
        </Suspense>

        <Suspense fallback={<div className="text-[#5A7A98] text-center py-4">กำลังโหลด...</div>}>
          <PaymentSummary addressId={addressId} />
        </Suspense>
      </div>
    </div>
  );
}
