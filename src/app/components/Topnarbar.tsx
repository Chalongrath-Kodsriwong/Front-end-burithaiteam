"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopNavbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();

  // เมนูหลัก
  const navItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Product", href: "/product" },
  ];

  // class ร่วม
  const base =
    "block py-2 px-3 rounded-sm md:p-0";
  const inactive =
    "text-gray-900 hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent";
  const active =
    "text-white bg-blue-700 md:bg-transparent md:text-blue-700 dark:text-white md:dark:text-blue-500";

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname.startsWith(href);

  return (
    <nav className="bg-white border-gray-200 dark:bg-gray-900">
      <div className="w-full flex flex-wrap items-center justify-between p-4">
        <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
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
          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
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
              <button className="block bg-blue-700 py-2 px-3 text-white rounded-md hover:bg-blue-700 md:pl-2 md:pr-2 dark:text-white dark:hover:bg-blue-800">
                Login
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Search Form (คงเดิม แค่สั้นลงเล็กน้อย) */}
      <form className="relative z-40 p-2 border-t border-solid">
        <div className="flex items-center justify-between max-w-screen-md mx-auto">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-gray-900 bg-gray-100 border border-gray-300 rounded-s-lg hover:bg-gray-200 focus:outline-none dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white dark:border-gray-600"
          >
            All categories
            <svg className="w-2.5 h-2.5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
            </svg>
          </button>

          {/* dropdown list ใช้ map เหมือนกัน */}
          {isDropdownOpen && (
            <div className="absolute top-14 z-50 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-[200px] dark:bg-gray-700">
              <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                {["Mockups", "Templates", "Design", "Logos"].map((item) => (
                  <li key={item}>
                    <button type="button" className="inline-flex w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="relative w-full">
            <input
              type="search"
              className="block p-2.5 w-full z-10 text-sm text-gray-900 bg-gray-50 rounded-e-lg border-s-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="Search Mockups, Logos, Design Templates..."
            />
            <button
              type="submit"
              className="absolute top-0 right-0 p-2.5 text-sm font-medium h-full text-white bg-blue-700 rounded-e-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
              </svg>
              <span className="sr-only">Search</span>
            </button>
          </div>
        </div>
      </form>
    </nav>
  );
}
