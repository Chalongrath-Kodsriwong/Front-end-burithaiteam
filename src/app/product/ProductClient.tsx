"use client";
import "flowbite";
import { useEffect, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "next/navigation";

import TopicMenu from "./section_product/Topic_Menu";
import FilterProduct from "./section_product/FilterOfProduct";
import Productdisplay from "./section_product/Productdisplay";

export default function Product() {
  const [isClient, setIsClient] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "All";

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="container mx-auto px-1.5 sm:px-3 md:px-0 py-2 my-2 rounded-lg">
      {isClient && (
        <>
          {/* Mobile filter toggle button */}
          <div className="md:hidden mb-2 flex items-center gap-2">
            <button
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-300 ${
                isSidebarOpen
                  ? "bg-yellow-500 text-black border-yellow-500"
                  : "bg-[#111827] text-yellow-500 border-[rgba(212,175,55,0.3)] hover:border-yellow-500"
              }`}
            >
              {isSidebarOpen ? (
                <X size={14} />
              ) : (
                <SlidersHorizontal size={14} />
              )}
              ตัวกรอง
            </button>
            {category !== "All" && (
              <span className="text-xs text-yellow-500 bg-[#1a1a2e] border border-[rgba(212,175,55,0.3)] px-2 py-1 rounded-full">
                {category}
              </span>
            )}
          </div>

          {/* Mobile: collapsible sidebar */}
          <div
            className={`md:hidden overflow-hidden transition-all duration-400 ease-in-out ${
              isSidebarOpen ? "max-h-[600px] opacity-100 mb-3" : "max-h-0 opacity-0 mb-0"
            }`}
          >
            <TopicMenu onClose={() => setIsSidebarOpen(false)} />
          </div>

          {/* Desktop: side-by-side grid */}
          <div className="hidden md:grid md:grid-cols-8 gap-1">
            <TopicMenu />
            <div className="min-w-0 md:col-span-7 space-y-1">
              <FilterProduct category={category} />
              <Productdisplay />
            </div>
          </div>

          {/* Mobile: full-width products */}
          <div className="md:hidden space-y-1">
            <FilterProduct category={category} />
            <Productdisplay />
          </div>
        </>
      )}
    </div>
  );
}
