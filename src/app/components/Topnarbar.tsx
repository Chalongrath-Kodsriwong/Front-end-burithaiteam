"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { fetchWithTimeout } from "@/app/utils/fetchWithTimeout";
import NavUserMenu from "./navbar/NavUserMenu";
import NavSearchBar from "./navbar/NavSearchBar";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function TopNavbar() {
  const pathname = usePathname();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "หน้าแรก", href: "/" },
    { label: "เกี่ยวกับเรา", href: "/about" },
    { label: "ติดต่อ", href: "/contact" },
    { label: "สินค้า", href: "/product" },
    { label: "ออกแบบ", href: "/design" },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const checkLogin = async () => {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/api/carts`, {
        credentials: "include",
      });
      setIsLoggedIn(res.status === 200);
    } catch {
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    const name = localStorage.getItem("username");
    if (name) setUsername(name);
  }, []);

  useEffect(() => {
    checkLogin();
  }, []);

  useEffect(() => {
    function handleLoginSuccess() {
      setTimeout(() => {
        const name = localStorage.getItem("username");
        setUsername(name || null);
        checkLogin();
      }, 50);
    }
    window.addEventListener("login-success", handleLoginSuccess);
    return () => window.removeEventListener("login-success", handleLoginSuccess);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutsideMobile(e: MouseEvent) {
      if (
        e.target instanceof HTMLElement &&
        !e.target.closest(".mobile-menu-area") &&
        !e.target.closest(".mobile-nav-dropdown")
      ) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutsideMobile);
    return () => document.removeEventListener("mousedown", handleClickOutsideMobile);
  }, []);

  return (
    <nav className="bg-[rgb(26,26,26)] border-gray-200">
      <div className="w-full flex items-center justify-between gap-2 p-3 md:p-4">
        {/* LEFT LOGO */}
        <Link href="/" className="min-w-0 flex items-center space-x-2 sm:space-x-3 rtl:space-x-reverse">
          <Image
            src="/image/logo_black-removebg-preview.png"
            alt="Logo"
            width={70}
            height={70}
            className="h-9 sm:h-14 md:h-[70px] w-auto"
            priority
          />
          <span className="self-center max-w-[130px] sm:max-w-none text-xs sm:text-xl md:text-2xl font-semibold text-yellow-500 whitespace-nowrap truncate">
            BuriThaiTeam
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
                  className="relative z-10 text-yellow-500 px-2 py-1 transition-all duration-300
                    group-hover:text-[rgb(255,215,0)]
                    group-hover:[text-shadow:0_0_6px_rgb(255,215,0),0_0_12px_rgb(255,215,0),0_0_20px_rgb(212,175,55)]"
                >
                  {label}
                </Link>
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="w-[45px] h-[35px] rounded-full bg-[rgba(212,175,55,0.25)] scale-0 opacity-0
                    group-hover:scale-150 group-hover:opacity-100 transition-all duration-500
                    group-hover:[box-shadow:0_0_10px_rgba(212,175,55,0.4),0_0_20px_rgba(212,175,55,0.3)]" />
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT: mobile hamburger + user menu / login */}
        <div className="shrink-0 flex items-center gap-2 sm:gap-4">
          {/* Mobile hamburger */}
          <div className="relative md:hidden mobile-menu-area">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-md border bg-gray-800 text-yellow-500 transition-all duration-300 ease-out hover:bg-gray-900 hover:text-[rgb(255,215,0)] ${
                isMobileMenuOpen ? "border-[rgb(255,215,0)] shadow-[0_0_10px_rgba(255,215,0,0.18)]" : "border-gray-600"
              }`}
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              <svg
                className={`h-5 w-5 transition-all duration-300 ease-out ${isMobileMenuOpen ? "rotate-90 scale-95" : "rotate-0 scale-100"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 7h16M4 12h16M4 17h16"}
                />
              </svg>
            </button>
          </div>

          {/* Login button or user menu */}
          {!isLoggedIn ? (
            <Link href="/login">
              <button className="block bg-[rgb(212,175,55)] py-1.5 px-2.5 text-xs sm:text-base sm:py-2 sm:px-4 text-black rounded-md transition-all duration-300 hover:scale-105 hover:bg-[rgb(255,215,0)] hover:[box-shadow:0_0_10px_rgb(255,215,0),0_0_20px_rgb(255,215,0)]">
                เข้าสู่ระบบ
              </button>
            </Link>
          ) : (
            <NavUserMenu
              isLoggedIn={isLoggedIn}
              username={username}
              setIsLoggedIn={setIsLoggedIn}
              setUsername={setUsername}
            />
          )}
        </div>
      </div>

      {/* MOBILE NAV ITEMS */}
      <div
        className={`mobile-nav-dropdown md:hidden w-full px-3 overflow-hidden transition-all duration-500 ease-out ${
          isMobileMenuOpen ? "max-h-72 opacity-100 pb-2 translate-y-0" : "max-h-0 opacity-0 pb-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="rounded-lg border border-gray-700 bg-gray-900/95 shadow-lg backdrop-blur-sm">
          <div className={`transition-all duration-500 ease-out ${isMobileMenuOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-2 scale-95"}`}>
            <ul className="py-1">
              {navItems.map(({ label, href }) => (
                <li key={`mobile-${href}`}>
                  <Link
                    href={href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-current={isActive(href) ? "page" : undefined}
                    className={`block px-4 py-2.5 text-sm font-medium transition-colors duration-300 ${
                      isActive(href)
                        ? "bg-[rgb(212,175,55)] text-black"
                        : "text-yellow-500 hover:bg-gray-800 hover:text-[rgb(255,215,0)]"
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <NavSearchBar />
    </nav>
  );
}
