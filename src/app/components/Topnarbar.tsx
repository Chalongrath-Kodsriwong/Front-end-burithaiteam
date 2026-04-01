"use client";

// เพิ่ม import
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import { FaRegUserCircle } from "react-icons/fa";
import { clearClientAuthData } from "@/app/utils/authClient";

import { useRef } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function TopNavbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Dropdown ของสินค้า
  const [isDropdownOpenCategories, setIsDropdownOpenCategories] =
    useState(false); // Dropdown ของ Categories
  const router = useRouter();

  const [searchProductName, setSearchProductName] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const pathname = usePathname();
  const { cartItems } = useCart();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // ⭐ เพิ่ม state categories
  const [categories, setCategories] = useState<string[]>([]);

  const { clearCart } = useCart();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Product", href: "/product" },
  ];

  const base = "block py-2 px-3 rounded-sm md:p-0";
  const inactive =
    "text-gray-900 hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent";
  const active =
    "text-white bg-blue-700 md:bg-transparent md:text-blue-700 dark:text-white md:dark:hover:text-blue-500";

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const fetchProfileAvatar = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/account/profile`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        setAvatarUrl(null);
        return;
      }

      const json = await res.json().catch(() => ({}));
      const url = json?.data?.avatar || null;
      setAvatarUrl(typeof url === "string" && url.trim() ? url : null);
    } catch (e) {
      setAvatarUrl(null);
    }
  };

  // ⭐ ยิง 3 API: productName + categoryName + brandName
  const handleSearchChange = async (e: any) => {
    const value = e.target.value;
    setSearchProductName(value);

    if (!value.trim()) {
      setSuggestions([]); // เมื่อช่องค้นหาว่าง, ลบ suggestions
      setIsDropdownOpen(false); // ซ่อน dropdown
      return;
    }

    try {
      setIsSearching(true);

      const queries = [
        `${API_BASE_URL}/api/products/search?productName=${encodeURIComponent(
          value
        )}`,
        `${API_BASE_URL}/api/products/search?categoryName=${encodeURIComponent(
          value
        )}`,
        `${API_BASE_URL}/api/products/search?brandName=${encodeURIComponent(
          value
        )}`,
      ];

      const responses = await Promise.all(
        queries.map((url) => fetch(url).catch(() => null))
      );

      const jsonResponses = await Promise.all(
        responses.map((res) => (res && res.ok ? res.json() : null))
      );

      const allProducts = jsonResponses
        .filter((j) => j && j.data && j.data.products)
        .flatMap((j) => j.data.products);

      const uniqueProducts = Array.from(
        new Map(allProducts.map((p) => [p.id_products, p])).values()
      );

      setSuggestions(uniqueProducts); // ตั้งค่าผลลัพธ์สินค้าที่เกี่ยวข้อง
      setIsDropdownOpen(true); // แสดง dropdown ของสินค้าที่เกี่ยวข้อง
    } catch (error) {
      console.error("Search error:", error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  // ⭐ คลิก dropdown → ส่งชื่อสินค้าไป search
  const handleSelectProduct = (name: string) => {
    setSuggestions([]);
    setSearchProductName("");

    router.push(`/product?search=${encodeURIComponent(name)}`);
  };

  // ⭐ กด Enter search ตามชื่อ
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // ป้องกันการ submit แบบปกติ

    const trimmed = searchProductName.trim();

    // เมื่อกด Enter หรือปุ่ม Search หากช่องค้นหาว่างให้ไปที่หน้าสินค้าทั้งหมด
    if (!trimmed) {
      router.push("/product");
      setSuggestions([]); // ลบ suggestions ที่แสดงอยู่
      setIsDropdownOpen(false); // ซ่อน dropdown ของสินค้าที่เกี่ยวข้อง
      return;
    }

    // ถ้าช่องค้นหามีข้อมูล ค้นหาตามที่พิมพ์
    router.push(`/product?search=${encodeURIComponent(trimmed)}`);
    setSuggestions([]); // ลบ suggestions ที่แสดงอยู่
    setIsDropdownOpen(false); // ซ่อน dropdown ของสินค้าที่เกี่ยวข้อง
  };

  const handleClick = () => {
    if (searchProductName.trim()) {
      handleSearchChange({ target: { value: searchProductName } }); // เรียกฟังก์ชันค้นหาทันทีจาก input ที่มีอยู่
    }
  };

  // ⭐ เช็คว่า login แล้วหรือยัง
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [username, setUsername] = useState<string | null>(null);

  // โหลด username เมื่อหน้า Navbar ถูกเปิดขึ้น
  useEffect(() => {
    const name = localStorage.getItem("username");
    // || localStorage.getItem("first_name");

    console.log("Navbar initial username:", name);

    if (name) setUsername(name);
  }, []);

  // ฟังก์ชันที่ตรวจสอบการคลิก
  useEffect(() => {
    // ฟังก์ชันที่ตรวจสอบการคลิก
    const handleClickOutside = (event: MouseEvent) => {
      // เช็คว่า event.target เป็น DOM element และไม่ใช่ null
      if (
        event.target instanceof HTMLElement &&
        !event.target.closest(".search-bar") &&
        !event.target.closest(".dropdown-suggestions")
      ) {
        setIsDropdownOpen(false); // ปิด dropdown เมื่อคลิกที่อื่น
      }
    };

    // เพิ่ม event listener เมื่อ component ถูก mount
    document.addEventListener("mousedown", handleClickOutside);

    // ลบ event listener เมื่อ component ถูก unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ⭐ ดึงหมวดหมู่สินค้าจาก API
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/products`);
        const json = await res.json();
        const data = Array.isArray(json.data) ? json.data : [];

        // ⭐ ประกาศ uniqueCategories ให้เป็น array จริง ๆ
        const uniqueCategories: string[] = Array.from(
          new Set(
            data
              .filter((p: any) => p.category?.name)
              .map((p: any) => String(p.category.name))
          )
        );

        // ⭐ ไม่ Error แน่นอนเพราะ uniqueCategories เป็น array แล้ว
        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Cannot load categories:", err);
      }
    }

    fetchCategories();
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideCategories);
    };
  }, []);

  const checkLogin = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/carts`, {
        credentials: "include",
      });

      if (res.status === 200) setIsLoggedIn(true);
      else setIsLoggedIn(false);
    } catch {
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    checkLogin();
  }, []);

  // เมื่อ login-success → โหลด username ใหม่ + reload login state
  useEffect(() => {
    function handleLoginSuccess() {
      console.log("🔄 Navbar received login-success event");

      setIsUserMenuOpen(false); // ⬅️ ปิด Dropdown ทันที

      setTimeout(() => {
        const name = localStorage.getItem("username");
        setUsername(name || null);
        checkLogin();
      }, 50);
    }

    window.addEventListener("login-success", handleLoginSuccess);
    return () =>
      window.removeEventListener("login-success", handleLoginSuccess);
  }, []);

  const menuRef = useRef<HTMLDivElement | null>(null);

  // ปิดเมนูเมื่อคลิกที่อื่น
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchProfileAvatar();
      setIsUserMenuOpen(false); // ปิด dropdown เมื่อสถานะ login เปลี่ยน
    } else {
      setAvatarUrl(null);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const handler = () => {
      fetchProfileAvatar();
    };

    window.addEventListener("avatar-updated", handler);
    return () => window.removeEventListener("avatar-updated", handler);
  }, []);

  return (
    // <nav className="bg-gray-900 border-gray-200 dark:bg-gray-900">
    <nav className="bg-[rgb(26,26,26)] border-gray-200">
      <div className="w-full flex flex-wrap items-center justify-between p-4">
        {/* LEFT LOGO */}
        <Link
          href="/"
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <img
            src="/image/logo_black-removebg-preview.png"
            className="h-[70px]"
            alt="Logo"
          />
          <span className="self-center text-2xl font-semibold text-yellow-500 whitespace-nowrap">
            Burithai team
          </span>
        </Link>

        {/* CENTER NAV ITEMS */}
        <div className="hidden md:flex flex-1 justify-center">
          <ul className="font-medium flex flex-row items-center space-x-8">
            {navItems.map(({ label, href }) => (
              <li key={href} className="relative group">
                <Link
                  href={href}
                  aria-current={isActive(href) ? "page" : undefined}
                  className="
                    relative z-10
                    text-yellow-500
                    px-2 py-1
                    transition-all duration-300
                    group-hover:text-[rgb(255,215,0)]
                    group-hover:[text-shadow:0_0_6px_rgb(255,215,0),0_0_12px_rgb(255,215,0),0_0_20px_rgb(212,175,55)]
                  "
                >
                  {label}
                </Link>

                {/* GOLD NEON HOVER EFFECT */}
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span
                    className="
                      w-[45px] h-[35px]
                      rounded-full
                      bg-[rgba(212,175,55,0.25)]
                      scale-0 opacity-0
                      group-hover:scale-150 group-hover:opacity-100
                      transition-all duration-500
                      group-hover:[box-shadow:0_0_10px_rgba(212,175,55,0.4),0_0_20px_rgba(212,175,55,0.3)]
                      "
                  ></span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT LOGIN / USER */}
        <div className="flex items-center gap-4">
          {!isLoggedIn ? (
            <Link href="/login">
              <button className="block bg-[rgb(212,175,55)] py-2 px-4 text-black rounded-md transition-all duration-300 hover:scale-105 hover:bg-[rgb(255,215,0)] hover:[box-shadow:0_0_10px_rgb(255,215,0),0_0_20px_rgb(255,215,0)]">
                Login
              </button>
            </Link>
          ) : (
            <div
              ref={menuRef}
              className="flex flex-col items-center ml-2 mr-2 cursor-pointer select-none relative"
              onClick={() => {
                setIsUserMenuOpen((prev) => !prev);
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className="w-7 h-7 rounded-full object-cover border border-[rgba(212,175,55,0.5)]"
                  onError={() => setAvatarUrl(null)}
                />
              ) : (
                <FaRegUserCircle size={28} className="text-[rgb(212,175,55)]" />
              )}

              <div className="flex items-center gap-1 mt-1">
                <span className="text-[15px] text-white">{username}</span>
                <svg
                  className={`w-3 h-3 text-white transition-transform duration-200 ${
                    isUserMenuOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              <div
                className={`
          absolute top-[55px] right-0 bg-[rgb(30,30,30)] shadow-md rounded-md overflow-hidden
          transition-all duration-300 z-50
          ${
            isUserMenuOpen
              ? "opacity-100 max-h-[200px] pointer-events-auto"
              : "opacity-0 max-h-0 pointer-events-none"
          }
        `}
              >
                <Link href="/history_payment">
                  <button
                    className="block w-full text-left px-6 py-1 text-[rgba(212,175,55)] hover:bg-[rgba(212,175,55,0.25)]
                  text-sm transition-colors duration-200"
                  >
                    Payment
                  </button>
                </Link>

                <Link href="/setting_menu">
                  <button className="block w-full text-left px-6 py-1 text-[rgba(212,175,55)] hover:bg-[rgba(212,175,55,0.25)] text-sm transition-colors duration-200">
                    Settings
                  </button>
                </Link>

                <button
                  onClick={async () => {
                    await fetch(`${API_BASE_URL}/api/auth/logout`, {
                      method: "POST",
                      credentials: "include",
                    }).catch(() => null);

                    clearClientAuthData();
                    clearCart();
                    setIsLoggedIn(false);
                    setUsername(null);
                    setIsUserMenuOpen(false);

                    window.dispatchEvent(new Event("user-logout"));

                    router.refresh();
                    router.push("/login");
                  }}
                  className="block w-full text-left px-6 py-1 text-red-600 hover:bg-[rgba(115,0,0,0.50)] text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Form */}
      <form
        className="relative z-40 p-2 border-t border-solid"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center justify-between max-w-screen-md mx-auto">
          <button
            type="button"
            onClick={() =>
              setIsDropdownOpenCategories(!isDropdownOpenCategories)
            }
            className="categories-button shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-yellow-500 bg-gray-800 border border-gray-600 rounded-s-lg hover:border-[rgb(255,215,0)] hover:text-[rgb(255,215,0)]
      hover:[text-shadow:0_0_6px_rgb(255,215,0),0_0_12px_rgb(255,215,0),0_0_20px_rgb(212,175,55)] hover:bg-gray-900 focus:bg-gray-900 focus:border-[rgb(255,215,0)] transition-colors duration-300
    "
          >
            Categories
            <svg
              className="w-2.5 h-2.5 ml-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 10 6"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 4 4 4-4"
              />
            </svg>
          </button>

          {/* Dropdown ของ All Categories */}
          {isDropdownOpenCategories && (
            <div className="categories-dropdown absolute top-[52px] z-50 bg-gray-800 border border-gray-600 rounded-s-lg divide-y divide-gray-100 rounded-lg shadow-sm w-[125px] h-auto overflow-y-auto">
              <ul className="text-sm text-yellow-500 ">
                {/* ⭐ NEW: ปุ่ม All แสดงสินค้าทั้งหมด */}
                <li>
                  <button
                    type="button"
                    className="flex w-full justify-start text-left px-4 py-2 font-semibold hover:text-[rgb(255,215,0)]
      hover:[text-shadow:0_0_6px_rgb(255,215,0),0_0_12px_rgb(255,215,0),0_0_20px_rgb(212,175,55)] hover:bg-gray-900 focus:bg-gray-900 transition-colors duration-300"
                    onClick={() => {
                      router.push(`/product`);
                      setIsDropdownOpenCategories(false);
                    }}
                  >
                    All
                  </button>
                </li>

                {/* ⭐ Category จากฐานข้อมูล */}
                {categories.map((cat) => (
                  <li key={cat}>
                    <button
                      type="button"
                      className="flex w-full justify-start text-left px-4 py-2 font-semibold hover:text-[rgb(255,215,0)]
      hover:[text-shadow:0_0_6px_rgb(255,215,0),0_0_12px_rgb(255,215,0),0_0_20px_rgb(212,175,55)] hover:bg-gray-900 focus:bg-gray-900 transition-colors duration-300"
                      onClick={() => {
                        router.push(
                          `/product?category=${encodeURIComponent(cat)}`
                        );
                        setIsDropdownOpenCategories(false); // ปิด dropdown หลังจากเลือก
                      }}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="relative w-full">
            <input
              type="search"
              className="search-bar block p-2.5 w-full z-10 text-sm  rounded-e-lg border-s-2 border border-gray-700 focus:border-yellow-500 bg-gray-800 border-gray-600 placeholder-yellow-500 text-white hover:bg-gray-900 focus:bg-gray-900  transition-colors duration-300"
              placeholder="Search products..."
              value={searchProductName}
              onChange={handleSearchChange}
              onClick={handleClick} // เมื่อคลิกที่ช่อง input จะทำให้ dropdown แสดง
            />

            <button
              type="submit"
              className="
                absolute top-0 right-0 h-full
                px-4 text-sm font-medium text-black
                bg-yellow-400 rounded-e-lg border border-gray-700

                transition-all duration-300 ease-out

                hover:bg-[rgb(255,215,0)]
                hover:border-[rgb(255,215,0)]

                hover:shadow-[0_0_8px_rgba(255,215,0,0.7),
                              0_0_16px_rgba(255,215,0,0.5),
                              0_0_24px_rgba(212,175,55,0.6)]

                hover:scale-105
              "
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
              <span className="sr-only">Search</span>
            </button>

            {/* Dropdown suggestions ของสินค้าที่เกี่ยวข้อง */}
            {isDropdownOpen && suggestions.length > 0 && (
              <ul className="dropdown-suggestions absolute left-0 right-0 mt-1 max-h-64 overflow-y-auto bg-gray-800 border border-yellow-500 rounded-lg shadow-md text-sm text-yellow-500 z-50">
                {suggestions.map((item: any) => (
                  <li
                    key={item.id_products}
                    className="px-3 py-2 hover:text-[rgb(255,215,0)]
      hover:[text-shadow:0_0_6px_rgb(255,215,0),0_0_12px_rgb(255,215,0),0_0_20px_rgb(212,175,55)] hover:bg-gray-900 transition-colors duration-300 cursor-pointer flex items-center gap-2"
                    onClick={() => handleSelectProduct(item.name)}
                  >
                    {item.images && item.images.length > 0 && (
                      <img
                        src={item.images[0].url}
                        alt={item.name}
                        className="w-8 h-8 object-cover rounded"
                      />
                    )}
                    <span>{item.name}</span>
                  </li>
                ))}

                {isSearching && (
                  <li className="px-3 py-2 text-gray-400 text-xs">
                    Searching...
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Basket Icon And Wishlist Icon */}
          <div className="relative ml-4 flex items-center gap-4">
            <Link href="/shoppingcart">
              <button className="relative p-2.5 text-black
                bg-yellow-400 rounded-e-lg border border-gray-700

                transition-all duration-300 ease-out

                hover:bg-[rgb(255,215,0)]
                hover:border-[rgb(255,215,0)]

                hover:shadow-[0_0_8px_rgba(255,215,0,0.7),
                              0_0_16px_rgba(255,215,0,0.5),
                              0_0_24px_rgba(212,175,55,0.6)]

                hover:scale-105 
                hover:text-blue-500
                rounded-lg transition duration-300">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 3h18l-2 9H5L3 3z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 17a2 2 0 11-4 0 2 2 0 014 0zM8 17a2 2 0 114 0 2 2 0 01-4 0z"
                  />
                </svg>

                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {totalItems}
                  </span>
                )}
              </button>
            </Link>
            <Link href="/wishlist">
              <button className="relative p-2.5 text-black
                bg-yellow-400 rounded-e-lg border border-gray-700

                transition-all duration-300 ease-out

                hover:bg-[rgb(255,215,0)]
                hover:border-[rgb(255,215,0)]

                hover:shadow-[0_0_8px_rgba(255,215,0,0.7),
                              0_0_16px_rgba(255,215,0,0.5),
                              0_0_24px_rgba(212,175,55,0.6)]

                hover:scale-105 rounded-lg 
                hover:text-pink-500 transition duration-300">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
            </Link>
          </div>
        </div>
      </form>
    </nav>
  );
}
