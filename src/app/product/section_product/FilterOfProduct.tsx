"use client";
import "flowbite";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AiOutlineAppstore, AiOutlineMenu } from "react-icons/ai";

export default function FilterProduct({ category }: { category: string }) {
  const [isClient, setIsClient] = useState(false);
  const [isCompactView, setIsCompactView] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isNameOpen, setIsNameOpen] = useState(false);
  const [priceLabel, setPriceLabel] = useState("Price Min to Max");
  const [nameLabel, setNameLabel] = useState("Sort A-Z");

  // ✅ Hooks ต้องอยู่ด้านบนสุดของ component เท่านั้น!
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const applyViewport = () => setIsCompactView(window.innerWidth < 900);
    applyViewport();
    window.addEventListener("resize", applyViewport);
    return () => window.removeEventListener("resize", applyViewport);
  }, []);

  const applyPriceSort = (sortValue: "asc" | "desc") => {
    const params = new URLSearchParams(window.location.search);
    params.set("sortPrice", sortValue);
    router.push(`/product?${params.toString()}`);
    setPriceLabel(sortValue === "asc" ? "Price Min to Max" : "Price Max to Min");
    setIsPriceOpen(false);
  };

  const applyNameSort = (sortValue: "az" | "za") => {
    const params = new URLSearchParams(window.location.search);
    params.set("sortName", sortValue);
    router.push(`/product?${params.toString()}`);
    setNameLabel(sortValue === "az" ? "Sort A-Z" : "Sort Z-A");
    setIsNameOpen(false);
  };

  return (
    <>
      {isClient && (
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 sm:gap-2 outline outline-1 outline-gray-500 rounded p-1 sm:p-2">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-base">
            <h3 className="leading-none">Selected:</h3>
            <h3 className="px-1.5 sm:px-3 py-0.5 sm:py-1 bg-gray-100 border border-gray-300 rounded-full text-[10px] sm:text-sm text-gray-700 font-medium shadow-sm leading-none">
              {category}
            </h3>
          </div>

          <div
            className={`flex items-center gap-1 sm:gap-2 pb-0.5 ${
              isCompactView
                ? "flex-wrap overflow-visible whitespace-normal"
                : "overflow-x-auto whitespace-nowrap"
            }`}
          >
            <p className="text-[10px] sm:text-base leading-none">Sort by:</p>

            {/* 🔹เรียงราคาสินค้า (น้อย→มาก, มาก→น้อย) */}
            <div className="relative shrink-0">
              {/* Mobile: custom dropdown for stable positioning */}
              <button
                type="button"
                onClick={() => {
                  setIsPriceOpen((prev) => !prev);
                  setIsNameOpen(false);
                }}
                className={`${isCompactView ? "flex" : "hidden"} h-7 w-[132px] bg-gray-50 border border-gray-300 text-gray-900 text-[10px] rounded-lg px-1.5 text-left items-center justify-between`}
              >
                <span className="truncate">{priceLabel}</span>
                <span className="ml-1">▾</span>
              </button>
              {isCompactView && isPriceOpen && (
                <div className="absolute left-0 top-full mt-1 w-[132px] z-[60] rounded-lg border border-gray-300 bg-white shadow-lg overflow-hidden">
                  <button
                    type="button"
                    className="block w-full text-left px-2 py-1.5 text-[10px] text-gray-900 hover:bg-gray-100"
                    onClick={() => applyPriceSort("asc")}
                  >
                    Price Min to Max
                  </button>
                  <button
                    type="button"
                    className="block w-full text-left px-2 py-1.5 text-[10px] text-gray-900 hover:bg-gray-100"
                    onClick={() => applyPriceSort("desc")}
                  >
                    Price Max to Min
                  </button>
                </div>
              )}
              <select
                id="topic"
                className={`${isCompactView ? "hidden" : "block"} h-7 sm:h-auto bg-gray-50 border border-gray-300 text-gray-900 text-[10px] sm:text-sm rounded-lg px-1.5 py-0.5 sm:p-2 w-[132px] sm:w-auto leading-none`}
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
            <div className="relative shrink-0">
              {/* Mobile: custom dropdown for stable positioning */}
              <button
                type="button"
                onClick={() => {
                  setIsNameOpen((prev) => !prev);
                  setIsPriceOpen(false);
                }}
                className={`${isCompactView ? "flex" : "hidden"} h-7 w-[92px] bg-gray-50 border border-gray-300 text-gray-900 text-[10px] rounded-lg px-1.5 text-left items-center justify-between`}
              >
                <span className="truncate">{nameLabel}</span>
                <span className="ml-1">▾</span>
              </button>
              {isCompactView && isNameOpen && (
                <div className="absolute right-0 top-full mt-1 w-[92px] z-[60] rounded-lg border border-gray-300 bg-white shadow-lg overflow-hidden">
                  <button
                    type="button"
                    className="block w-full text-left px-2 py-1.5 text-[10px] text-gray-900 hover:bg-gray-100"
                    onClick={() => applyNameSort("az")}
                  >
                    Sort A-Z
                  </button>
                  <button
                    type="button"
                    className="block w-full text-left px-2 py-1.5 text-[10px] text-gray-900 hover:bg-gray-100"
                    onClick={() => applyNameSort("za")}
                  >
                    Sort Z-A
                  </button>
                </div>
              )}
              <select
                id="topic"
                className={`${isCompactView ? "hidden" : "block"} h-7 sm:h-auto bg-gray-50 border border-gray-300 text-gray-900 text-[10px] sm:text-sm rounded-lg px-1.5 py-0.5 sm:p-2 w-[92px] sm:w-auto leading-none`}
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

            <AiOutlineAppstore className="text-[11px] sm:text-base shrink-0" />
            <AiOutlineMenu className="text-[11px] sm:text-base shrink-0" />
          </div>
        </div>
      )}
    </>
  );
}
