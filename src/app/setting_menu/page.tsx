"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import EditAccount from "./section_settingmenu/edit_account";
import EditAddress from "./section_settingmenu/edit_address";
import HistoryPayment from "./section_settingmenu/history_payment";
import { clearClientAuthData } from "@/app/utils/authClient";

import { MenuKey } from "@/types/Setting_menuhome"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function SettingMenuPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeMenu, setActiveMenu] = useState<MenuKey>("account");

  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const menuParam = (params.get("menu") || "").toLowerCase();
    if (menuParam === "history") setActiveMenu("history");
    else if (menuParam === "address") setActiveMenu("address");
    else if (menuParam === "account") setActiveMenu("account");
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/account/profile`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) throw new Error("Failed to fetch user data");

        const data = await response.json();
        setUser(data.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => null);

    clearClientAuthData();
    window.dispatchEvent(new Event("user-logout"));
    window.dispatchEvent(new Event("login-success"));

    window.location.replace("/login"); // ✅ ไปหน้า login + refresh จริง
  };

  const handleMenuChange = (menu: MenuKey) => {
    setActiveMenu(menu);
    router.replace(`/setting_menu?menu=${menu}`);
  };

  if (loading) return <div className="px-4 py-6 text-sm md:text-base">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="setting-menu-theme min-h-screen flex flex-row bg-gray-100">
      {/* Sidebar */}
      <div className="w-[118px] sm:w-[136px] md:w-64 shrink-0 bg-gray-200 p-2 sm:p-3 md:p-5">
        <h2 className="text-sm sm:text-base md:text-xl font-semibold mb-2 sm:mb-3 md:mb-4">ตั้งค่า</h2>

        <ul className="space-y-1.5 md:space-y-2">
          <li>
            <button
              onClick={() => handleMenuChange("account")}
              className={`w-full text-left text-xs sm:text-sm md:text-base px-2 py-1.5 sm:py-2 rounded ${
                activeMenu === "account"
                  ? "bg-white font-semibold"
                  : "hover:bg-gray-300"
              }`}
            >
              Account
            </button>
          </li>

          <li>
            <button
              onClick={() => handleMenuChange("address")}
              className={`w-full text-left text-xs sm:text-sm md:text-base px-2 py-1.5 sm:py-2 rounded ${
                activeMenu === "address"
                  ? "bg-white font-semibold"
                  : "hover:bg-gray-300"
              }`}
            >
              Address
            </button>
          </li>

          <li>
            <button
              onClick={() => handleMenuChange("history")}
              className={`w-full text-left text-xs sm:text-sm md:text-base px-2 py-1.5 sm:py-2 rounded ${
                activeMenu === "history"
                  ? "bg-white font-semibold"
                  : "hover:bg-gray-300"
              }`}
            >
              History Payment
            </button>
          </li>

          <li>
            <button
              onClick={handleLogout}
              className="w-full text-left text-xs sm:text-sm md:text-base px-2 py-1.5 sm:py-2 rounded text-red-600 hover:bg-gray-300"
            >
              Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0 p-2.5 sm:p-4 md:p-6">
        {activeMenu === "account" && <EditAccount user={user} />}
        {activeMenu === "address" && <EditAddress user={user} />}
        {activeMenu === "history" && <HistoryPayment user={user} />}
      </div>
    </div>
  );
}
