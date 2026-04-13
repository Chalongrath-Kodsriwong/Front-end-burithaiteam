"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface TopicMenuProps {
  setSelectedCategory?: (category: string) => void;
}

export default function TopicMenu({ setSelectedCategory }: TopicMenuProps) {
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
        const data = Array.isArray(json.data) ? json.data : [];

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
          <div className="outline outline-1 outline-gray-500 rounded p-1.5 sm:p-3 h-full">
            <div className="text-center font-bold text-sm sm:text-lg mb-2 sm:mb-3 border-b-2 border-gray-500 pb-1.5 sm:pb-2">
              <h1>หมวดหมู่</h1>
            </div>

            <div className="space-y-1 sm:space-y-2 mt-1.5 sm:mt-2 text-xs sm:text-base">
              {/* All */}
              <div
                className={`cursor-pointer ${isActive("All")}`}
                onClick={() => {
                  const quality = searchParams.get("quality") || "";
                  router.push(
                    `/product?category=All${
                      quality ? `&quality=${quality}` : ""
                    }`
                  );
                }}
              >
                ทั้งหมด
              </div>

              {/* Categories from DB */}
              {categories.map((cat) => (
                <div
                  key={cat}
                  className={`cursor-pointer ${isActive(cat)}`}
                  onClick={() => handleCategoryClick(cat)}
                >
                  {cat}
                </div>
              ))}
            </div>

            {/* Quality Filter */}
            <div className="space-y-1.5 sm:space-y-2 py-2 sm:py-3 text-xs sm:text-base">
              <div>
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={selectedQuality === "new"}
                  onChange={(e) => handleQualityChange("new", e.target.checked)}
                />
                มือ 1
              </div>

              <div>
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={selectedQuality === "used"}
                  onChange={(e) => handleQualityChange("used", e.target.checked)}
                />
                มือ 2
              </div>
            </div>

            {/* ⭐ Filter ราคา */}
            <div className="space-y-1.5 sm:space-y-2 mt-3 sm:mt-5 py-2 sm:py-3">
              <div>
                <h2 className="text-xs sm:text-base">ต่ำที่สุด</h2>
                <input
                  type="text"
                  value={minInput}
                  onChange={(e) => setMinInput(e.target.value)}
                  placeholder="ตั้งราคาเริ่มต้น"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-xs sm:text-sm rounded-lg block w-full p-1"
                />
              </div>

              <div className="border-b-2 border-gray-500 pb-2"></div>

              <div>
                <h2 className="text-xs sm:text-base">สูงสุด</h2>
                <input
                  type="text"
                  value={maxInput}
                  onChange={(e) => setMaxInput(e.target.value)}
                  placeholder="ตั้งราคาสูงสุด"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-xs sm:text-sm rounded-lg block w-full p-1"
                />
              </div>

              <div className="pt-2 text-center">
                {/* ⭐ Submit filter */}
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
                  }}
                  className="text-yellow-500 bg-black hover:bg-gray-800 rounded-lg text-xs sm:text-sm w-full px-2 sm:px-5 py-1.5 sm:py-2.5"
                >
                  ยืนยัน
                </button>

                {/* ⭐ CLEAR FILTER → แสดงเฉพาะเมื่อมีค่าในช่องใดช่องหนึ่ง */}
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
                    className="text-white bg-red-600 hover:bg-red-700 rounded-lg text-xs sm:text-sm w-full px-2 sm:px-5 py-1.5 sm:py-2.5 mt-2"
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
