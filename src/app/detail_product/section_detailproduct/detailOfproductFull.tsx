"use client";
import "flowbite";
import { useEffect, useState } from "react";

interface Props {
  product: {
    id: string;
    name: string;
    price: number;
    branch: string;
    description: string;
    avatar: string;
  };
}

export default function DetailOfProductFull({ product }: Props) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Detail Products</h2>
      <div className="flex flex-col justify-center item-center gap-6">
        <div>
          <img
            src={product.avatar}
            alt={product.name}
            className="w-30 h-30 object-cover rounded mx-auto"
          />
        </div>
        <div>
          <h3 className="font-semibold mt-2">{product.name}</h3>
          <p className="text-gray-600">Branch: {product.branch}</p>
          <p className="text-gray-600">Price: {product.price} THB</p>
          <p className="text-gray-800 mt-2">{product.description}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center">
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Show More
        </button>
      </div>
    </div>
  );
}
