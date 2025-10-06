"use client";
import "flowbite";
import { useEffect, useState } from "react";

import AddressLocation from "./section_orderbuy/addressOflocation";
import DetailOfSummaryProduct from "./section_orderbuy/detailOfsummaryproduct";
import PaymentSummary from "./section_orderbuy/paymentOfsummary";

export default function OrderPage() {
  return (
    <>
    <div className="container px-0 py-4 mx-auto p-2">
      <h1 className="text-3xl font-bold mb-6 text-center">🛒 Order Details</h1>
      <div>
        <AddressLocation />
      </div>
      
      <div className="my-6">
        <DetailOfSummaryProduct />
      </div>

      <div>
        <PaymentSummary />
      </div>
    </div>
    </>
  );
}
