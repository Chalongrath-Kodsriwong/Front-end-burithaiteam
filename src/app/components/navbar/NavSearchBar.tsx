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
    <form className="relative z-40 px-2 py-2 border-t border-[rgba(212,175,55,0.1)] bg-transparent" onSubmit={handleSubmit}>
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 max-w-screen-md mx-auto">
        {/* Category dropdown button */}
        <button
          type="button"
          onClick={() => setIsDropdownOpenCategories(!isDropdownOpenCategories)}
          className="categories-button order-1 shrink-0 z-10 inline-flex h-10 items-center py-2 px-2.5 sm:px-4 text-xs sm:text-sm font-medium text-yellow-500 bg-[#1a1a2e] border border-[rgba(212,175,55,0.25)] rounded-lg hover:border-yellow-500 hover:text-[rgb(255,215,0)] hover:bg-[#1e1e3a] focus:outline-none focus:border-yellow-500 transition-all duration-300 whitespace-nowrap"
        >
          หมวดหมู่
          <svg className="w-2.5 h-2.5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
          </svg>
        </button>

        {/* Categories dropdown list */}
        {isDropdownOpenCategories && (
          <div className="categories-dropdown absolute left-0 top-[44px] z-50 bg-[#1a1a2e] border border-[rgba(212,175,55,0.3)] rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.5)] w-36 max-h-60 overflow-y-auto">
            <ul className="text-sm text-yellow-500 py-1">
              <li>
                <button
                  type="button"
                  className="flex w-full justify-start text-left px-4 py-2 text-xs font-medium hover:text-[rgb(255,215,0)] hover:bg-[rgba(212,175,55,0.1)] transition-colors duration-200"
                  onClick={() => { router.push(`/product`); setIsDropdownOpenCategories(false); }}
                >
                  ทั้งหมด
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat}>
                  <button
                    type="button"
                    className="flex w-full justify-start text-left px-4 py-2 text-xs font-medium hover:text-[rgb(255,215,0)] hover:bg-[rgba(212,175,55,0.1)] transition-colors duration-200"
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
            className="search-bar block p-2.5 w-full z-10 text-sm rounded-lg border border-[rgba(212,175,55,0.2)] bg-[#1a1a2e] placeholder-gray-500 text-gray-200 focus:border-yellow-500 focus:bg-[#1e1e3a] focus:outline-none hover:border-[rgba(212,175,55,0.4)] transition-all duration-300"
            placeholder="ค้นหาสินค้า..."
            value={searchProductName}
            onChange={handleSearchChange}
            onClick={handleClick}
          />

          <button
            type="submit"
            className="absolute top-0 right-0 h-full px-3 sm:px-4 text-sm font-medium text-black bg-yellow-500 rounded-e-lg border border-yellow-500
              transition-all duration-300 hover:bg-[rgb(255,215,0)] hover:shadow-[0_0_10px_rgba(255,215,0,0.5)]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
            </svg>
            <span className="sr-only">Search</span>
          </button>

          {/* Search suggestions dropdown */}
          {isDropdownOpen && suggestions.length > 0 && (
            <ul className="dropdown-suggestions absolute left-0 right-0 mt-1 max-h-64 overflow-y-auto bg-[#1a1a2e] border border-[rgba(212,175,55,0.4)] rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.5)] text-sm text-yellow-500 z-50">
              {suggestions.map((item: any) => (
                <li
                  key={item.id_products}
                  className="px-3 py-2 hover:text-[rgb(255,215,0)] hover:bg-[rgba(212,175,55,0.1)] transition-colors duration-200 cursor-pointer flex items-center gap-2"
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
            <button className="relative p-2 text-black bg-yellow-500 rounded-lg border border-yellow-500
              transition-all duration-300 hover:bg-[rgb(255,215,0)] hover:shadow-[0_0_10px_rgba(255,215,0,0.4)] hover:scale-105">
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
            <button className="relative p-2 text-black bg-yellow-500 rounded-lg border border-yellow-500
              transition-all duration-300 hover:bg-[rgb(255,215,0)] hover:shadow-[0_0_10px_rgba(255,215,0,0.4)] hover:scale-105">
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
