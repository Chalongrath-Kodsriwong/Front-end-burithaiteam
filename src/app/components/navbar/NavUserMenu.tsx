"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { UserCircle } from "lucide-react";
import { clearClientAuthData } from "@/app/utils/authClient";
import { fetchWithTimeout } from "@/app/utils/fetchWithTimeout";
import { useCart } from "@/app/context/CartContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface NavUserMenuProps {
  isLoggedIn: boolean;
  username: string | null;
  setIsLoggedIn: (v: boolean) => void;
  setUsername: (v: string | null) => void;
}

export default function NavUserMenu({
  isLoggedIn,
  username,
  setIsLoggedIn,
  setUsername,
}: NavUserMenuProps) {
  const router = useRouter();
  const { clearCart } = useCart();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const fetchProfileAvatar = async () => {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/api/account/profile`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) { setAvatarUrl(null); return; }
      const json = await res.json().catch(() => ({}));
      const url = json?.data?.avatar || null;
      setAvatarUrl(typeof url === "string" && url.trim() ? url : null);
    } catch {
      setAvatarUrl(null);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchProfileAvatar();
      setIsUserMenuOpen(false);
    } else {
      setAvatarUrl(null);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const handler = () => fetchProfileAvatar();
    window.addEventListener("avatar-updated", handler);
    return () => window.removeEventListener("avatar-updated", handler);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
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
  };

  return (
    <div
      ref={menuRef}
      className="flex flex-col items-center ml-2 mr-2 cursor-pointer select-none relative"
      onClick={() => setIsUserMenuOpen((prev) => !prev)}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt="avatar"
          width={28}
          height={28}
          className="w-7 h-7 rounded-full object-cover border border-[rgba(212,175,55,0.5)]"
          unoptimized={avatarUrl.startsWith("http")}
          onError={() => setAvatarUrl(null)}
        />
      ) : (
        <UserCircle size={28} className="text-[rgb(212,175,55)]" />
      )}

      <div className="flex items-center gap-1 mt-1 max-w-[120px] sm:max-w-[160px]">
        <span className="inline text-xs sm:text-[15px] text-white truncate">
          {username}
        </span>
        <svg
          className={`w-3 h-3 text-white transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      <div
        className={`
          absolute top-[55px] right-0 min-w-[140px] bg-[rgb(30,30,30)] shadow-md rounded-md overflow-hidden
          transition-all duration-300 z-50
          ${isUserMenuOpen ? "opacity-100 max-h-[200px] pointer-events-auto" : "opacity-0 max-h-0 pointer-events-none"}
        `}
      >
        <button
          onClick={() => { window.location.href = "/setting_menu?menu=history"; }}
          className="block w-full text-left px-6 py-1 text-[rgba(212,175,55)] hover:bg-[rgba(212,175,55,0.25)] text-sm transition-colors duration-200"
        >
          ประวัติการสั่งซื้อ
        </button>

        <button
          onClick={() => { window.location.href = "/setting_menu?menu=account"; }}
          className="block w-full text-left px-6 py-1 text-[rgba(212,175,55)] hover:bg-[rgba(212,175,55,0.25)] text-sm transition-colors duration-200"
        >
          การตั้งค่า
        </button>

        <button
          onClick={handleLogout}
          className="block w-full text-left px-6 py-1 text-red-600 hover:bg-[rgba(115,0,0,0.50)] text-sm"
        >
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
}
