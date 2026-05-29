"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { fetchWithTimeout } from "@/app/utils/fetchWithTimeout";
import { isSellableProduct } from "@/app/utils/productVisibility";
import { useCart } from "@/app/context/CartContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function NavSearchBar() {
  const router = useRouter();
  const { cartItems } = useCart();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const [searchProductName, setSearchProductName] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDropdownOpenCategories, setIsDropdownOpenCategories] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetchWithTimeout(`${API_BASE_URL}/api/products`);
        const json = await res.json();
        const data = Array.isArray(json.data) ? json.data.filter(isSellableProduct) : [];
        const uniqueCategories: string[] = Array.from(
          new Set(data.filter((p: any) => p.category?.name).map((p: any) => String(p.category.name)))
        );
        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Cannot load categories:", err);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        event.target instanceof HTMLElement &&
        !event.target.closest(".search-bar") &&
        !event.target.closest(".dropdown-suggestions")
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutsideCategories = (event: MouseEvent) => {
      if (
        event.target instanceof HTMLElement &&
        !event.target.closest(".categories-dropdown") &&
        !event.target.closest(".categories-button")
      ) {
        setIsDropdownOpenCategories(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideCategories);
    return () => document.removeEventListener("mousedown", handleClickOutsideCategories);
  }, []);

  const handleSearchChange = async (e: any) => {
    const value = e.target.value;
    setSearchProductName(value);

    if (!value.trim()) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }

    try {
      setIsSearching(true);
      const queries = [
        `${API_BASE_URL}/api/products/search?productName=${encodeURIComponent(value)}`,
        `${API_BASE_URL}/api/products/search?categoryName=${encodeURIComponent(value)}`,
        `${API_BASE_URL}/api/products/search?brandName=${encodeURIComponent(value)}`,
      ];

      const responses = await Promise.all(queries.map((url) => fetch(url).catch(() => null)));
      const jsonResponses = await Promise.all(responses.map((res) => (res && res.ok ? res.json() : null)));
      const allProducts = jsonResponses
        .filter((j) => j && j.data && j.data.products)
        .flatMap((j) => j.data.products);

      const uniqueProducts = Array.from(
        new Map(allProducts.map((p) => [p.id_products, p])).values()
      ).filter(isSellableProduct);

      setSuggestions(uniqueProducts);
      setIsDropdownOpen(true);
    } catch (error) {
      console.error("Search error:", error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectProduct = (name: string) => {
    setSuggestions([]);
    setSearchProductName("");
    router.push(`/product?search=${encodeURIComponent(name)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchProductName.trim();
    if (!trimmed) {
      router.push("/product");
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }
    router.push(`/product?search=${encodeURIComponent(trimmed)}`);
    setSuggestions([]);
    setIsDropdownOpen(false);
  };

  const handleClick = () => {
    if (searchProductName.trim()) {
      handleSearchChange({ target: { value: searchProductName } });
    }
  };

  return (
    <form className="relative z-40 p-2 border-t border-solid" onSubmit={handleSubmit}>
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 max-w-screen-md mx-auto">
        {/* Category dropdown button */}
        <button
          type="button"
          onClick={() => setIsDropdownOpenCategories(!isDropdownOpenCategories)}
          className="categories-button order-1 shrink-0 z-10 inline-flex h-10 items-center py-2 px-2.5 sm:px-4 text-xs sm:text-sm font-medium text-yellow-500 bg-gray-800 border border-gray-600 rounded-lg sm:rounded-s-lg hover:border-[rgb(255,215,0)] hover:text-[rgb(255,215,0)]
            hover:[text-shadow:0_0_6px_rgb(255,215,0),0_0_12px_rgb(255,215,0),0_0_20px_rgb(212,175,55)] hover:bg-gray-900 focus:bg-gray-900 focus:border-[rgb(255,215,0)] transition-colors duration-300"
        >
          หมวดหมู่
          <svg className="w-2.5 h-2.5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
          </svg>
        </button>

        {/* Categories dropdown list */}
        {isDropdownOpenCategories && (
          <div className="categories-dropdown absolute left-2 sm:left-auto top-[52px] z-50 bg-gray-800 border border-gray-600 rounded-lg divide-y divide-gray-100 shadow-sm w-40 sm:w-[125px] h-auto overflow-y-auto">
            <ul className="text-sm text-yellow-500">
              <li>
                <button
                  type="button"
                  className="flex w-full justify-start text-left px-4 py-2 font-semibold hover:text-[rgb(255,215,0)]
                    hover:[text-shadow:0_0_6px_rgb(255,215,0),0_0_12px_rgb(255,215,0),0_0_20px_rgb(212,175,55)] hover:bg-gray-900 focus:bg-gray-900 transition-colors duration-300"
                  onClick={() => { router.push(`/product`); setIsDropdownOpenCategories(false); }}
                >
                  ทั้งหมด
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat}>
                  <button
                    type="button"
                    className="flex w-full justify-start text-left px-4 py-2 font-semibold hover:text-[rgb(255,215,0)]
                      hover:[text-shadow:0_0_6px_rgb(255,215,0),0_0_12px_rgb(255,215,0),0_0_20px_rgb(212,175,55)] hover:bg-gray-900 focus:bg-gray-900 transition-colors duration-300"
                    onClick={() => { router.push(`/product?category=${encodeURIComponent(cat)}`); setIsDropdownOpenCategories(false); }}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Search input */}
        <div className="relative order-2 w-full min-w-0">
          <input
            type="search"
            className="search-bar block p-2.5 w-full z-10 text-sm rounded-lg border-s-2 border border-gray-700 focus:border-yellow-500 bg-gray-800 border-gray-600 placeholder-yellow-500 text-white hover:bg-gray-900 focus:bg-gray-900 transition-colors duration-300"
            placeholder="ค้นหาสินค้าที่นี่..."
            value={searchProductName}
            onChange={handleSearchChange}
            onClick={handleClick}
          />

          <button
            type="submit"
            className="absolute top-0 right-0 h-full px-4 text-sm font-medium text-black bg-yellow-400 rounded-e-lg border border-gray-700
              transition-all duration-300 ease-out hover:bg-[rgb(255,215,0)] hover:border-[rgb(255,215,0)]
              hover:shadow-[0_0_8px_rgba(255,215,0,0.7),0_0_16px_rgba(255,215,0,0.5),0_0_24px_rgba(212,175,55,0.6)]
              hover:scale-105"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
            </svg>
            <span className="sr-only">Search</span>
          </button>

          {/* Search suggestions dropdown */}
          {isDropdownOpen && suggestions.length > 0 && (
            <ul className="dropdown-suggestions absolute left-0 right-0 mt-1 max-h-64 overflow-y-auto bg-gray-800 border border-yellow-500 rounded-lg shadow-md text-sm text-yellow-500 z-50">
              {suggestions.map((item: any) => (
                <li
                  key={item.id_products}
                  className="px-3 py-2 hover:text-[rgb(255,215,0)] hover:[text-shadow:0_0_6px_rgb(255,215,0),0_0_12px_rgb(255,215,0),0_0_20px_rgb(212,175,55)] hover:bg-gray-900 transition-colors duration-300 cursor-pointer flex items-center gap-2"
                  onClick={() => handleSelectProduct(item.name)}
                >
                  {item.images && item.images.length > 0 && (
                    <Image
                      src={item.images[0].url}
                      alt={item.name}
                      width={32}
                      height={32}
                      className="w-8 h-8 object-cover rounded"
                      unoptimized={item.images[0].url.startsWith("http")}
                    />
                  )}
                  <span>{item.name}</span>
                </li>
              ))}
              {isSearching && (
                <li className="px-3 py-2 text-gray-400 text-xs">Searching...</li>
              )}
            </ul>
          )}
        </div>

        {/* Cart and Wishlist buttons */}
        <div className="relative order-3 ml-0 flex items-center gap-1.5 sm:gap-3">
          <Link href="/shoppingcart">
            <button className="relative p-2 text-black bg-yellow-400 rounded-lg border border-gray-700
              transition-all duration-300 ease-out hover:bg-[rgb(255,215,0)] hover:border-[rgb(255,215,0)]
              hover:shadow-[0_0_8px_rgba(255,215,0,0.7),0_0_16px_rgba(255,215,0,0.5),0_0_24px_rgba(212,175,55,0.6)]
              hover:scale-105 hover:text-blue-500">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h18l-2 9H5L3 3z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 17a2 2 0 11-4 0 2 2 0 014 0zM8 17a2 2 0 114 0 2 2 0 01-4 0z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {totalItems}
                </span>
              )}
            </button>
          </Link>

          <Link href="/wishlist">
            <button className="relative p-2 text-black bg-yellow-400 rounded-lg border border-gray-700
              transition-all duration-300 ease-out hover:bg-[rgb(255,215,0)] hover:border-[rgb(255,215,0)]
              hover:shadow-[0_0_8px_rgba(255,215,0,0.7),0_0_16px_rgba(255,215,0,0.5),0_0_24px_rgba(212,175,55,0.6)]
              hover:scale-105 hover:text-pink-500">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </Link>
        </div>
      </div>
    </form>
  );
}
