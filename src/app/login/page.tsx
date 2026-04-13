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
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "605318578134-2qti7ltgark87qh080m15ta15bgbqdiq.apps.googleusercontent.com";

function resolveApiBaseUrl() {
  if (typeof window === "undefined") return API_URL;
  if (!API_URL) return window.location.origin;

  const isPageLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "::1";

  const apiHost = API_URL.replace(/^https?:\/\//, "").split("/")[0] || "";
  const isApiLocalhost =
    apiHost.startsWith("localhost") ||
    apiHost.startsWith("127.0.0.1") ||
    apiHost.startsWith("[::1]") ||
    apiHost.startsWith("::1");

  if (isApiLocalhost && !isPageLocalhost) {
    return window.location.origin;
  }

  return API_URL;
}

export default function LoginPage() {
  const apiBaseUrl = resolveApiBaseUrl();
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
  const [googleError, setGoogleError] = useState("");
  const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

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
    if (checkingAuth) return;
    if (!GOOGLE_CLIENT_ID) return;
    if (typeof window === "undefined") return;

    let cancelled = false;

    const waitForGoogle = async () => {
      for (let i = 0; i < 80; i += 1) {
        if (window.google?.accounts?.id) return true;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return false;
    };

    const ensureScript = async () => {
      if (window.google?.accounts?.id) return;

      await new Promise<void>((resolve, reject) => {
        const existing = document.getElementById(
          "google-gsi",
        ) as HTMLScriptElement | null;

        const onLoad = () => resolve();
        const onError = () => reject(new Error("Google script load failed"));

        if (existing) {
          if (
            window.google?.accounts?.id ||
            existing.getAttribute("data-loaded") === "1"
          ) {
            resolve();
            return;
          }

          existing.addEventListener("load", onLoad, { once: true });
          existing.addEventListener("error", onError, { once: true });

          let tries = 0;
          const intervalId = window.setInterval(() => {
            tries += 1;
            if (window.google?.accounts?.id) {
              window.clearInterval(intervalId);
              resolve();
              return;
            }

            if (tries >= 80) {
              window.clearInterval(intervalId);
              reject(new Error("Google object timeout"));
            }
          }, 100);

          return;
        }

        const script = document.createElement("script");
        script.id = "google-gsi";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          script.setAttribute("data-loaded", "1");
          setIsGoogleScriptLoaded(true);
          onLoad();
        };
        script.onerror = onError;
        document.body.appendChild(script);
      });
    };

    const initGoogle = async () => {
      setGoogleError("");
      setIsGoogleReady(false);

      try {
        await ensureScript();
        if (window.google?.accounts?.id) {
          setIsGoogleScriptLoaded(true);
        }
        const ready = await waitForGoogle();
        if (!ready || cancelled || googleInitRef.current) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID.trim(),
          callback: handleGoogleCredential,
          ux_mode: "popup",
          use_fedcm_for_prompt: false,
          use_fedcm_for_button: false,
          auto_select: false,
        });

        const btn = document.getElementById("googleBtn");
        if (!btn) return;
        btn.innerHTML = "";
        window.google.accounts.id.renderButton(btn, {
          theme: "filled_blue",
          size: "large",
          width: 320,
        });
        googleInitRef.current = true;
        if (!cancelled) {
          setIsGoogleReady(true);
        }
      } catch (err) {
        console.error("Google sign-in init failed:", err);
        if (!cancelled) {
          setGoogleError(
            "ไม่สามารถโหลดปุ่ม Google ได้ กรุณารีเฟรชหน้าอีกครั้ง",
          );
        }
      }
    };

    initGoogle();
    return () => {
      cancelled = true;
    };
  }, [checkingAuth]);

  const handleGoogleFallbackClick = async () => {
    setGoogleError("");
    setIsGoogleLoading(true);
    try {
      const loaded = window.google?.accounts?.id || isGoogleScriptLoaded;
      if (!loaded) {
        const existing = document.getElementById("google-gsi");
        if (!existing) {
          const script = document.createElement("script");
          script.id = "google-gsi";
          script.src = "https://accounts.google.com/gsi/client";
          script.async = true;
          script.defer = true;
          document.body.appendChild(script);
        }

        for (let i = 0; i < 80; i += 1) {
          if (window.google?.accounts?.id) break;
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      if (!window.google?.accounts?.id) {
        setGoogleError("ยังโหลด Google Sign-In ไม่สำเร็จ กรุณารีเฟรชหน้า");
        return;
      }

      if (!googleInitRef.current) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID.trim(),
          callback: handleGoogleCredential,
          ux_mode: "popup",
          use_fedcm_for_prompt: false,
          use_fedcm_for_button: false,
          auto_select: false,
        });
        googleInitRef.current = true;
      }

      const btn = document.getElementById("googleBtn");
      if (btn) {
        btn.innerHTML = "";
        window.google.accounts.id.renderButton(btn, {
          theme: "filled_blue",
          size: "large",
          width: 320,
        });
        setIsGoogleReady(true);
      } else {
        setGoogleError("ไม่พบตำแหน่งปุ่ม Google บนหน้า");
      }
    } catch (err) {
      console.error("Fallback Google sign-in failed:", err);
      setGoogleError("ไม่สามารถเปิด Google Login ได้ กรุณาลองใหม่");
    } finally {
      setIsGoogleLoading(false);
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

      const res = await fetch(`${apiBaseUrl}/api/auth/google/login`, {
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

      const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetchAuthSession(apiBaseUrl);

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
  }, [router, apiBaseUrl]);
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
            {/* <button
              type="button"
              onClick={handleGoogleFallbackClick}
              disabled={isGoogleLoading}
              className="w-full py-2 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-800 hover:bg-gray-100 disabled:opacity-60"
            >
              Continue with Google
            </button> */}
            {!isGoogleReady && (
              <p className="text-sm text-gray-500">Loading Google Sign-In...</p>
            )}
            {googleError && <p className="text-sm text-red-600">{googleError}</p>}
            {isGoogleLoading && (
              <p className="text-sm text-gray-500">Signing in with Google...</p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
