"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import EditAccount from "./section_settingmenu/edit_account";
import EditAddress from "./section_settingmenu/edit_address";
import HistoryPayment from "./section_settingmenu/history_payment";

import { MenuKey } from "@/types/Setting_menuhome"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://158.173.159.107";

export default function SettingMenuPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeMenu, setActiveMenu] = useState<MenuKey>("account");

  const router = useRouter();

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
    });

    window.location.replace("/login"); // ✅ ไปหน้า login + refresh จริง
  };

  if (loading) return <div>กำลังโหลดข้อมูล...</div>;

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-200 p-5">
        <h2 className="text-xl font-semibold mb-4">ตั้งค่า</h2>

        <ul className="space-y-2">
          <li>
            <button
              onClick={() => setActiveMenu("account")}
              className={`w-full text-left px-3 py-2 rounded ${
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
              onClick={() => setActiveMenu("address")}
              className={`w-full text-left px-3 py-2 rounded ${
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
              onClick={() => setActiveMenu("history")}
              // onClick={() => router.push("/history_payment")}
              className={`w-full text-left px-3 py-2 rounded ${
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
              className="w-full text-left px-3 py-2 rounded text-red-600 hover:bg-gray-300"
            >
              Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6">
        {activeMenu === "account" && <EditAccount user={user} />}
        {activeMenu === "address" && <EditAddress user={user} />}
        {activeMenu === "history" && <HistoryPayment user={user} />}
      </div>
    </div>
  );
}
