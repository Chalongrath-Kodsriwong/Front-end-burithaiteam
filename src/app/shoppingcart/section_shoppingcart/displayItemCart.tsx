"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";

import { Product } from "@/types/DisplayItemCart";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function DisplayItemCart() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [error, setError] = useState<string | null>(null); // Store error messages
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const router = useRouter();

  const { refreshCart } = useCart(); // Get refreshCart from context

  const loadCart = async () => {
    try {
      const res = await fetch(`${API_URL}/api/carts`, {
        method: "GET",
        credentials: "include",
      });

      if (res.status === 401) {
        router.replace(`/login?redirect=/shoppingcart`);
        return;
      }

      const json = await res.json();
      const items = json?.data?.items || [];

      const mapped: Product[] = items.map((ci: any) => ({
        cartItemId: ci.id_itemcart,
        id: ci.product.id_products,
        name: ci.product.name,
        branch: ci.product.brand,
        price: ci.unit_price,
        description: ci.product.short_description ?? "-",
        avatar: ci.product.images?.[0]?.url || "/image/logo_white.jpeg",
        quantity: ci.quantity,
      }));

      mapped.sort((a, b) => b.cartItemId - a.cartItemId);

      setProducts(mapped);
      setError(null);
    } catch (err) {
      console.error("Cart fetch error:", err);
      setError("Failed to load cart.");
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  // Handle increasing quantity
  const handleIncrease = async (cartItemId: number) => {
    const target = products.find((p) => p.cartItemId === cartItemId);
    if (!target) return;

    const newQty = target.quantity + 1;

    try {
      await fetch(`${API_URL}/api/carts/items/${cartItemId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQty }),
      });

      await loadCart();
      await refreshCart(); // Update context in real-time
    } catch (err) {
      console.error("Increase quantity error:", err);
    }
  };

  // Handle decreasing quantity
  const handleDecrease = async (cartItemId: number) => {
    const target = products.find((p) => p.cartItemId === cartItemId);
    if (!target) return;

    const newQty = target.quantity - 1;

    // ⭐ ถ้าจำนวนจะกลายเป็น 0 → เปิด popup แทน
    if (newQty < 1) {
      setConfirmDeleteId(cartItemId);
      return;
    }

    try {
      await fetch(`${API_URL}/api/carts/items/${cartItemId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQty }),
      });

      await loadCart();
      await refreshCart();
    } catch (err) {
      console.error("Decrease quantity error:", err);
    }
  };

  // Handle delete single item
  const handleDelete = async (cartItemId: number) => {
    try {
      await fetch(`${API_URL}/api/carts/items/${cartItemId}`, {
        method: "DELETE",
        credentials: "include",
      });

      await loadCart(); // โหลดข้อมูลใหม่
      await refreshCart(); // อัปเดต Context → ตัวเลข basket บน navbar อัปเดตทันที
    } catch (err) {
      console.error("Delete item error:", err);
    }
  };

  const confirmDeleteItem = async () => {
    if (!confirmDeleteId) return;

    try {
      await fetch(`${API_URL}/api/carts/items/${confirmDeleteId}`, {
        method: "DELETE",
        credentials: "include",
      });

      setConfirmDeleteId(null);
      await loadCart();
      await refreshCart();
    } catch (err) {
      console.error("Delete item error:", err);
    }
  };

  const toggleItem = (cartItemId: number) => {
    setSelectedIds((prev) =>
      prev.includes(cartItemId)
        ? prev.filter((id) => id !== cartItemId)
        : [...prev, cartItemId],
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) setSelectedIds([]);
    else setSelectedIds(products.map((p) => p.cartItemId));
    setSelectAll(!selectAll);
  };

  const selectedItems = products.filter((p) =>
    selectedIds.includes(p.cartItemId),
  );

  const selectedSummary = selectedItems.reduce(
    (acc, p) => acc + p.price * p.quantity,
    0,
  );

  const totalSelectedQuantity = selectedItems.reduce(
    (acc, p) => acc + p.quantity,
    0,
  );

  useEffect(() => {
    function handleUserLogout() {
      router.replace(`/login?redirect=/shoppingcart`);
    }

    window.addEventListener("user-logout", handleUserLogout);

    return () => window.removeEventListener("user-logout", handleUserLogout);
  }, [router]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-center">🛒 Shopping Cart</h1>

      {/* Error Message for Failed Cart Loading */}
      {/* {error && (
        <div className="text-center text-red-500 mb-4">
          <p>{error}</p>
          <Link href="/login?redirect=/shoppingcart">
            <button className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Login
            </button>
          </Link>
        </div>
      )} */}

      {/* No items in cart */}
      {products.length === 0 && !error ? (
        <div className="text-center text-gray-500">
          <p>No items in cart.</p>
          <Link
            href="/product"
            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.cartItemId}
              className="relative flex flex-col text-center md:flex-row md:items-center justify-between border p-4 rounded-lg shadow-sm gap-4"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(product.cartItemId)}
                onChange={() => toggleItem(product.cartItemId)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 md:static md:translate-y-0"
              />
              <Link href={`/detail_product/${product.id}`}>
                <img
                  src={product.avatar}
                  alt={product.name}
                  className="w-24 h-24 object-cover rounded mx-auto"
                />
              </Link>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-grow text-center md:text-left">
                <Link href={`/detail_product/${product.id}`}>
                  <h3 className="font-semibold">{product.name}</h3>
                </Link>
                <p className="text-gray-600">Brand: {product.branch}</p>
                <p className="text-gray-600">Price: {product.price} THB</p>

                <div className="text-sm text-gray-500 flex items-center justify-center gap-2">
                  <button
                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    onClick={() => handleDecrease(product.cartItemId)}
                  >
                    -
                  </button>

                  <span>{product.quantity}</span>

                  <button
                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    onClick={() => handleIncrease(product.cartItemId)}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* <Link
                href={`/detail_product/${product.id}`}
                className="text-blue-600 underline hover:text-blue-800 whitespace-nowrap"
              >
                View Product
              </Link> */}

              <button
                onClick={() => handleDelete(product.cartItemId)}
                className="ml-4 text-red-600 hover:text-red-800"
                title="Delete Item"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-7 h-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0h-2.5m-5 0H7m3-3h4a1 1 0 011 1v1H9V5a1 1 0 011-1z"
                  />
                </svg>
              </button>

              {confirmDeleteId !== null && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg text-center w-72">
                    <h3 className="text-lg font-semibold mb-4">
                      คุณต้องการลบสินค้านี้ใช่ไหม?
                    </h3>

                    <div className="flex justify-around mt-4">
                      <button
                        onClick={confirmDeleteItem}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        ใช่
                      </button>

                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        ไม่
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="grid grid-cols-9 gap-4 items-center border-t-2 border-b-2 pt-4 font-bold pb-4">
            <div className="col-span-2 flex items-center gap-2 justify-start">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={toggleSelectAll}
              />
              <label className="text-sm">Select All Items</label>
            </div>

            <div className="col-span-5 flex justify-end">
              <h3>
                Total: {selectedSummary} THB | Selected: {totalSelectedQuantity}
              </h3>
            </div>

            <div className="col-span-2 flex justify-end">
              <Link
                href={{
                  pathname: "/orderbuy",
                  query: {
                    items: JSON.stringify(
                      selectedItems.map((c) => ({
                        cartItemId: c.cartItemId, // สำคัญมาก!
                        id: c.id,
                        quantity: c.quantity,
                        price: c.price,
                        name: c.name,
                        avatar: c.avatar,
                      })),
                    ),
                    itemcart_ids: JSON.stringify(
                      selectedItems.map((c) => c.cartItemId),
                    ),
                    total: selectedSummary,
                    totalQuantity: totalSelectedQuantity,
                  },
                }}
                className="relative inline-block mt-4 px-4 py-2 text-yellow-500 rounded overflow-hidden bg-black
      [text-shadow:0_0_0_rgba(255,215,0,0)] hover:text-[rgb(255,215,0)]
      hover:[text-shadow:0_0_6px_rgba(255,215,0,0.45),0_0_12px_rgba(255,215,0,0.30),0_0_20px_rgba(212,175,55,0.20)]
      hover:bg-gray-900 focus:bg-gray-900 transition-all duration-500 ease-out"
              >
                {/* 🌟 Dark Gold Fade Background */}
                <div
                  className="absolute inset-0 pointer-events-none
        bg-[linear-gradient(to_top,_rgba(212,175,55,0.16)_0%,_rgba(212,175,55,0.06)_25%,_rgba(212,175,55,0)_60%)]"
                ></div>
                <span className="relative z-10">Order Selected</span>
              </Link>
            </div>
          </div>

          <div className="mt-6 flex justify-end items-center gap-4">
            <Link
              href="/product"
              className="relative inline-block px-4 py-2 text-yellow-500 rounded overflow-hidden bg-black
      [text-shadow:0_0_0_rgba(255,215,0,0)] hover:text-[rgb(255,215,0)]
      hover:[text-shadow:0_0_6px_rgba(255,215,0,0.45),0_0_12px_rgba(255,215,0,0.30),0_0_20px_rgba(212,175,55,0.20)]
      hover:bg-gray-900 focus:bg-gray-900 transition-all duration-500 ease-out"
            >
              <div
                className="absolute inset-0 pointer-events-none
        bg-[linear-gradient(to_top,_rgba(212,175,55,0.16)_0%,_rgba(212,175,55,0.06)_25%,_rgba(212,175,55,0)_60%)]"
              ></div>
              <span className="relative z-10">Browse Products</span>
            </Link>
            
            <button
              className="relative inline-block px-4 py-2 text-yellow-500 rounded overflow-hidden bg-black
      [text-shadow:0_0_0_rgba(255,215,0,0)] hover:text-[rgb(255,215,0)]
      hover:[text-shadow:0_0_6px_rgba(255,215,0,0.45),0_0_12px_rgba(255,215,0,0.30),0_0_20px_rgba(212,175,55,0.20)]
      hover:bg-gray-900 focus:bg-gray-900 transition-all duration-500 ease-out"
            >
              <div
                className="absolute inset-0 pointer-events-none
        bg-[linear-gradient(to_top,_rgba(212,175,55,0.16)_0%,_rgba(212,175,55,0.06)_25%,_rgba(212,175,55,0)_60%)]"
              ></div>
              <span className="relative z-10">Proceed to Checkout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
