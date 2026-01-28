"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// API endpoint
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function SettingMenuPage() {
  const [user, setUser] = useState<any>(null); // User data
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/account/profile`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUser(data.data); // Set the data from API response
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // If loading, show loading message
  if (loading) {
    return <div>กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-200 p-5">
        <h2 className="text-xl font-semibold mb-4">ตั้งค่า</h2>
        <ul className="space-y-4">
          <li>
            <Link
              href="/settings/profile"
              className="text-blue-600 hover:underline"
            >
              Account
            </Link>
          </li>
          <li>
            <Link
              href="/settings/address"
              className="text-blue-600 hover:underline"
            >
              Address
            </Link>
          </li>
          <li>
            <Link
              href="/history_payment"
              className="text-blue-600 hover:underline"
            >
              History Payment
            </Link>
          </li>
          <li>
            <button
              onClick={async () => {
                // Logout logic
                await fetch(`${API_URL}/api/auth/logout`, {
                  method: "POST",
                  credentials: "include",
                });
                router.push("/login");
              }}
              className="text-red-600 hover:underline"
            >
              Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Profile Area */}
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

        {/* Profile Picture and User Information */}
        <div className="flex gap-8">
          {/* User Profile Picture */}
          <div className="w-48 h-48 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Profile Picture"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span>แสดงรูปภาพ User</span>
            )}
          </div>

          {/* User Details */}
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">User Information</h3>
            <p><strong>ชื่อ:</strong> {user?.firstName} {user?.lastName}</p>
            <p><strong>ชื่อผู้ใช้:</strong> {user?.username}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>โทรศัพท์:</strong> {user?.phone}</p>
            <p><strong>เพศ:</strong> {user?.gender}</p>
            <p><strong>วันเกิด:</strong> {new Date(user?.birthday).toLocaleDateString("th-TH")}</p>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4">
          <Link href="/settings/change-password">
            <button className="bg-blue-500 text-white px-4 py-2 rounded">
              Change Password
            </button>
          </Link>
          <Link href="/settings/edit-profile">
            <button className="bg-blue-500 text-white px-4 py-2 rounded">
              Edit Account
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
