"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Next.js 13 App Router
import Link from "next/link";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false); // Track if form is submitted
  const router = useRouter();
  const [redirectUrl, setRedirectUrl] = useState("/");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true); // Set form as submitted

    setError(""); // Clear previous error

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
        credentials: "include", // Send cookies with the request
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle error message
        setError(data.message || "Login failed");
        return;
      }

      console.log("Logged in user:", data.user);

      // Set Session Cookie (e.g., user data or token) after login success
      const safeUserData = {
        username: data.user.username,
        // roles: data.user.roles,
      };

      document.cookie = `user_data=${JSON.stringify(
        safeUserData
      )}; path=/; max-age=3600;`;

      // 1 hour expiration

      // Redirect to detail_product after login
      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get("redirect") || "/";
      router.push(redirectUrl);
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    }
  };
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setRedirectUrl(params.get("redirect") || "/");
    }
  }, []);

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
          {error && submitted && (
            <p className="text-red-600 text-sm mt-1">{error}</p>
          )}
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
          {error && submitted && (
            <p className="text-red-600 text-sm mt-1">{error}</p>
          )}
        </div>

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
            className="w-full py-2 text-white bg-black hover:bg-gray-800 font-medium rounded-lg text-sm cursor-pointer"
          >
            Sign In
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
