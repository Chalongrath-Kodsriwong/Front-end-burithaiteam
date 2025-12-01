"use client";
import "flowbite";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AiOutlineAppstore, AiOutlineMenu } from "react-icons/ai";

export default function FilterProduct({ category }: { category: string }) {
  const [isClient, setIsClient] = useState(false);

  // ✅ Hooks ต้องอยู่ด้านบนสุดของ component เท่านั้น!
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      {isClient && (
        <div className="flex justify-between items-center outline outline-1 outline-gray-500 rounded p-2">
          <div className="flex items-center space-x-2">
            <h3>Selected: </h3>
            <h3 className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-full text-sm text-gray-700 font-medium shadow-sm">
              {category}
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <p>Sort by:</p>

            {/* 🔹เรียงราคาสินค้า (น้อย→มาก, มาก→น้อย) */}
            <div>
              <select
                id="topic"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2"
                onChange={(e) => {
                  const sortValue = e.target.value;
                  const params = new URLSearchParams(window.location.search);

                  if (sortValue === "asc") params.set("sortPrice", "asc");
                  else if (sortValue === "desc")
                    params.set("sortPrice", "desc");
                  else params.delete("sortPrice");

                  router.push(`/product?${params.toString()}`);
                }}
              >
                <option value="asc">Price Min to Max</option>
                <option value="desc">Price Max to Min</option>
              </select>
            </div>

            {/* 🔹เรียงชื่อสินค้า A→Z หรือ Z→A */}
            <div>
              <select
                id="topic"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2"
                onChange={(e) => {
                  const sortValue = e.target.value;
                  const params = new URLSearchParams(window.location.search);

                  if (sortValue) params.set("sortName", sortValue);
                  else params.delete("sortName");

                  router.push(`/product?${params.toString()}`);
                }}
              >
                <option value="az">Sort A-Z</option>
                <option value="za">Sort Z-A</option>
              </select>
            </div>

            <AiOutlineAppstore />
            <AiOutlineMenu />
          </div>
        </div>
      )}
    </>
  );
}
