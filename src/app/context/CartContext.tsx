"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface CartItem {
  cartItemId: number;
  id: number;
  variantId: number;
  inventoryId: number;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  refreshCart: () => Promise<void>;
  addToCart: (
    productId: number,
    qty: number,
    variantId: number,
    inventoryId: number
  ) => Promise<void>;
  increaseQuantity: (cartItemId: number) => Promise<void>;
  decreaseQuantity: (cartItemId: number) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  /* -------------------- โหลด Cart จาก Backend -------------------- */
  const refreshCart = async () => {
    try {
      const res = await fetch(`${API_URL}/api/carts`, {
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
    } catch (err) {
      console.error("Refresh cart error:", err);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  /* -------------------- เพิ่มสินค้า (จาก detail page) -------------------- */
  const addToCart = async (
    productId: number,
    qty: number,
    variantId: number,
    inventoryId: number
  ) => {
    const exist = cartItems.find(
      (i) =>
        i.id === productId &&
        i.variantId === variantId &&
        i.inventoryId === inventoryId
    );

    /* --- update quantity ถ้ามีสินค้าเดิม --- */
    if (exist) {
      await fetch(`${API_URL}/api/carts/items/${exist.cartItemId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: exist.quantity + qty }),
      });

      await refreshCart();
      return;
    }

    /* --- add new item --- */
    await fetch(`${API_URL}/api/carts/items`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        quantity: qty,
        variantId,
        inventoryId,
      }),
    });

    await refreshCart();
  };

  /* -------------------- เพิ่มทีละ 1 -------------------- */
  const increaseQuantity = async (cartItemId: number) => {
    const target = cartItems.find((c) => c.cartItemId === cartItemId);
    if (!target) return;

    await fetch(`${API_URL}/api/carts/items/${cartItemId}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: target.quantity + 1 }),
    });

    await refreshCart();
  };

  /* -------------------- ลดทีละ 1 -------------------- */
  const decreaseQuantity = async (cartItemId: number) => {
    const target = cartItems.find((c) => c.cartItemId === cartItemId);
    if (!target) return;

    await fetch(`${API_URL}/api/carts/items/${cartItemId}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: Math.max(target.quantity - 1, 1) }),
    });

    await refreshCart();
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        refreshCart,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
