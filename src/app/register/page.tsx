"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmpassword: "",
    birthday: "",
    gender: "",
    terms: false,
  });

  const [errors, setErrors] = useState<any>({});
  const [submitted, setSubmitted] = useState(false);

  // -----------------------------
  //   Validate Form
  // -----------------------------
  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.firstname.trim())
      newErrors.firstname = "First name is required";

    if (!formData.lastname.trim())
      newErrors.lastname = "Last name is required";

    if (!formData.email.includes("@"))
      newErrors.email = "Email is invalid";

    if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (formData.password !== formData.confirmpassword)
      newErrors.confirmpassword = "Password does not match";

    if (!formData.birthday)
      newErrors.birthday = "Birthday is required";

    if (!formData.gender)
      newErrors.gender = "Please select a gender";

    if (!formData.terms)
      newErrors.terms = "You must accept the terms";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // -----------------------------
  //   onChange Handler
  // -----------------------------
  const handleChange = (e: any) => {
    const { name, type, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // -----------------------------
  //   Submit Form + API
  // -----------------------------
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitted(true);

    if (!validateForm()) return;

    try {
      const payload = {
        username: formData.email.split("@")[0], // auto-generate username
        email: formData.email,
        password: formData.password,
        first_name: formData.firstname,
        last_name: formData.lastname,
        phone: "", // ไม่มีในฟอร์ม ให้ใส่ค่าว่าง
        gender: formData.gender,
        birthday: formData.birthday,
        is_active: true,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const json = await res.json();

      if (!res.ok) {
        alert(json.message || "Registration failed.");
        return;
      }

      alert("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect") || "/";
      window.location.href = `/login?redirect=${redirect}`;
    } catch (err) {
      console.error("Register Error:", err);
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
  };

  return (
    <div className="container mx-auto p-2">
      <form
        onSubmit={handleSubmit}
        className="max-w-sm mx-auto bg-gray-100 p-6 rounded-lg shadow-md mt-5"
      >
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-6">Sign Up</h1>
        </div>

        {/* First Name */}
        <div className="mb-5">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            First Name
          </label>
          <input
            type="text"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            className={`shadow-xs bg-gray-50 border ${
              errors.firstname && submitted
                ? "border-red-600"
                : "border-gray-300"
            } text-gray-900 text-sm rounded-lg block w-full p-2.5`}
            placeholder="Please enter your first name"
          />
          {errors.firstname && submitted && (
            <p className="text-red-600 text-sm mt-1">{errors.firstname}</p>
          )}
        </div>

        {/* Last Name */}
        <div className="mb-5">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Last Name
          </label>
          <input
            type="text"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            className={`shadow-xs bg-gray-50 border ${
              errors.lastname && submitted
                ? "border-red-600"
                : "border-gray-300"
            } text-gray-900 text-sm rounded-lg block w-full p-2.5`}
            placeholder="Please enter your last name"
          />
          {errors.lastname && submitted && (
            <p className="text-red-600 text-sm mt-1">{errors.lastname}</p>
          )}
        </div>

        {/* Email */}
        <div className="mb-5">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`shadow-xs bg-gray-50 border ${
              errors.email && submitted
                ? "border-red-600"
                : "border-gray-300"
            } text-gray-900 text-sm rounded-lg block w-full p-2.5`}
            placeholder="Please enter your email"
          />
          {errors.email && submitted && (
            <p className="text-red-600 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="mb-5">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`shadow-xs bg-gray-50 border ${
              errors.password && submitted
                ? "border-red-600"
                : "border-gray-300"
            } text-gray-900 text-sm rounded-lg block w-full p-2.5`}
            placeholder="Please enter your password"
          />
          {errors.password && submitted && (
            <p className="text-red-600 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="mb-5">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmpassword"
            value={formData.confirmpassword}
            onChange={handleChange}
            className={`shadow-xs bg-gray-50 border ${
              errors.confirmpassword && submitted
                ? "border-red-600"
                : "border-gray-300"
            } text-gray-900 text-sm rounded-lg block w-full p-2.5`}
            placeholder="Please confirm your password"
          />
          {errors.confirmpassword && submitted && (
            <p className="text-red-600 text-sm mt-1">
              {errors.confirmpassword}
            </p>
          )}
        </div>

        {/* Birthday */}
        <div className="mb-5">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Birthday
          </label>
          <input
            type="date"
            name="birthday"
            value={formData.birthday}
            onChange={handleChange}
            className={`shadow-xs bg-gray-50 border ${
              errors.birthday && submitted
                ? "border-red-600"
                : "border-gray-300"
            } text-gray-900 text-sm rounded-lg block w-full p-2.5`}
          />
          {errors.birthday && submitted && (
            <p className="text-red-600 text-sm mt-1">{errors.birthday}</p>
          )}
        </div>

        {/* Gender */}
        <div className="mb-5">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Gender
          </label>
          <div className="flex items-center gap-4">
            {["male", "female", "other"].map((g) => (
              <label key={g} className="flex items-center gap-2 capitalize">
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={formData.gender === g}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600"
                />
                {g}
              </label>
            ))}
          </div>
          {errors.gender && submitted && (
            <p className="text-red-600 text-sm mt-1">{errors.gender}</p>
          )}
        </div>

        {/* Terms */}
        <div className="flex items-start mb-5">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            checked={formData.terms}
            onChange={handleChange}
            className={`w-4 h-4 border rounded-sm bg-gray-50 ${
              errors.terms && submitted
                ? "border-red-600"
                : "border-gray-300"
            }`}
          />
          <label htmlFor="terms" className="ml-2 text-sm font-medium text-gray-900">
            I agree with the{" "}
            <a href="#" className="text-blue-600 hover:underline">
              terms and conditions
            </a>
          </label>
        </div>
        {errors.terms && submitted && (
          <p className="text-red-600 text-sm mt-1">{errors.terms}</p>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="submit"
            className="w-full py-2 text-white font-medium rounded-lg text-sm bg-black hover:bg-gray-800 cursor-pointer"
          >
            Sign Up
          </button>
        </div>

        <div className="flex items-center justify-center mt-4 text-sm text-gray-600">
          <span className="flex-grow h-px bg-gray-500"></span>
          <span className="px-3">Already have an account?</span>
          <span className="flex-grow h-px bg-gray-500"></span>
        </div>

        <div className="flex flex-col gap-3 text-center mt-3">
          <Link href={`/login?redirect=${new URLSearchParams(window.location.search).get("redirect") || "/"}`}>
            <button
              type="button"
              className="w-full py-2 text-white bg-black hover:bg-gray-800 font-medium rounded-lg text-sm cursor-pointer"
            >
              Sign In
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
}
