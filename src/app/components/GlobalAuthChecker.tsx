"use client";
import { useCallback, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { clearClientAuthData, fetchAuthSession } from "@/app/utils/authClient";
import { isProtectedPath } from "@/app/utils/protectedRoutes";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

/** หน้าที่ต้องล็อกอินเช็กถี่กว่า เพราะนั่งค้างอยู่แล้วหมดเวลาคือปัญหาจริง */
const CHECK_INTERVAL_PROTECTED = 60_000;
const CHECK_INTERVAL_PUBLIC = 600_000;

export default function GlobalAuthGuard() {
  const router = useRouter();
  const pathname = usePathname();

  // กัน redirect ซ้ำหลายรอบตอนเช็กหลายตัวชนกัน
  const redirecting = useRef(false);

  const handleExpired = useCallback(() => {
    clearClientAuthData();
    window.dispatchEvent(new Event("login-success"));

    // หน้าสาธารณะไม่ต้องเด้ง แค่ล้างสถานะล็อกอินให้ navbar อัปเดตก็พอ
    if (!isProtectedPath(pathname)) return;

    if (redirecting.current) return;
    redirecting.current = true;

    const current = `${pathname}${window.location.search}`;
    router.replace(`/login?redirect=${encodeURIComponent(current)}`);
  }, [pathname, router]);

  useEffect(() => {
    let cancelled = false;
    redirecting.current = false;

    const checkAuth = async () => {
      try {
        const res = await fetchAuthSession(API_URL);
        if (cancelled) return;

        /**
         * เดิมเจอ 401/403 แล้วแค่ล้างข้อมูลล็อกอินในเครื่อง **แต่ไม่เด้งไปไหน**
         * คนที่นั่งค้างอยู่หน้า check_order จึงอยู่ต่อได้ทั้งที่หมดเวลาแล้ว
         * เห็นหน้าเปล่าหรือ error แทนที่จะถูกพาไปล็อกอินใหม่
         */
        if (res.status === 401 || res.status === 403) {
          handleExpired();
          return;
        }

        // Login อยู่แล้ว แต่เปิดหน้า login → เด้งกลับหน้าแรก
        if (res.ok && pathname === "/login" && !cancelled) {
          router.replace("/");
        }
      } catch {
        // ต่อเน็ตไม่ได้ ไม่ใช่เรื่องหมดเวลา อย่าเด้งคนออกเพราะเน็ตสะดุด
      }
    };

    checkAuth();

    const interval = setInterval(
      checkAuth,
      isProtectedPath(pathname) ? CHECK_INTERVAL_PROTECTED : CHECK_INTERVAL_PUBLIC
    );

    // กลับมาที่แท็บแล้วเช็กทันที — คนมักสลับไปทำอย่างอื่นนานๆ
    // แล้วกลับมาเจอหน้าค้างที่หมดเวลาไปแล้ว
    const onFocus = () => {
      if (document.visibilityState === "visible") checkAuth();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [pathname, router, handleExpired]);

  return null;
}
