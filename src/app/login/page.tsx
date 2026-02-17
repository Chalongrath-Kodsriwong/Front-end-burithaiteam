"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Next.js 13 App Router
import Link from "next/link";

import { useCart } from "@/app/context/CartContext";

declare global {
  interface Window {
    google?: any;
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("/");
  const [isLoading, setIsLoading] = useState(false);

  // Google loading
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // ⭐ ใช้สำหรับกัน brute-force แบบฝั่ง client
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  const router = useRouter();

  const [gsiReady, setGsiReady] = useState(false);

  const { refreshCart } = useCart();

  // useEffect(() => {
  //   console.log("GOOGLE_CLIENT_ID:", process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
  // }, []);

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

  // ✅ Load Google Identity Services script + init
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    if (typeof window === "undefined") return;

    function initGoogle() {
      if (!window.google) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
        ux_mode: "popup",
        use_fedcm_for_prompt: false,
      });

      const btn = document.getElementById("googleBtn");
      if (btn) {
        btn.innerHTML = ""; // 🔥 สำคัญมาก ล้างก่อน render ใหม่
        window.google.accounts.id.renderButton(btn, {
          theme: "filled_blue",
          size: "large",
          width: 320,
        });
      }
    }

    const existingScript = document.getElementById("google-gsi");

    if (existingScript) {
      // 🔥 ถ้า script มีอยู่แล้ว ให้ init ใหม่เลย
      initGoogle();
      return;
    }

    const script = document.createElement("script");
    script.id = "google-gsi";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;

    document.body.appendChild(script);
  }, []);

  const afterLoginSuccess = async (user: any) => {
    // refresh cart ก่อน (เหมือนเดิม)
    await refreshCart();

    // เก็บชื่อไว้ให้ Navbar (เหมือนเดิม)
    localStorage.setItem("username", user?.username || "");
    localStorage.setItem("first_name", user?.first_name || "");

    // reset lock
    setLoginAttempts(0);
    setLockedUntil(null);

    // แจ้ง event เหมือนเดิม
    window.dispatchEvent(new Event("login-success"));

    // หา redirect เหมือนเดิม (query > state > "/")
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect") || redirectUrl || "/";

    // ✅ พยายามใช้ Next router ก่อน
    router.push(redirect);

    // ✅ fallback: ถ้า push ไม่พาไปจริงภายใน 150ms ให้ใช้ location
    setTimeout(() => {
      if (window.location.pathname !== redirect) {
        window.location.assign(redirect);
      }
    }, 150);
  };

  // ✅ callback จาก Google จะได้ id token (credential)
  const handleGoogleCredential = async (response: any) => {
    try {
      setError("");
      setIsGoogleLoading(true);

      const tokenId = response?.credential;
      if (!tokenId) {
        setError("ไม่พบ Google credential");
        return;
      }

      const res = await fetch(`${API_URL}/api/auth/google/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ ให้ cookie จาก backend ถูก set
        body: JSON.stringify({ tokenId }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          data?.message && typeof data.message === "string"
            ? data.message
            : "Google login failed";
        setError(msg);
        return;
      }

      // ✅ redirect เหมือน login ปกติ
      await afterLoginSuccess(data.user);

      if (data?.user) {
        localStorage.setItem("username", data.user.username || "");
        localStorage.setItem("first_name", data.user.first_name || "");
      }

      setLoginAttempts(0);
      setLockedUntil(null);

      setTimeout(() => {
        window.dispatchEvent(new Event("login-success"));
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect") || "/";
        router.push(redirect);
      }, 50);
    } catch (err) {
      console.error("Google login error:", err);
      setError("ไม่สามารถ Login ด้วย Google ได้ กรุณาลองใหม่");
    } finally {
      setIsGoogleLoading(false);
    }
  };

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

      const res = await fetch(`${API_URL}/api/auth/login`, {
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
      await afterLoginSuccess(data.user);

      // ⭐ login สำเร็จ → reset ตัวนับ / ลบ lock
      setLoginAttempts(0);
      setLockedUntil(null);

      // ⭐ บันทึก username / first_name ลง localStorage ก่อน
      localStorage.setItem("username", data.user.username);
      localStorage.setItem("first_name", data.user.first_name);

      // ⭐ แจ้ง Navbar ว่า login เสร็จ แล้วค่อย redirect (delay 50ms)
      setTimeout(() => {
        window.dispatchEvent(new Event("login-success"));

        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect") || "/";
        router.push(redirect);
      }, 50);
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

  const isGoogleDisabled = isGoogleLoading; // (จะเพิ่มเงื่อนไขอื่นก็ได้)

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
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center">
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

          <div className="text-sm text-blue-600 cursor-pointer hover:underline">
            <Link href="/request-password">Forgot password?</Link>
          </div>
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
            <div id="googleBtn" className="w-full flex justify-center" />
          </div>
        </div>
      </form>
    </div>
  );
}
