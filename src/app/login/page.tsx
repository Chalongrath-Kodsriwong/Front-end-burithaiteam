"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
  if (isApiLocalhost && !isPageLocalhost) return window.location.origin;
  return API_URL;
}

const inputClass = (hasError: boolean) =>
  `w-full px-3 py-2.5 rounded-lg text-sm text-[#E8F0F8] bg-[rgba(0,207,255,0.05)] border ${
    hasError
      ? "border-red-500 focus:border-red-400"
      : "border-[rgba(0,207,255,0.2)] focus:border-[rgba(0,207,255,0.6)]"
  } outline-none transition-colors duration-200 placeholder:text-[#3A5A78]`;

const labelClass = "block mb-1.5 text-xs font-bold tracking-widest text-[#5A7A98] uppercase";

export default function LoginPage() {
  const apiBaseUrl = resolveApiBaseUrl();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("/");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [googleError, setGoogleError] = useState("");
  const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const router = useRouter();
  const googleInitRef = useRef(false);
  const { refreshCart } = useCart();
  const REMEMBER_KEY = "remember_login_v1";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setRedirectUrl(params.get("redirect") || "/");
      const remember = window.localStorage.getItem(REMEMBER_KEY);
      if (remember) {
        try {
          const parsed = JSON.parse(remember);
          if (parsed?.identifier) setIdentifier(parsed.identifier);
          if (parsed?.password) setPassword(parsed.password);
          setRememberMe(true);
        } catch { window.localStorage.removeItem(REMEMBER_KEY); }
      }
      const lockData = window.localStorage.getItem("login_lock");
      if (lockData) {
        try {
          const parsed = JSON.parse(lockData);
          if (parsed.lockedUntil && parsed.lockedUntil > Date.now()) setLockedUntil(parsed.lockedUntil);
          else window.localStorage.removeItem("login_lock");
        } catch { window.localStorage.removeItem("login_lock"); }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (lockedUntil && lockedUntil > Date.now()) window.localStorage.setItem("login_lock", JSON.stringify({ lockedUntil }));
    else window.localStorage.removeItem("login_lock");
  }, [lockedUntil]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname === "::1";
    if (!isLocalhost && window.location.protocol === "http:") {
      window.location.replace(`https://burithaiteam.com/login${window.location.search || ""}`);
    }
  }, []);

  useEffect(() => {
    if (checkingAuth) return;
    if (!GOOGLE_CLIENT_ID || typeof window === "undefined") return;
    let cancelled = false;

    const waitForGoogle = async () => {
      for (let i = 0; i < 80; i++) {
        if (window.google?.accounts?.id) return true;
        await new Promise((r) => setTimeout(r, 100));
      }
      return false;
    };

    const ensureScript = async () => {
      if (window.google?.accounts?.id) return;
      await new Promise<void>((resolve, reject) => {
        const existing = document.getElementById("google-gsi") as HTMLScriptElement | null;
        const onLoad = () => resolve();
        const onError = () => reject(new Error("Google script load failed"));
        if (existing) {
          if (window.google?.accounts?.id || existing.getAttribute("data-loaded") === "1") { resolve(); return; }
          existing.addEventListener("load", onLoad, { once: true });
          existing.addEventListener("error", onError, { once: true });
          let tries = 0;
          const intervalId = window.setInterval(() => {
            tries++;
            if (window.google?.accounts?.id) { window.clearInterval(intervalId); resolve(); return; }
            if (tries >= 80) { window.clearInterval(intervalId); reject(new Error("Google object timeout")); }
          }, 100);
          return;
        }
        const script = document.createElement("script");
        script.id = "google-gsi";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => { script.setAttribute("data-loaded", "1"); setIsGoogleScriptLoaded(true); onLoad(); };
        script.onerror = onError;
        document.body.appendChild(script);
      });
    };

    const initGoogle = async () => {
      setGoogleError(""); setIsGoogleReady(false);
      try {
        await ensureScript();
        if (window.google?.accounts?.id) setIsGoogleScriptLoaded(true);
        const ready = await waitForGoogle();
        if (!ready || cancelled || googleInitRef.current) return;
        window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID.trim(), callback: handleGoogleCredential, ux_mode: "popup", use_fedcm_for_prompt: false, use_fedcm_for_button: false, auto_select: false });
        const btn = document.getElementById("googleBtn");
        if (!btn) return;
        btn.innerHTML = "";
        window.google.accounts.id.renderButton(btn, { theme: "filled_blue", size: "large", width: 320 });
        googleInitRef.current = true;
        if (!cancelled) setIsGoogleReady(true);
      } catch (err) {
        console.error("Google sign-in init failed:", err);
        if (!cancelled) setGoogleError("ไม่สามารถโหลดปุ่ม Google ได้ กรุณารีเฟรชหน้าอีกครั้ง");
      }
    };

    initGoogle();
    return () => { cancelled = true; };
  }, [checkingAuth]);

  const afterLoginSuccess = async (user: any) => {
    await refreshCart();
    localStorage.setItem("username", user?.username || "");
    localStorage.setItem("first_name", user?.first_name || "");
    if (rememberMe) window.localStorage.setItem(REMEMBER_KEY, JSON.stringify({ identifier, password }));
    else window.localStorage.removeItem(REMEMBER_KEY);
    setLoginAttempts(0);
    setLockedUntil(null);
    window.dispatchEvent(new Event("login-success"));
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect") || redirectUrl || "/";
    router.push(redirect);
    setTimeout(() => { if (window.location.pathname !== redirect) window.location.assign(redirect); }, 150);
  };

  const handleGoogleCredential = async (response: any) => {
    try {
      setError(""); setIsGoogleLoading(true);
      const tokenId = response?.credential;
      if (!tokenId) { setError("ไม่พบ Google credential"); return; }
      const res = await fetch(`${apiBaseUrl}/api/auth/google/login`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ tokenId }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data?.message && typeof data.message === "string" ? data.message : "Google login failed"); return; }
      await afterLoginSuccess(data.user);
    } catch (err) {
      console.error("Google login error:", err);
      setError("ไม่สามารถ Login ด้วย Google ได้ กรุณาลองใหม่");
    } finally { setIsGoogleLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setError("");
    if (lockedUntil && lockedUntil > Date.now()) {
      setError(`คุณพยายามเข้าสู่ระบบผิดหลายครั้ง โปรดลองใหม่ในอีก ${Math.ceil((lockedUntil - Date.now()) / 1000)} วินาที`);
      return;
    }
    if (!identifier || !password) { setError("กรุณากรอก Username/Email และรหัสผ่าน"); return; }
    try {
      setIsLoading(true);
      const res = await fetch(`${apiBaseUrl}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identifier, password }), credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLoginAttempts((prev) => {
          const next = prev + 1;
          if (next >= 5) { setLockedUntil(Date.now() + 60 * 1000); setError("คุณพยายามเข้าสู่ระบบผิดหลายครั้ง ระบบขอล็อกชั่วคราว 1 นาที"); }
          else setError(data?.message && typeof data.message === "string" ? data.message : "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
          return next;
        });
        return;
      }
      await afterLoginSuccess(data.user);
      setLoginAttempts(0); setLockedUntil(null);
      localStorage.setItem("username", data.user.username);
      localStorage.setItem("first_name", data.user.first_name);
      setTimeout(() => {
        window.dispatchEvent(new Event("login-success"));
        const params = new URLSearchParams(window.location.search);
        router.push(params.get("redirect") || "/");
      }, 50);
    } catch (err) {
      console.error("Login error:", err);
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง");
    } finally { setIsLoading(false); }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetchAuthSession(apiBaseUrl);
        if (res.ok) { router.replace("/"); return; }
        if (res.status === 401) { localStorage.removeItem("username"); localStorage.removeItem("first_name"); }
      } catch {}
      setCheckingAuth(false);
    };
    checkAuth();
  }, [router, apiBaseUrl]);

  if (checkingAuth) return null;

  const isSubmitDisabled = isLoading || !identifier || !password || !!(lockedUntil && lockedUntil > Date.now());

  return (
    <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center bg-[#08090d] overflow-hidden py-12 px-4">
      {/* LED grid background */}
      <div className="absolute inset-0 bg-led-grid opacity-15 pointer-events-none" />
      {/* Cyan glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none glow-orb-cyan opacity-30" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00CFFF] animate-pulse shadow-[0_0_6px_rgba(0,207,255,0.9)]" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#00CFFF]/70 uppercase">BuriThaiTeam Store</span>
          </div>
          <h1 className="text-3xl font-black text-[#E8F0F8]">Sign In</h1>
          <p className="text-sm text-[#5A7A98] mt-1">เข้าสู่ระบบเพื่อดำเนินการต่อ</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[rgba(6,8,14,0.95)] border border-[rgba(0,207,255,0.15)] rounded-xl p-6 shadow-[0_0_40px_rgba(0,207,255,0.06)]"
        >
          {/* Username / Email */}
          <div className="mb-4">
            <label htmlFor="identifier" className={labelClass}>Username or Email</label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className={inputClass(!!(error && submitted))}
              placeholder="Enter username or email"
              inputMode="email"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label htmlFor="password" className={labelClass}>Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass(!!(error && submitted))}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold tracking-widest text-[#00CFFF]/70 hover:text-[#00CFFF] uppercase transition"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.3)]">
              <p className="text-red-400 text-xs text-center">{error}</p>
            </div>
          )}

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between mb-5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => {
                  setRememberMe(e.target.checked);
                  if (!e.target.checked && typeof window !== "undefined") window.localStorage.removeItem(REMEMBER_KEY);
                }}
                className="w-4 h-4 rounded border border-[rgba(0,207,255,0.3)] bg-[rgba(0,207,255,0.05)] accent-[#00CFFF]"
              />
              <span className="text-xs text-[#5A7A98]">Remember me?</span>
            </label>
            <Link href="/request-password" className="text-xs text-[#00CFFF]/70 hover:text-[#00CFFF] transition">
              Forgot password?
            </Link>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={!!isSubmitDisabled}
            className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all duration-200
              ${isSubmitDisabled
                ? "bg-[rgba(212,175,55,0.2)] text-[#7A6520] cursor-not-allowed border border-[rgba(212,175,55,0.15)]"
                : "btn-gold"
              }`}
          >
            {isLoading ? "กำลังเข้าสู่ระบบ..." : "Sign In"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-grow h-px bg-[rgba(0,207,255,0.1)]" />
            <span className="text-[10px] text-[#3A5A78] tracking-widest uppercase">Don&apos;t have an account?</span>
            <div className="flex-grow h-px bg-[rgba(0,207,255,0.1)]" />
          </div>

          <Link href={`/register?redirect=${redirectUrl}`}>
            <button
              type="button"
              className="btn-outline-gold w-full py-2.5 text-sm font-bold"
            >
              Sign Up
            </button>
          </Link>

          {/* Google Sign-In */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-grow h-px bg-[rgba(0,207,255,0.1)]" />
            <span className="text-[10px] text-[#3A5A78] tracking-widest uppercase whitespace-nowrap">Sign in with</span>
            <div className="flex-grow h-px bg-[rgba(0,207,255,0.1)]" />
          </div>

          <div className="flex flex-col items-center gap-2">
            <div id="googleBtn" className="w-full flex justify-center" />
            {!isGoogleReady && (
              <p className="text-xs text-[#3A5A78]">Loading Google Sign-In...</p>
            )}
            {googleError && <p className="text-xs text-red-400 text-center">{googleError}</p>}
            {isGoogleLoading && <p className="text-xs text-[#5A7A98]">Signing in with Google...</p>}
          </div>
        </form>
      </div>
    </section>
  );
}
