"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://158.173.159.107";

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
    const quality = searchParams.get("quality") || "";

    router.push(
      `/product?category=${encodeURIComponent(category)}${
        quality ? `&quality=${quality}` : ""
      }`
    );

    setSelectedCategory?.(category);
  };

  // ⭐ เลือกคุณภาพสินค้า
  const handleQualityChange = (quality: string, checked: boolean) => {
    const category = searchParams.get("category") || "All";

    if (checked) {
      router.push(
        `/product?category=${encodeURIComponent(
          category
        )}&quality=${quality.toLowerCase()}`
      );
    } else {
      router.push(`/product?category=${encodeURIComponent(category)}`);
    }
  };

  const isActive = (cat: string) => {
    const current = searchParams.get("category") || "All";
    return current === cat
      ? "font-bold text-blue-700 border border-gray-300 rounded-full px-2 py-1.5 inline-block leading-none"
      : "hover:font-bold hover:text-blue-700 cursor-pointer";
  };

  const qualitySelected = searchParams.get("quality");

  return (
    <>
      {isClient && (
        <div className="col-span-1 grid grid-cols-1 gap-1">
          <div className="outline outline-1 outline-gray-500 rounded p-1 h-full p-3">
            <div className="text-center font-bold text-lg mb-3 border-b-2 border-gray-500 pb-2">
              <h1>Topic</h1>
            </div>

            <div className="space-y-2 mt-2">
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
                All
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
            <div className="space-y-2 py-3 ">
              <div>
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={qualitySelected === "new"}
                  onChange={(e) => handleQualityChange("new", e.target.checked)}
                />
                มือ 1
              </div>

              <div>
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={qualitySelected === "used"}
                  onChange={(e) =>
                    handleQualityChange("used", e.target.checked)
                  }
                />
                มือ 2
              </div>
            </div>

            {/* ⭐ Filter ราคา */}
            <div className="space-y-2 mt-5 py-3">
              <div>
                <h2>ต่ำที่สุด</h2>
                <input
                  type="text"
                  value={minInput}
                  onChange={(e) => setMinInput(e.target.value)}
                  placeholder="lower price"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-1"
                />
              </div>

              <div className="border-b-2 border-gray-500 pb-2"></div>

              <div>
                <h2>สูงสุด</h2>
                <input
                  type="text"
                  value={maxInput}
                  onChange={(e) => setMaxInput(e.target.value)}
                  placeholder="upper price"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-1"
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
                  className="text-white bg-blue-700 hover:bg-blue-800 rounded-lg text-sm w-full px-5 py-2.5"
                >
                  Submit
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
                    className="text-white bg-red-600 hover:bg-red-700 rounded-lg text-sm w-full px-5 py-2.5 mt-2"
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
