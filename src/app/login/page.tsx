"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation"; // Next.js 13 App Router
import Link from "next/link";

import { useCart } from "@/app/context/CartContext";
import { fetchAuthSession } from "@/app/utils/authClient";

declare global {
  interface Window {
    google?: any;
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

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
  const [isGoogleReady, setIsGoogleReady] = useState(false);

  // ⭐ ใช้สำหรับกัน brute-force แบบฝั่ง client
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  const router = useRouter();

  const googleInitRef = useRef(false);

  const { refreshCart } = useCart();

  const [rememberMe, setRememberMe] = useState(false);

  const REMEMBER_KEY = "remember_login_v1";

  // useEffect(() => {
  //   console.log("GOOGLE_CLIENT_ID:", process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
  // }, []);

  // อ่าน redirect จาก URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setRedirectUrl(params.get("redirect") || "/");

      // ⭐ โหลด remember login
      const remember = window.localStorage.getItem(REMEMBER_KEY);
      if (remember) {
        try {
          const parsed = JSON.parse(remember);
          if (parsed?.identifier) setIdentifier(parsed.identifier);
          if (parsed?.password) setPassword(parsed.password);
          setRememberMe(true);
        } catch {
          window.localStorage.removeItem(REMEMBER_KEY);
        }
      }

      // ⭐ โหลดสถานะ lock จาก localStorage (ของเดิม)
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
        JSON.stringify({ lockedUntil }),
      );
    } else {
      window.localStorage.removeItem("login_lock");
    }
  }, [lockedUntil]);

  // ✅ Load Google Identity Services script + init
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "::1";

    // Google GIS does not reliably work on insecure origins except localhost.
    // Redirect plain-http IP/domain traffic to production HTTPS.
    if (!isLocalhost && window.location.protocol === "http:") {
      const target = `https://burithaiteam.com/login${window.location.search || ""}`;
      window.location.replace(target);
    }
  }, []);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    if (typeof window === "undefined") return;

    function initGoogle() {
      if (!window.google || googleInitRef.current) return;
      googleInitRef.current = true;

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
        setIsGoogleReady(true);
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

  const handleGoogleFallbackClick = () => {
    if (!window.google?.accounts?.id) {
      setError(
        "Google Sign-In ยังไม่พร้อม กรุณารีเฟรชหน้า หรือเข้าใช้งานผ่าน https://burithaiteam.com/login",
      );
      return;
    }

    try {
      window.google.accounts.id.prompt();
    } catch {
      setError("ไม่สามารถเปิด Google Sign-In ได้ กรุณาลองใหม่");
    }
  };

  const afterLoginSuccess = async (user: any) => {
    await refreshCart();

    localStorage.setItem("username", user?.username || "");
    localStorage.setItem("first_name", user?.first_name || "");

    // ✅ Remember me logic
    if (rememberMe) {
      window.localStorage.setItem(
        REMEMBER_KEY,
        JSON.stringify({ identifier, password }),
      );
    } else {
      window.localStorage.removeItem(REMEMBER_KEY);
    }

    setLoginAttempts(0);
    setLockedUntil(null);

    window.dispatchEvent(new Event("login-success"));

    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect") || redirectUrl || "/";

    router.push(redirect);

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

      await afterLoginSuccess(data.user);
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
        `คุณพยายามเข้าสู่ระบบผิดหลายครั้ง โปรดลองใหม่ในอีก ${remainSec} วินาที`,
      );
      return;
    }

    // validate เบื้องต้น
    if (!identifier || !password) {
      setError("กรุณากรอก Username/Email และรหัสผ่าน");
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
              "คุณพยายามเข้าสู่ระบบผิดหลายครั้ง ระบบขอล็อกชั่วคราว 1 นาที",
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

  // useEffect(() => {
  //   if (typeof window === "undefined") return;

  //   const username = localStorage.getItem("username");

  //   if (username) {
  //     router.replace("/");
  //   }
  // }, []);

  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetchAuthSession(API_URL);

        if (res.ok) {
          // 🔥 login อยู่ → ห้ามเข้า login
          router.replace("/");
          return;
        }

        if (res.status === 401) {
          // 🔥 token หมด → ลบ user
          localStorage.removeItem("username");
          localStorage.removeItem("first_name");
        }
      } catch {}

      setCheckingAuth(false);
    };

    checkAuth();
  }, [router]);
  if (checkingAuth) return null;

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
            htmlFor="identifier"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Username or Email
          </label>

          <input
            type="text"
            id="identifier"
            name="identifier"
            autoComplete="username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className={`shadow-xs bg-gray-50 border ${
              error && submitted ? "border-red-600" : "border-gray-300"
            } text-gray-900 text-sm rounded-lg block w-full p-2.5`}
            placeholder="Enter username or email"
            inputMode="email"
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
              autoComplete="current-password"
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
              checked={rememberMe}
              onChange={(e) => {
                const checked = e.target.checked;
                setRememberMe(checked);

                // ถ้า user เอาติ๊กออก ให้ล้างข้อมูลที่จำไว้ทันที
                if (!checked && typeof window !== "undefined") {
                  window.localStorage.removeItem(REMEMBER_KEY);
                }
              }}
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
            {!isGoogleReady && (
              <button
                type="button"
                onClick={handleGoogleFallbackClick}
                disabled={isGoogleLoading}
                className="w-full py-2 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-800 hover:bg-gray-100 disabled:opacity-60"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="h-7 w-7"
                    aria-hidden="true"
                  >
                    <path
                      fill="#FFC107"
                      d="M43.611 20.083H42V20H24v8h11.303C33.656 32.657 29.249 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.84 1.154 7.957 3.043l5.657-5.657C34.046 6.053 29.27 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                    />
                    <path
                      fill="#FF3D00"
                      d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.84 1.154 7.957 3.043l5.657-5.657C34.046 6.053 29.27 4 24 4c-7.682 0-14.341 4.337-17.694 10.691z"
                    />
                    <path
                      fill="#4CAF50"
                      d="M24 44c5.169 0 9.86-1.977 13.409-5.191l-6.19-5.238C29.146 35.091 26.715 36 24 36c-5.231 0-9.626-3.317-11.287-7.946l-6.522 5.026C9.504 39.556 16.227 44 24 44z"
                    />
                    <path
                      fill="#1976D2"
                      d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.084 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                    />
                  </svg>
                  Continue with Google
                </span>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
