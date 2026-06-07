"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isSellableProduct } from "@/app/utils/productVisibility";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface TopicMenuProps {
  setSelectedCategory?: (category: string) => void;
  onClose?: () => void;
}

export default function TopicMenu({ setSelectedCategory, onClose }: TopicMenuProps) {
  const [isClient, setIsClient] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  const router = useRouter();
  const searchParams = useSearchParams();

  // ⭐ state สำหรับกรอกราคา
  const [minInput, setMinInput] = useState("");
  const [maxInput, setMaxInput] = useState("");

  const getSelectedQuality = () => {
    const raw = searchParams.get("quality") || "";
    return raw
      .split(",")
      .map((q) => q.trim().toLowerCase())
      .filter(Boolean);
  };

  useEffect(() => {
    setIsClient(true);

    async function fetchCategories() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/products`);
        const json = await res.json();
        const data = Array.isArray(json.data)
          ? json.data.filter(isSellableProduct)
          : [];

        const unique: string[] = Array.from(
          new Set(
            data
              .filter((p: any) => p.category?.name)
              .map((p: any) => String(p.category.name))
          )
        );

        setCategories(unique);
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    }

    fetchCategories();
  }, []);

  // ⭐ เลือก Category
  const handleCategoryClick = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("category", category);
    router.push(`/product?${params.toString()}`);
    setSelectedCategory?.(category);
    onClose?.();
  };

  // ⭐ เลือกคุณภาพสินค้า (เลือกได้อย่างใดอย่างหนึ่ง)
  const handleQualityChange = (
    qualityKey: "new" | "used",
    checked: boolean
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!params.get("category")) params.set("category", "All");

    if (checked) {
      params.set("quality", qualityKey);
    } else {
      params.delete("quality");
    }

    router.push(`/product?${params.toString()}`);
  };

  const isActive = (cat: string) => {
    const current = searchParams.get("category") || "All";
    return current === cat
      ? "font-bold text-yellow-500 bg-black border border-gray-300 rounded-full px-1.5 sm:px-2 py-1 inline-block leading-none transition-colors duration-200 cursor-pointer"
      : "hover:font-bold hover:text-yellow-500 transition-colors duration-200 cursor-pointer";
  };

  const qualitySelected = getSelectedQuality();
  const selectedQuality = qualitySelected[0] || "";

  return (
    <>
      {isClient && (
        <div className="col-span-1 grid grid-cols-1 gap-1">
          <div className="bg-[#111827] border border-[rgba(212,175,55,0.15)] rounded-xl p-2 sm:p-3 h-full">
            <div className="text-center font-bold text-sm sm:text-base mb-2 sm:mb-3 border-b border-[rgba(212,175,55,0.2)] pb-1.5 sm:pb-2 text-yellow-500">
              <h1>หมวดหมู่</h1>
            </div>

            <div className="space-y-1 sm:space-y-2 mt-1.5 sm:mt-2 text-xs sm:text-sm text-gray-300">
              <div
                className={`cursor-pointer ${isActive("All")}`}
                onClick={() => {
                  const quality = searchParams.get("quality") || "";
                  router.push(`/product?category=All${quality ? `&quality=${quality}` : ""}`);
                  onClose?.();
                }}
              >
                ทั้งหมด
              </div>
              {categories.map((cat) => (
                <div key={cat} className={`cursor-pointer ${isActive(cat)}`} onClick={() => handleCategoryClick(cat)}>
                  {cat}
                </div>
              ))}
            </div>

            <div className="space-y-1.5 sm:space-y-2 py-2 sm:py-3 text-xs sm:text-sm text-gray-300 border-t border-[rgba(212,175,55,0.1)] mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-yellow-500"
                  checked={selectedQuality === "new"}
                  onChange={(e) => handleQualityChange("new", e.target.checked)}
                />
                มือ 1
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-yellow-500"
                  checked={selectedQuality === "used"}
                  onChange={(e) => handleQualityChange("used", e.target.checked)}
                />
                มือ 2
              </label>
            </div>

            <div className="space-y-1.5 sm:space-y-2 mt-2 pt-2 border-t border-[rgba(212,175,55,0.1)]">
              <div>
                <h2 className="text-xs text-gray-400 mb-1">ต่ำที่สุด</h2>
                <input
                  type="text"
                  value={minInput}
                  onChange={(e) => setMinInput(e.target.value)}
                  placeholder="ตั้งราคาเริ่มต้น"
                  className="bg-[#1a1a2e] border border-[rgba(212,175,55,0.2)] text-gray-200 placeholder-gray-600 text-xs rounded-lg block w-full p-1.5 focus:border-yellow-500 outline-none"
                />
              </div>
              <div>
                <h2 className="text-xs text-gray-400 mb-1">สูงสุด</h2>
                <input
                  type="text"
                  value={maxInput}
                  onChange={(e) => setMaxInput(e.target.value)}
                  placeholder="ตั้งราคาสูงสุด"
                  className="bg-[#1a1a2e] border border-[rgba(212,175,55,0.2)] text-gray-200 placeholder-gray-600 text-xs rounded-lg block w-full p-1.5 focus:border-yellow-500 outline-none"
                />
              </div>
              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => {
                    const category = searchParams.get("category") || "All";
                    const quality = searchParams.get("quality") || "";
                    const params = new URLSearchParams();
                    params.set("category", category);
                    if (quality) params.set("quality", quality);
                    if (minInput) params.set("min", minInput);
                    if (maxInput) params.set("max", maxInput);
                    router.push(`/product?${params.toString()}`);
                    onClose?.();
                  }}
                  className="text-yellow-500 bg-black border border-[rgba(212,175,55,0.3)] hover:bg-[#1a1a1a] hover:border-yellow-500 rounded-lg text-xs w-full px-2 py-1.5 transition-all"
                >
                  ยืนยัน
                </button>
                {(minInput !== "" || maxInput !== "") && (
                  <button
                    type="button"
                    onClick={() => {
                      setMinInput("");
                      setMaxInput("");
                      const category = searchParams.get("category") || "All";
                      const quality = searchParams.get("quality") || "";
                      const params = new URLSearchParams();
                      params.set("category", category);
                      if (quality) params.set("quality", quality);
                      router.push(`/product?${params.toString()}`);
                    }}
                    className="text-white bg-red-700 hover:bg-red-800 rounded-lg text-xs w-full px-2 py-1.5 mt-1.5 transition-all"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
