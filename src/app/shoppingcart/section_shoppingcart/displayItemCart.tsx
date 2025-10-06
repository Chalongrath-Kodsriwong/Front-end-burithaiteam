"use client";

import { useCart } from "@/app/context/CartContext";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Product {
  id: string;
  name: string;
  branch: string;
  price: number;
  description: string;
  avatar: string;
}

export default function DisplayItemCart() {
  const { cartItems, increaseQuantity, decreaseQuantity } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      const fetchedProducts = await Promise.all(
        cartItems.map(async (item) => {
          const res = await fetch(`http://localhost:3000/products/${item.id}`);
          const data = await res.json();
          return { ...data };
        })
      );
      setProducts(fetchedProducts);
    };

    if (cartItems.length > 0) fetchProducts();
  }, [cartItems]);

  const toggleItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.id));
    }
    setSelectAll(!selectAll);
  };

  const selectedItems = products.filter((p) => selectedIds.includes(p.id));
  const selectedSummary = selectedItems.reduce((acc, p) => {
    const item = cartItems.find((c) => c.id === p.id);
    return acc + (item ? p.price * item.quantity : 0);
  }, 0);
  const totalSelectedQuantity = selectedItems.reduce((acc, p) => {
    const item = cartItems.find((c) => c.id === p.id);
    return acc + (item ? item.quantity : 0);
  }, 0);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-center">🛒 Shopping Cart</h1>

      {cartItems.length === 0 ? (
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
          {products.map((product) => {
            const cartItem = cartItems.find((item) => item.id === product.id);
            if (!cartItem) return null;

            return (
              <div
                key={product.id}
                className="relative flex flex-col text-center md:flex-row md:items-center justify-between border p-4 rounded-lg shadow-sm gap-4"
              >
                {/* ✅ Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedIds.includes(product.id)}
                  onChange={() => toggleItem(product.id)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 md:static md:translate-y-0"
                />

                {/* ✅ รูปภาพ */}
                <img
                  src={product.avatar}
                  alt={product.name}
                  className="w-24 h-24 object-cover rounded mx-auto"
                />

                {/* ✅ รายละเอียดสินค้า */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-grow text-center md:text-left">
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-gray-600">Branch: {product.branch}</p>
                  <p className="text-gray-600">Price: {product.price} THB</p>

                  {/* ✅ Quantity */}
                  <div className="text-sm text-gray-500 flex items-center justify-center gap-2">
                    <button
                      onClick={() => decreaseQuantity(product.id)}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span>{cartItem.quantity}</span>
                    <button
                      onClick={() => increaseQuantity(product.id)}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* ✅ ปุ่ม View */}
                <Link
                  href={`/detail_product/${product.id}`}
                  className="text-blue-600 underline hover:text-blue-800 whitespace-nowrap"
                >
                  View Product
                </Link>
              </div>
            );
          })}

          {/* ✅ สรุปรายการ */}
          <div className="grid grid-cols-9 gap-4 items-center border-t-2 border-b-2 pt-4 font-bold pb-4">
            {/* Select All */}
            <div className="col-span-2 flex items-center gap-2 justify-start">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={toggleSelectAll}
              />
              <label className="text-sm">Select All Items</label>
            </div>

            {/* Summary */}
            <div className="col-span-5 flex justify-end">
              <h3>
                Total: {selectedSummary} THB | Selected Items:{" "}
                {totalSelectedQuantity}
              </h3>
            </div>

            {/* Order Button */}
            <div className="col-span-2 flex justify-end">
              <Link
                href={{
                  pathname: "/orderbuy",
                  query: {
                    items: JSON.stringify(
                      cartItems
                        .filter((c) => selectedIds.includes(c.id))
                        .map((c) => ({ id: c.id, quantity: c.quantity }))
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

          {/* ปุ่มเพิ่มเติม */}
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
