import { Suspense } from "react";
import ProductClient from "./ProductClient";

export default function ProductClientWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductClient />
    </Suspense>
  );
}
