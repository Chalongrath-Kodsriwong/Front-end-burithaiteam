"use client"; // ใช้ client-side rendering

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";


export default function VerifyEmailPage() {
  const { token } = useParams();  // ใช้ useParams() ในการดึง token จาก URL params
  const router = useRouter();  // เรียกใช้ useRouter ก่อนเพื่อใช้ใน setTimeout

  const [verificationStatus, setVerificationStatus] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setVerificationStatus("Invalid or missing token.");
      return;
    }

    // ส่งคำขอไปยัง Backend เพื่อทำการยืนยันอีเมล
    fetch(`${API_URL}/api/verify-email/${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setVerificationStatus("Your email has been successfully verified!");
        } else {
          setVerificationStatus(data.message || "Verification failed.");
        }
      })
      .catch((err) => {
        console.error("Error verifying email:", err);
        setVerificationStatus("Error verifying email.");
      });

    // หลังจากแสดงข้อความ "Verify successful" แล้วจะ redirect ไปหน้า login
    const timer = setTimeout(() => {
      router.push("/login"); // เปลี่ยนเส้นทางไปที่หน้า login
    }, 2000); // 2 วินาทีหลังจากแสดงข้อความ

    return () => clearTimeout(timer); // ทำการ clear timer เมื่อ component ถูกทำลาย
  }, [token, router]);  // เพิ่ม router เข้าไปใน dependency ของ useEffect

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Email Verification</h1>

      {/* แสดงข้อความสถานะเมื่อการยืนยันสำเร็จ */}
      <div
        className={`alert p-4 ${
          verificationStatus.includes("success")
            ? "bg-green-200 text-green-800"
            : "bg-red-200 text-red-800"
        }`}
      >
        <p>{verificationStatus}</p>
      </div>
    </div>
  );
}
