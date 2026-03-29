"use client"; // Add this line at the top of your file

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function ResetPasswordNewPage() {
  const [token, setToken] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  // รับ token จาก URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const res = await fetch(`${API_URL}/api/reset-password/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword }), // ส่ง token และ password ใหม่
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Failed to reset password");
        return;
      }

      router.push("/login");
    } catch (err) {
      setError("An error occurred while resetting the password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Reset Password</h1>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-gray-100 p-6 rounded-lg shadow-md">
        <div className="mb-5">
          <label htmlFor="newPassword" className="block mb-2 text-sm font-medium text-gray-900">
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
            placeholder="Enter new password"
            required
          />
        </div>

        <div className="mb-5">
          <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-900">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
            placeholder="Confirm new password"
            required
          />
        </div>

        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 text-white bg-black hover:bg-gray-800 font-medium rounded-lg text-sm cursor-pointer"
        >
          {isLoading ? "Processing..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
