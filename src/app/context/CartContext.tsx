"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

import { CartItem, CartContextType} from "@/types/Cartcontext"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const FETCH_TIMEOUT_MS = 10_000;

function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  /* -------------------- โหลด Cart จาก Backend -------------------- */
  const refreshCart = async () => {
    try {
      const res = await fetchWithTimeout(`${API_URL}/api/carts`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) return;

      const json = await res.json();
      const mapped = json.data.items.map((item: any) => ({
        cartItemId: item.id_itemcart,
        id: item.id_products,
        variantId: item.variant_id,
        inventoryId: item.inventory_id,
        quantity: item.quantity,
      }));

      setCartItems(mapped);
    } catch (err: any) {
      if (err?.name !== "AbortError") console.error("Refresh cart error:", err);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  /* -------------------- เพิ่มสินค้า -------------------- */
  const addToCart = async (
    productId: number,
    qty: number,
    variantId: number,
    inventoryId: number
  ) => {
    const exist = cartItems.find(
      (i) => i.id === productId && i.variantId === variantId && i.inventoryId === inventoryId
    );

    try {
      if (exist) {
        await fetchWithTimeout(`${API_URL}/api/carts/items/${exist.cartItemId}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: exist.quantity + qty }),
        });
      } else {
        await fetchWithTimeout(`${API_URL}/api/carts/items`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity: qty, variantId, inventoryId }),
        });
      }
      await refreshCart();
    } catch (err: any) {
      if (err?.name !== "AbortError") console.error("addToCart error:", err);
    }
  };

  /* -------------------- เพิ่มทีละ 1 -------------------- */
  const increaseQuantity = async (cartItemId: number) => {
    const target = cartItems.find((c) => c.cartItemId === cartItemId);
    if (!target) return;
    try {
      await fetchWithTimeout(`${API_URL}/api/carts/items/${cartItemId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: target.quantity + 1 }),
      });
      await refreshCart();
    } catch (err: any) {
      if (err?.name !== "AbortError") console.error("increaseQuantity error:", err);
    }
  };

  /* -------------------- ลดทีละ 1 -------------------- */
  const decreaseQuantity = async (cartItemId: number) => {
    const target = cartItems.find((c) => c.cartItemId === cartItemId);
    if (!target) return;
    try {
      await fetchWithTimeout(`${API_URL}/api/carts/items/${cartItemId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: Math.max(target.quantity - 1, 1) }),
      });
      await refreshCart();
    } catch (err: any) {
      if (err?.name !== "AbortError") console.error("decreaseQuantity error:", err);
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, refreshCart, addToCart, increaseQuantity, decreaseQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
