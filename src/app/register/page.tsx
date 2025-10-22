"use client";
import "flowbite";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SignUp() {
  const [isClient, setIsClient] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // 🧩 เก็บค่าฟอร์ม
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

  // ⚠️ เก็บ error รายช่อง
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => setIsClient(true), []);

  // ✅ ตรวจสอบข้อมูลทั้งหมด
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const { firstname, lastname, email, password, confirmpassword, birthday, gender, terms } = formData;

    if (!firstname.trim()) newErrors.firstname = "Please enter your first name.";
    if (!lastname.trim()) newErrors.lastname = "Please enter your last name.";
    if (!email.trim()) newErrors.email = "Please enter your email.";
    if (!password) newErrors.password = "Please enter your password.";
    if (!confirmpassword) newErrors.confirmpassword = "Please confirm your password.";
    if (password && confirmpassword && password !== confirmpassword)
      newErrors.confirmpassword = "Passwords do not match.";
    if (!birthday) newErrors.birthday = "Please select your birthday.";
    if (!gender) newErrors.gender = "Please select a gender.";
    if (!terms) newErrors.terms = "You must agree to the terms.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🧩 เมื่อกรอก input —> ล้าง error เฉพาะช่องนั้นถ้ามี
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, name, type, value, checked } = e.target as HTMLInputElement;
    const key = type === "radio" ? name : id || name;

    // อัปเดตค่าในฟอร์ม
    setFormData((prev) => ({
      ...prev,
      [key]: type === "checkbox" ? checked : value,
    }));

    // ถ้ามี error ในช่องนี้ → ลบออกเมื่อผู้ใช้เริ่มกรอก
    setErrors((prev) => {
      const updated = { ...prev };
      if (updated[key]) delete updated[key];
      return updated;
    });
  };

  // 🧩 เมื่อกด Sign Up
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);

    if (validateForm()) {
    //   alert("🎉 Sign Up Successful!");
      window.location.href = "/login";
    }
  };

  if (!isClient) return null;

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
          <label htmlFor="firstname" className="block mb-2 text-sm font-medium text-gray-900">
            First Name
          </label>
          <input
            type="text"
            id="firstname"
            value={formData.firstname}
            onChange={handleChange}
            className={`shadow-xs bg-gray-50 border ${
              errors.firstname && submitted ? "border-red-600" : "border-gray-300"
            } text-gray-900 text-sm rounded-lg block w-full p-2.5`}
            placeholder="Please enter your first name"
          />
          {errors.firstname && submitted && (
            <p className="text-red-600 text-sm mt-1">{errors.firstname}</p>
          )}
        </div>

        {/* Last Name */}
        <div className="mb-5">
          <label htmlFor="lastname" className="block mb-2 text-sm font-medium text-gray-900">
            Last Name
          </label>
          <input
            type="text"
            id="lastname"
            value={formData.lastname}
            onChange={handleChange}
            className={`shadow-xs bg-gray-50 border ${
              errors.lastname && submitted ? "border-red-600" : "border-gray-300"
            } text-gray-900 text-sm rounded-lg block w-full p-2.5`}
            placeholder="Please enter your last name"
          />
          {errors.lastname && submitted && (
            <p className="text-red-600 text-sm mt-1">{errors.lastname}</p>
          )}
        </div>

        {/* Email */}
        <div className="mb-5">
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            className={`shadow-xs bg-gray-50 border ${
              errors.email && submitted ? "border-red-600" : "border-gray-300"
            } text-gray-900 text-sm rounded-lg block w-full p-2.5`}
            placeholder="Please enter your email"
          />
          {errors.email && submitted && (
            <p className="text-red-600 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="mb-5">
          <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            className={`shadow-xs bg-gray-50 border ${
              errors.password && submitted ? "border-red-600" : "border-gray-300"
            } text-gray-900 text-sm rounded-lg block w-full p-2.5`}
            placeholder="Please enter your password"
          />
          {errors.password && submitted && (
            <p className="text-red-600 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="mb-5">
          <label htmlFor="confirmpassword" className="block mb-2 text-sm font-medium text-gray-900">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmpassword"
            value={formData.confirmpassword}
            onChange={handleChange}
            className={`shadow-xs bg-gray-50 border ${
              errors.confirmpassword && submitted ? "border-red-600" : "border-gray-300"
            } text-gray-900 text-sm rounded-lg block w-full p-2.5`}
            placeholder="Please confirm your password"
          />
          {errors.confirmpassword && submitted && (
            <p className="text-red-600 text-sm mt-1">{errors.confirmpassword}</p>
          )}
        </div>

        {/* Birthday */}
        <div className="mb-5">
          <label htmlFor="birthday" className="block mb-2 text-sm font-medium text-gray-900">
            Birthday
          </label>
          <input
            type="date"
            id="birthday"
            value={formData.birthday}
            onChange={handleChange}
            className={`shadow-xs bg-gray-50 border ${
              errors.birthday && submitted ? "border-red-600" : "border-gray-300"
            } text-gray-900 text-sm rounded-lg block w-full p-2.5`}
          />
          {errors.birthday && submitted && (
            <p className="text-red-600 text-sm mt-1">{errors.birthday}</p>
          )}
        </div>

        {/* Gender */}
        <div className="mb-5">
          <label className="block mb-2 text-sm font-medium text-gray-900">Gender</label>
          <div className="flex items-center gap-4">
            {["male", "female", "other"].map((g) => (
              <div key={g} className="flex items-center">
                <input
                  type="radio"
                  id={g}
                  name="gender"
                  value={g}
                  checked={formData.gender === g}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor={g} className="ml-2 text-sm font-medium text-gray-900 capitalize">
                  {g}
                </label>
              </div>
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
            type="checkbox"
            checked={formData.terms}
            onChange={handleChange}
            className={`w-4 h-4 border rounded-sm bg-gray-50 focus:ring-1 ${
              errors.terms && submitted ? "border-red-600" : "border-gray-300"
            }`}
          />
          <label htmlFor="terms" className="ml-2 text-sm font-medium text-gray-900">
            I agree with the{" "}
            <a href="#" className="text-blue-600 hover:underline">
              terms and conditions
            </a>
          </label>
        </div>
        {errors.terms && submitted && <p className="text-red-600 text-sm mt-1">{errors.terms}</p>}

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            type="submit"
            className="w-full py-2 text-white font-medium rounded-lg text-sm bg-black hover:bg-gray-800 cursor-pointer"
          >
            Sign Up
          </button>
        </div>

        {/* Back to Sign In Page */}
        <div className="flex items-center justify-center mt-4 text-sm text-gray-600">
          <span className="flex-grow h-px bg-gray-500"></span>
          <span className="px-3">Already have an account?</span>
          <span className="flex-grow h-px bg-gray-500"></span>
        </div>

        <div className="flex flex-col gap-3 text-center mt-3">
          <Link href="/login">
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
