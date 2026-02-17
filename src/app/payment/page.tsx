import { Suspense } from "react";
import PaymentClient from "./section_payment/PaymentClient";

export default function PaymentClientWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentClient />
    </Suspense>
  );
}
