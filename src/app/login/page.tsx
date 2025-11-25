"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Next.js 13 App Router
import Link from "next/link";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("/");
  const [isLoading, setIsLoading] = useState(false);

  // ⭐ ใช้สำหรับกัน brute-force แบบฝั่ง client
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  const router = useRouter();

  // อ่าน redirect จาก URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setRedirectUrl(params.get("redirect") || "/");

      // ⭐ โหลดสถานะ lock จาก localStorage (กันรีเฟรชแล้วหาย)
      const lockData = window.localStorage.getItem("login_lock");
      if (lockData) {
        try {
          const parsed = JSON.parse(lockData);
          if (parsed.lockedUntil && parsed.lockedUntil > Date.now()) {
            setLockedUntil(parsed.lockedUntil);
          } else {
            window.localStorage.removeItem("login_lock");
          }
        } catch {
          window.localStorage.removeItem("login_lock");
        }
      }
    }
  }, []);

  // ถ้า lockedUntil เปลี่ยน → sync ไป localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (lockedUntil && lockedUntil > Date.now()) {
      window.localStorage.setItem(
        "login_lock",
        JSON.stringify({ lockedUntil })
      );
    } else {
      window.localStorage.removeItem("login_lock");
    }
  }, [lockedUntil]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setError("");

    // ⭐ เช็คว่าโดนล็อกชั่วคราวไหม
    if (lockedUntil && lockedUntil > Date.now()) {
      const remainSec = Math.ceil((lockedUntil - Date.now()) / 1000);
      setError(
        `คุณพยายามเข้าสู่ระบบผิดหลายครั้ง โปรดลองใหม่ในอีก ${remainSec} วินาที`
      );
      return;
    }

    // validate เบื้องต้น
    if (!identifier || !password) {
      setError("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    try {
      setIsLoading(true);

      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
        credentials: "include", // ส่ง cookies พร้อม request
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // ⭐ เพิ่มการนับจำนวนครั้งที่ login ผิด
        setLoginAttempts((prev) => {
          const next = prev + 1;

          // ถ้าผิดเกิน 5 ครั้ง → ล็อก 60 วินาที
          if (next >= 5) {
            const lockTime = Date.now() + 60 * 1000;
            setLockedUntil(lockTime);
            setError(
              "คุณพยายามเข้าสู่ระบบผิดหลายครั้ง ระบบขอล็อกชั่วคราว 1 นาที"
            );
          } else {
            // ข้อความ error แบบควบคุมเอง
            const msg =
              data?.message && typeof data.message === "string"
                ? data.message
                : "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
            setError(msg);
          }

          return next;
        });

        return;
      }

      console.log("Logged in user:", data.user);

      // ⭐ login สำเร็จ → reset ตัวนับ / ลบ lock
      setLoginAttempts(0);
      setLockedUntil(null);

      // redirect กลับหน้าที่มาก่อน
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect") || "/";
      router.push(redirect);
    } catch (err) {
      console.error("Login error:", err);
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  // helper: ปุ่มควรถูก disable เมื่อ?
  const isSubmitDisabled =
    isLoading ||
    !identifier ||
    !password ||
    (lockedUntil && lockedUntil > Date.now());

  return (
    <div className="container px-0 mx-auto p-2">
      <form
        onSubmit={handleSubmit}
        className="max-w-sm mx-auto bg-gray-100 p-6 rounded-lg shadow-md mt-5"
      >
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-6">Sign In</h1>
        </div>

        {/* Email */}
        <div className="mb-5">
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className={`shadow-xs bg-gray-50 border ${
              error && submitted ? "border-red-600" : "border-gray-300"
            } text-gray-900 text-sm rounded-lg block w-full p-2.5`}
            placeholder="Please enter your email"
          />
        </div>

        {/* Password */}
        <div className="mb-5">
          <label
            htmlFor="password"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`shadow-xs bg-gray-50 border ${
                error && submitted ? "border-red-600" : "border-gray-300"
              } text-gray-900 text-sm rounded-lg block w-full p-2.5`}
              placeholder="Please enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {/* Error Message (รวมทุกกรณี) */}
        {error && (
          <p className="text-red-600 text-sm mt-1 mb-3 text-center">{error}</p>
        )}

        {/* Remember Me */}
        <div className="flex items-start mb-5">
          <input
            id="remember"
            type="checkbox"
            className="w-4 h-4 border border-gray-300 rounded-sm bg-gray-50 focus:ring-1"
          />
          <label
            htmlFor="remember"
            className="ml-2 text-sm font-medium text-gray-900"
          >
            Remember me?
          </label>
        </div>

        {/* Sign In Button */}
        <div className="flex flex-col gap-3 text-center">
          <button
            type="submit"
            disabled={!!isSubmitDisabled}
            className={`w-full py-2 text-white font-medium rounded-lg text-sm cursor-pointer ${
              isSubmitDisabled
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-black hover:bg-gray-800"
            }`}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        {/* Sign Up */}
        <div className="flex items-center justify-center mt-3 text-sm text-gray-600">
          <span className="flex-grow h-px bg-gray-500"></span>
          <span className="px-3">Don't have an account?</span>
          <span className="flex-grow h-px bg-gray-500"></span>
        </div>

        <Link href={`/register?redirect=${redirectUrl}`}>
          <button
            type="button"
            className="w-full mt-3 py-2 text-white bg-black hover:bg-gray-800 font-medium rounded-lg text-sm cursor-pointer"
          >
            Sign Up
          </button>
        </Link>

        {/* Social Sign-In */}
        <div className="flex flex-col gap-5 mt-5 text-center">
          <div className="flex items-center justify-center text-sm text-gray-600">
            <span className="flex-grow h-px bg-gray-500"></span>
            <span className="px-3">Sign in with social accounts</span>
            <span className="flex-grow h-px bg-gray-500"></span>
          </div>

          <div className="flex flex-col gap-3 text-center">
            <Link href="/">
              <button
                type="button"
                className="w-full py-2 text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm cursor-pointer"
              >
                Continue with Facebook
              </button>
            </Link>
            <Link href="/">
              <button
                type="button"
                className="w-full py-2 text-white bg-red-600 hover:bg-red-700 font-medium rounded-lg text-sm cursor-pointer"
              >
                Continue with Google
              </button>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
