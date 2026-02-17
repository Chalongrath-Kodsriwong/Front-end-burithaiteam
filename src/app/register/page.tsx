import { Suspense } from "react";
import RegisterClient from "./section_register/RegisterClient";

export default function RegisterClientWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterClient />
    </Suspense>
  );
}
