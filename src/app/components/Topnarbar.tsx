"use client";

// เพิ่ม import
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function TopNavbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);  // Dropdown ของสินค้า
  const [isDropdownOpenCategories, setIsDropdownOpenCategories] =
    useState(false); // Dropdown ของ Categories
  const router = useRouter();

  const [searchProductName, setSearchProductName] = useState("");
  const [searchCategories, setSearchCategories] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const pathname = usePathname();
  const { cartItems } = useCart();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // ⭐ เพิ่ม state categories
  const [categories, setCategories] = useState<string[]>([]);

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
      setIsDropdownOpen(false);  // ปิด dropdown เมื่อคลิกที่อื่น
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

  

  return (
    <nav className="bg-white border-gray-200 dark:bg-gray-900">
      <div className="w-full flex flex-wrap items-center justify-between p-4">
        <Link
          href="/"
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <img
            src="/image/logo_black-removebg-preview.png"
            className="h-[70px]"
            alt="Logo"
          />
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
            Burithaiteam
          </span>
        </Link>

        {/* hamburger (เดิม) */}
        <button
          data-collapse-toggle="navbar-default"
          type="button"
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
          aria-controls="navbar-default"
          aria-expanded="false"
        >
          <span className="sr-only">Open main menu</span>
          <svg
            className="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 17 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 1h15M1 7h15M1 13h15"
            />
          </svg>
        </button>

        <div className="hidden w-full md:block md:w-auto" id="navbar-default">
          <ul className="font-medium flex flex-col justify-center items-center p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            {navItems.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive(href) ? "page" : undefined}
                  className={`${base} ${isActive(href) ? active : inactive}`}
                >
                  {label}
                </Link>
              </li>
            ))}

            <li>
              <Link href="/login" className="text-white">
                <button className="block bg-blue-700 py-2 px-3 text-white rounded-md hover:bg-blue-700 md:pl-2 md:pr-2 dark:text-white dark:hover:bg-blue-800">
                  Login
                </button>
              </Link>
            </li>
          </ul>
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
            } // เปิด/ปิด dropdown ของ categories
            className="shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-gray-900 bg-gray-100 border border-gray-300 rounded-s-lg hover:bg-gray-200 focus:outline-none dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white dark:border-gray-600"
          >
            All categories
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
            <div className="absolute top-14 z-50 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-[200px] dark:bg-gray-700">
              <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                {/* ⭐ NEW: ปุ่ม All แสดงสินค้าทั้งหมด */}
                <li>
                  <button
                    type="button"
                    className="inline-flex w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white font-semibold"
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
                      className="inline-flex w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                      onClick={() => {
                        router.push(
                          `/product?category=${encodeURIComponent(cat)}`
                        );
                        setIsDropdownOpenCategories(false);
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
  className="search-bar block p-2.5 w-full z-10 text-sm text-gray-900 bg-gray-50 rounded-e-lg border-s-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
  placeholder="Search products..."
  value={searchProductName}
  onChange={handleSearchChange}
  onClick={handleClick}  // เมื่อคลิกที่ช่อง input จะทำให้ dropdown แสดง
/>


            <button
              type="submit"
              className="absolute top-0 right-0 p-2.5 text-sm font-medium h-full text-white bg-blue-700 rounded-e-lg border border-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
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
            {/* Dropdown suggestions ของสินค้าที่เกี่ยวข้อง */}
{isDropdownOpen && suggestions.length > 0 && (
  <ul className="dropdown-suggestions absolute left-0 right-0 mt-1 max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-md text-sm z-50">
    {suggestions.map((item: any) => (
      <li
        key={item.id_products}
        className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
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

          {/* Basket Icon */}
          <div className="relative ml-4">
            <Link href="/shoppingcart">
              <button className="relative p-2.5 text-blue-900 bg-blue-100 rounded-lg hover:bg-blue-200">
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
          </div>
        </div>
      </form>
    </nav>
  );
}
