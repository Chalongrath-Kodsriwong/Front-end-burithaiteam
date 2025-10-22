"use client";
import "flowbite";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LogIn() {
  const [isClient, setIsClient] = useState(false);

  // 🧩 เก็บค่าฟอร์ม
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  // ⚠️ เก็บ error รายช่อง
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => setIsClient(true), []);

  // 🧩 ตรวจสอบฟอร์ม
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) newErrors.email = "Please enter your email.";
    if (!formData.password.trim()) newErrors.password = "Please enter your password.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🧩 อัปเดตค่า input + ล้าง error เมื่อกรอก
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));

    // ลบ error ทันทีเมื่อกรอกข้อมูล
    setErrors((prev) => {
      const updated = { ...prev };
      if (updated[id]) delete updated[id];
      return updated;
    });
  };

  // 🧩 เมื่อกด Sign In
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    if (validateForm()) {
      alert("✅ Login successful!");
      window.location.href = "/";
    }
  };

  if (!isClient) return null;

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
            value={formData.email}
            onChange={handleChange}
            className={`shadow-xs bg-gray-50 border ${
              errors.email && submitted ? "border-red-600" : "border-gray-300"
            } text-gray-900 text-sm rounded-lg block w-full p-2.5 placeholder-gray-400`}
            placeholder="Please enter your email"
          />
          {errors.email && submitted && (
            <p className="text-red-600 text-sm mt-1">{errors.email}</p>
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
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            className={`shadow-xs bg-gray-50 border ${
              errors.password && submitted ? "border-red-600" : "border-gray-300"
            } text-gray-900 text-sm rounded-lg block w-full p-2.5 placeholder-gray-400`}
            placeholder="Please enter your password"
          />
          {errors.password && submitted && (
            <p className="text-red-600 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-start mb-5">
          <input
            id="remember"
            type="checkbox"
            checked={formData.remember}
            onChange={handleChange}
            className="w-4 h-4 border border-gray-300 rounded-sm bg-gray-50 focus:ring-1"
          />
          <label htmlFor="remember" className="ml-2 text-sm font-medium text-gray-900">
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
        <Link href="/register">
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
