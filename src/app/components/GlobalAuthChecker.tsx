"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { clearClientAuthData, fetchAuthSession } from "@/app/utils/authClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function GlobalAuthGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;

    const clearLocalAuth = () => {
      clearClientAuthData();
      window.dispatchEvent(new Event("login-success"));
    };

    const checkAuth = async () => {
      try {
        const res = await fetchAuthSession(API_URL);

        if (cancelled) return;

        if (res.status === 401 || res.status === 403) {
          clearLocalAuth();
          return;
        }

        // Login อยู่แล้ว แต่เปิดหน้า login → เด้งกลับหน้าแรก
        if (res.ok && pathname === "/login" && !cancelled) {
          router.replace("/");
        }
      } catch {
        // ไม่ต้อง log อะไร
      }
    };

    checkAuth();

    const interval = setInterval(checkAuth, 600000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [pathname, router]);

  return null;
}
