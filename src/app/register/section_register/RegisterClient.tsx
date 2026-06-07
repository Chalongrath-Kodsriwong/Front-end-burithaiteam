"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const inputClass = (hasError: boolean) =>
  `w-full px-3 py-2.5 rounded-lg text-sm text-[#E8F0F8] bg-[rgba(0,207,255,0.05)] border ${
    hasError
      ? "border-red-500 focus:border-red-400"
      : "border-[rgba(0,207,255,0.2)] focus:border-[rgba(0,207,255,0.6)]"
  } outline-none transition-colors duration-200 placeholder:text-[#3A5A78]`;

const labelClass = "block mb-1.5 text-xs font-bold tracking-widest text-[#5A7A98] uppercase";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmpassword: "",
    birthday: "",
    gender: "",
    phone: "",
    terms: false,
  });

  const [errors, setErrors] = useState<any>({});
  const [submitted, setSubmitted] = useState(false);
  const [successPopup, setSuccessPopup] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("/");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setRedirectUrl(params.get("redirect") || "/");
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const username = localStorage.getItem("username");
    if (username) router.replace("/");
  }, []);

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.firstname.trim()) newErrors.firstname = "First name is required";
    if (!formData.lastname.trim()) newErrors.lastname = "Last name is required";
    if (!formData.email.includes("@")) newErrors.email = "Email is invalid";
    if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmpassword) newErrors.confirmpassword = "Password does not match";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (formData.phone.trim().length < 10) newErrors.phone = "Phone number must be at least 10 digits";
    if (!formData.birthday) newErrors.birthday = "Birthday is required";
    if (!formData.gender) newErrors.gender = "Please select a gender";
    if (!formData.terms) newErrors.terms = "You must accept the terms";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: any) => {
    const { name, type, value, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitted(true);
    if (!validateForm()) return;
    try {
      const payload = {
        username: formData.email.split("@")[0],
        email: formData.email,
        password: formData.password,
        first_name: formData.firstname,
        last_name: formData.lastname,
        phone: formData.phone,
        gender: formData.gender,
        birthday: formData.birthday,
        is_active: false,
      };
      const res = await fetch(`${API_URL}/api/auth/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok) { alert(json.message || "Registration failed."); return; }
      setSuccessPopup(true);
    } catch (err) {
      console.error("Register Error:", err);
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
  };

  return (
    <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center bg-[#08090d] overflow-hidden py-12 px-4">
      {/* LED grid background */}
      <div className="absolute inset-0 bg-led-grid opacity-15 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none glow-orb-cyan opacity-25" />

      {/* Success Popup */}
      {successPopup && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 px-4">
          <div className="bg-[rgba(6,8,14,0.98)] border border-[rgba(0,207,255,0.25)] rounded-2xl p-6 w-80 max-w-[92vw] text-center shadow-[0_0_40px_rgba(0,207,255,0.1)]">
            <div className="w-12 h-12 rounded-full bg-[rgba(0,207,255,0.1)] border border-[rgba(0,207,255,0.3)] flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#00CFFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-black text-[#E8F0F8] mb-2">สมัครสมาชิกสำเร็จ!</h2>
            <p className="text-[#7A9AB8] text-sm mb-5">กรุณาตรวจสอบอีเมลของคุณเพื่อทำการ Verify ก่อนเข้าสู่ระบบ</p>
            <a href="https://mail.google.com" className="block w-full py-2.5 btn-gold text-sm font-bold mb-3 rounded-lg">
              ไปที่ Gmail
            </a>
            <div className="flex items-center gap-2 my-3">
              <div className="flex-grow h-px bg-[rgba(0,207,255,0.1)]" />
              <span className="text-[10px] text-[#3A5A78] tracking-widest">VERIFIED</span>
              <div className="flex-grow h-px bg-[rgba(0,207,255,0.1)]" />
            </div>
            <button
              onClick={() => router.push(`/login?redirect=${redirectUrl}`)}
              className="w-full py-2.5 btn-outline-gold text-sm font-bold rounded-lg"
            >
              กลับไปหน้า Sign In
            </button>
          </div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00CFFF] animate-pulse shadow-[0_0_6px_rgba(0,207,255,0.9)]" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#00CFFF]/70 uppercase">BuriThaiTeam Store</span>
          </div>
          <h1 className="text-3xl font-black text-[#E8F0F8]">Sign Up</h1>
          <p className="text-sm text-[#5A7A98] mt-1">สร้างบัญชีใหม่</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[rgba(6,8,14,0.95)] border border-[rgba(0,207,255,0.15)] rounded-xl p-6 shadow-[0_0_40px_rgba(0,207,255,0.06)]"
        >
          {/* First Name */}
          <div className="mb-4">
            <label className={labelClass}>First Name</label>
            <input type="text" name="firstname" value={formData.firstname} onChange={handleChange}
              className={inputClass(!!(errors.firstname && submitted))} placeholder="Please enter your first name" />
            {errors.firstname && submitted && <p className="text-red-400 text-xs mt-1">{errors.firstname}</p>}
          </div>

          {/* Last Name */}
          <div className="mb-4">
            <label className={labelClass}>Last Name</label>
            <input type="text" name="lastname" value={formData.lastname} onChange={handleChange}
              className={inputClass(!!(errors.lastname && submitted))} placeholder="Please enter your last name" />
            {errors.lastname && submitted && <p className="text-red-400 text-xs mt-1">{errors.lastname}</p>}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className={labelClass}>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange}
              className={inputClass(!!(errors.email && submitted))} placeholder="Please enter your email" />
            {errors.email && submitted && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className={labelClass}>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange}
              className={inputClass(!!(errors.password && submitted))} placeholder="Please enter your password" />
            {errors.password && submitted && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <label className={labelClass}>Confirm Password</label>
            <input type="password" name="confirmpassword" value={formData.confirmpassword} onChange={handleChange}
              className={inputClass(!!(errors.confirmpassword && submitted))} placeholder="Please confirm your password" />
            {errors.confirmpassword && submitted && <p className="text-red-400 text-xs mt-1">{errors.confirmpassword}</p>}
          </div>

          {/* Birthday */}
          <div className="mb-4">
            <label className={labelClass}>Birthday</label>
            <input type="date" name="birthday" value={formData.birthday} onChange={handleChange}
              className={inputClass(!!(errors.birthday && submitted)) + " [color-scheme:dark]"} />
            {errors.birthday && submitted && <p className="text-red-400 text-xs mt-1">{errors.birthday}</p>}
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label className={labelClass}>Phone</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
              className={inputClass(!!(errors.phone && submitted))} placeholder="Please enter your phone number" />
            {errors.phone && submitted && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* Gender */}
          <div className="mb-4">
            <label className={labelClass}>Gender</label>
            <div className="flex items-center gap-4">
              {["male", "female", "other"].map((g) => (
                <label key={g} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio" name="gender" value={g}
                    checked={formData.gender === g} onChange={handleChange}
                    className="w-4 h-4 accent-[#00CFFF] border border-[rgba(0,207,255,0.3)]"
                  />
                  <span className="text-xs text-[#7A9AB8] capitalize">{g}</span>
                </label>
              ))}
            </div>
            {errors.gender && submitted && <p className="text-red-400 text-xs mt-1">{errors.gender}</p>}
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2 mb-5">
            <input
              id="terms" name="terms" type="checkbox"
              checked={formData.terms} onChange={handleChange}
              className={`w-4 h-4 mt-0.5 rounded border accent-[#00CFFF] ${errors.terms && submitted ? "border-red-500" : "border-[rgba(0,207,255,0.3)]"}`}
            />
            <label htmlFor="terms" className="text-xs text-[#5A7A98] leading-relaxed cursor-pointer">
              I agree with the{" "}
              <a href="#" className="text-[#00CFFF] hover:underline">terms and conditions</a>
            </label>
          </div>
          {errors.terms && submitted && <p className="text-red-400 text-xs mb-3">{errors.terms}</p>}

          {/* Sign Up */}
          <button type="submit" className="btn-gold w-full py-2.5 text-sm font-bold mb-4">
            Sign Up
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-grow h-px bg-[rgba(0,207,255,0.1)]" />
            <span className="text-[10px] text-[#3A5A78] tracking-widest uppercase whitespace-nowrap">Already have an account?</span>
            <div className="flex-grow h-px bg-[rgba(0,207,255,0.1)]" />
          </div>

          <Link href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}>
            <button type="button" className="btn-outline-gold w-full py-2.5 text-sm font-bold">
              Sign In
            </button>
          </Link>
        </form>
      </div>
    </section>
  );
}
