"use client";

import { useState, Suspense } from "react";
import AddressLocation from "./section_orderbuy/addressOflocation";
import DetailOfSummaryProduct from "./section_orderbuy/detailOfsummaryproduct";
import PaymentSummary from "./section_orderbuy/paymentOfsummary";

export default function OrderPage() {
  const [addressId, setAddressId] = useState<number | null>(null);

  return (
    <div className="container px-0 py-4 mx-auto p-2">
      <h1 className="text-3xl font-bold mb-6 text-center">🛒 Order Details</h1>

      <Suspense fallback={<div>Loading...</div>}>
        <AddressLocation onAddressSelect={setAddressId} />
      </Suspense>

      <Suspense fallback={<div>Loading...</div>}>
        <DetailOfSummaryProduct />
      </Suspense>

      <Suspense fallback={<div>Loading...</div>}>
        <PaymentSummary addressId={addressId} />
      </Suspense>
    </div>
  );
}
