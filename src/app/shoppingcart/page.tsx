"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DisplayItemCart from "../shoppingcart/section_shoppingcart/displayItemCart";
import Normalproducts from "../components/section_page/Normalproducts";
import { Link } from "lucide-react";
import { fetchAuthSession } from "@/app/utils/authClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function ShoppingCartPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);  // State for handling errors

  // ⭐ 1) เช็คการ Login ผ่าน Backend (เช็ค JWT HttpOnly cookie)
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetchAuthSession(API_URL);

        // ❌ ถ้าไม่มี token → ให้ redirect ไป Login
        if (res.status === 401) {
          router.replace(`/login?redirect=/shoppingcart`);
          return;
        }

        // ✔ มี token → อนุญาตให้เข้า cart ได้
        setAuthChecked(true);
      } catch (err) {
        // ถ้าเกิด error ในการตรวจสอบ ก็ให้ redirect ไปหน้า Login
        setError("Error checking authentication, please try again.");  // Handle error
        router.replace(`/login?redirect=/shoppingcart`);
      }
    }

    checkAuth();
  }, [router]);

  // ระหว่างกำลังเช็ค auth
  if (!authChecked) {
    return <p className="p-4">กำลังตรวจสอบสิทธิ์การเข้าสู่ระบบ...</p>;
  }

  // Handling errors in case of failure
  if (error) {
    return (
      <div className="text-center text-red-500 mb-4">
        <p>{error}</p>
        <Link href="/login?redirect=/shoppingcart">
          <button className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Login
          </button>
        </Link>
      </div>
    );
  }

  // ⭐ 2) พอ auth ผ่านแล้ว → ให้หน้า cart ทำงานปกติ
  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <DisplayItemCart />
      </div>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <Normalproducts />
      </div>
    </>
  );
}
