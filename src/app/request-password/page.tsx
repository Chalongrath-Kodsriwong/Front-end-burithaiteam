"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function ResetPasswordRequestPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError("");

      const res = await fetch(`${API_URL}/api/reset-password/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Failed to send reset email");
        return;
      }

      // แจ้งให้ผู้ใช้ทราบว่าอีเมลได้ถูกส่งแล้ว
      alert("Check your email for the reset link");

      // Redirect ไปยังหน้า login
      router.push("/login");
    } catch (err) {
      setError("An error occurred while requesting reset");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Forgot Password</h1>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-gray-100 p-6 rounded-lg shadow-md">
        <div className="mb-5">
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
            placeholder="Enter your email"
            required
          />
        </div>

        {/* Error Message */}
        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 text-white bg-black hover:bg-gray-800 font-medium rounded-lg text-sm cursor-pointer"
        >
          {isLoading ? "Processing..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}
