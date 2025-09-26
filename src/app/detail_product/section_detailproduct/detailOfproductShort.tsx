"use client";
import "flowbite";
import { useState } from "react";
import { useCart } from "@/app/context/CartContext"; // ✅ import

interface Props {
  product: {
    id: string;
    name: string;
    price: number;
    branch: string;
  };
}

export default function DetailOfProduct({ product }: Props) {
  const { addToCart } = useCart(); // ✅ ใช้ context
  const [quantity, setQuantity] = useState(1);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
      <p className="text-gray-700 mb-4">Branch: {product.branch}</p>
      <p className="text-xl font-semibold mb-4">Price: {product.price} THB</p>

      <div className="flex items-center mb-4">
        <button
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded-l hover:bg-gray-300"
          onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}
        >
          -
        </button>
        <span className="px-4 py-1 border-t border-b border-gray-200">
          {quantity}
        </span>
        <button
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded-r hover:bg-gray-300"
          onClick={() => setQuantity((prev) => prev + 1)}
        >
          +
        </button>
      </div>
      <div className="flex space-x-4">
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Buy Now
        </button>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => addToCart(product.id, quantity)} // ✅ เพิ่มตรงนี้
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
