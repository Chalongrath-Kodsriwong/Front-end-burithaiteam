"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface Product {
  cartItemId: number;
  id: number;
  name: string;
  branch: string;
  price: number;
  description: string;
  avatar: string;
  quantity: number;
}

export default function DisplayItemCart() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [error, setError] = useState<string | null>(null); // Store error messages

  const router = useRouter();

  const { refreshCart } = useCart();  // Get refreshCart from context

  const loadCart = async () => {
    try {
      const res = await fetch(`${API_URL}/api/carts`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
    // console.error("Failed to load cart.");
    // setError("Failed to load cart."); // Set error message
    // Redirect to login page, passing the current page as the redirect URL
    router.replace(`/login?redirect=/shoppingcart`);
    return;
}

if (res.ok) {
    // Redirect to shopping cart if the user is authenticated
    router.replace(`/shoppingcart`);
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
      setError(null); // Clear error if loading is successful
    } catch (err) {
      console.error("Cart fetch error:", err);
      setError("Failed to load cart."); // Set error message
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  // Handle increasing quantity
  const handleIncrease = async (cartItemId: number) => {
    const target = products.find(p => p.cartItemId === cartItemId);
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
      await refreshCart();   // Update context in real-time
    } catch (err) {
      console.error("Increase quantity error:", err);
    }
  };

  // Handle decreasing quantity
  const handleDecrease = async (cartItemId: number) => {
    const target = products.find(p => p.cartItemId === cartItemId);
    if (!target) return;

    const newQty = target.quantity - 1;
    if (newQty < 1) return;

    try {
      await fetch(`${API_URL}/api/carts/items/${cartItemId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQty }),
      });

      await loadCart();
      await refreshCart();  // Update context in real-time
    } catch (err) {
      console.error("Decrease quantity error:", err);
    }
  };

  const toggleItem = (cartItemId: number) => {
    setSelectedIds((prev) =>
      prev.includes(cartItemId)
        ? prev.filter((id) => id !== cartItemId)
        : [...prev, cartItemId]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) setSelectedIds([]);
    else setSelectedIds(products.map((p) => p.cartItemId));
    setSelectAll(!selectAll);
  };

  const selectedItems = products.filter((p) =>
    selectedIds.includes(p.cartItemId)
  );

  const selectedSummary = selectedItems.reduce(
    (acc, p) => acc + p.price * p.quantity,
    0
  );

  const totalSelectedQuantity = selectedItems.reduce(
    (acc, p) => acc + p.quantity,
    0
  );

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

              <img
                src={product.avatar}
                alt={product.name}
                className="w-24 h-24 object-cover rounded mx-auto"
              />

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-grow text-center md:text-left">
                <h3 className="font-semibold">{product.name}</h3>
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

              <Link
                href={`/detail_product/${product.id}`}
                className="text-blue-600 underline hover:text-blue-800 whitespace-nowrap"
              >
                View Product
              </Link>
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
                Total: {selectedSummary} THB | Selected:{" "}
                {totalSelectedQuantity}
              </h3>
            </div>

            <div className="col-span-2 flex justify-end">
              <Link
                href={{
                  pathname: "/orderbuy",
                  query: {
                    items: JSON.stringify(
                      selectedItems.map((c) => ({
                        id: c.id,
                        quantity: c.quantity,
                      }))
                    ),
                    total: selectedSummary,
                    totalQuantity: totalSelectedQuantity,
                  },
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Order Selected
              </Link>
            </div>
          </div>

          <div className="text-right mt-6 space-x-4">
            <Link
              href="/product"
              className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Browse Products
            </Link>
            <button className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
