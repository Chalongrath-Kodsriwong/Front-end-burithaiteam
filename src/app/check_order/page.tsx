import { Suspense } from "react";
import CheckOrderClient from "./section_checkorder/CheckOrderClient";

export default function CheckOrderClientWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckOrderClient />
    </Suspense>
  );
}
