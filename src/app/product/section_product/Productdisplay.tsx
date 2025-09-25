"use client";
import "flowbite";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: number;
  branch: string;
  avatar: string;
}

export default function Productdisplay() {
  const [isClient, setIsClient] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const ITEMS_PER_TAB = 20;
  const TOTAL_PRODUCTS = 100;

  useEffect(() => {
    setIsClient(true);

    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:3000/products");
        const data = await res.json();

        const repeatCount = Math.ceil(TOTAL_PRODUCTS / data.length);
        const multiplied = Array.from({ length: repeatCount }, (_, i) =>
          data.map((p: Product, idx: number) => ({
            ...p,
            id: `${p.id}`,
          }))
        ).flat();

        const trimmed = multiplied.slice(0, TOTAL_PRODUCTS);
        setProducts(trimmed);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  if (!isClient) return null;

  const totalTabs = Math.ceil(products.length / ITEMS_PER_TAB);
  const tabs = Array.from({ length: totalTabs }, (_, i) => `Tab ${i + 1}`);

  return (
    <>
      <div className="flex justify-center space-x-2 mb-4">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`px-4 py-2 rounded ${
              activeIndex === index
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
        {products
          .slice(activeIndex * ITEMS_PER_TAB, (activeIndex + 1) * ITEMS_PER_TAB)
          .map((product) => (
            <Link
              key={product.id}
              href={`/detail_product/${product.id}`}
              passHref
            >
              <div className="p-4 border rounded hover:shadow cursor-pointer">
                <img
                  src={product.avatar}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded"
                />
                <h2 className="font-semibold mt-2">{product.name}</h2>
                <p className="text-gray-600">{product.price} THB</p>
              </div>
            </Link>
          ))}
      </div>
    </>
  );
}
