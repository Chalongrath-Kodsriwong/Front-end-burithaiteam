// src/app/components/TopNavbarWithCart.tsx
"use client";
import { CartProvider } from "@/app/context/CartContext";
import TopNavbar from "./Topnarbar";

export default function TopNavbarWithCart() {
  return (
    <CartProvider>
      <TopNavbar />
    </CartProvider>
  );
}
