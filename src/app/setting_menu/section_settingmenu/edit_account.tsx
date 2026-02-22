"use client";

import React, { useRef, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function EditAccount({ user }: { user: any }) {
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ เพิ่ม: สำหรับเลือกไฟล์
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ✅ เพิ่ม: popup เปลี่ยนรหัสผ่าน
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // ✅ เพิ่ม: state สำหรับฟอร์มเปลี่ยนรหัส
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    username: user?.username || "",
    email: user?.email || "",
    phone: user?.phone || "",
    gender: user?.gender || "",
    birthday: user?.birthday
      ? String(user.birthday).substring(0, 10) // ✅ กันเคสเป็น Date
      : "",
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ เพิ่ม: upload avatar ด้วย API เดิม
  const handleAvatarUpload = async (file: File) => {
    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("avatar", file); // ✅ ชื่อต้องเป็น "avatar"

      const res = await fetch(`${API_URL}/api/account/profile`, {
        method: "PUT",
        credentials: "include",
        body: fd, // ❗ ห้ามใส่ Content-Type เอง
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("Upload error:", data);
        alert(data?.message || "Upload failed");
        return;
      }

      alert("อัปโหลดรูปโปรไฟล์สำเร็จ");
      window.dispatchEvent(new Event("avatar-updated"));
      window.location.reload();
    } catch (err) {
      console.error("Upload error:", err);
      alert("เกิดข้อผิดพลาดในการอัปโหลดรูป");
    } finally {
      setLoading(false);
    }
  };

  // ✅ เพิ่ม: ตอนเลือกไฟล์
  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    handleAvatarUpload(file);

    // ✅ reset เพื่อให้เลือกไฟล์เดิมซ้ำได้
    e.target.value = "";
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // ✅ สร้าง payload แบบปลอดภัย
      const payload: any = {
        first_name: formData.firstName?.trim(),
        last_name: formData.lastName?.trim(),
        username: formData.username?.trim(),
        email: formData.email?.trim(),
        phone: formData.phone?.trim(),
        gender: formData.gender?.trim(),
      };

      // ✅ birthday: Prisma ต้องการ ISO-8601 DateTime
      if (formData.birthday && formData.birthday.trim() !== "") {
        payload.birthday = new Date(formData.birthday).toISOString();
      }

      // ✅ ลบ key ที่เป็นค่าว่างออก (กัน Prisma error)
      Object.keys(payload).forEach((key) => {
        if (payload[key] === "" || payload[key] === undefined)
          delete payload[key];
      });

      console.log("Sending payload:", payload);

      const res = await fetch(`${API_URL}/api/account/profile`, {
        method: "PUT", // ✅ ต้องเป็น PUT ตาม backend
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("Update error:", data);
        alert(data?.message || "Update failed");
        return;
      }

      alert("อัปเดตข้อมูลสำเร็จ");
      window.location.reload(); // คงโครงสร้างเดิม
    } catch (err) {
      console.error("Submit error:", err);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  // ✅ เพิ่ม: handler เปลี่ยนรหัสผ่าน
  const handlePasswordChange = (e: any) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ เพิ่ม: submit เปลี่ยนรหัสผ่าน
  const handleChangePasswordSubmit = async () => {
    try {
      setPasswordLoading(true);

      if (!passwordForm.oldPassword || !passwordForm.newPassword) {
        alert("กรุณากรอกรหัสผ่านเดิมและรหัสผ่านใหม่");
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
        alert("รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน");
        return;
      }

      const res = await fetch(`${API_URL}/api/account/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      // บางที backend อาจไม่คืน json เสมอ
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("Change password error:", data);
        alert(data?.message || "Change password failed");
        return;
      }

      alert("เปลี่ยนรหัสผ่านสำเร็จ");

      // reset form
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });

      setShowPasswordPopup(false);
    } catch (err) {
      console.error("Change password submit error:", err);
      alert("เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

      <div className="flex gap-8">
        <div className="w-48 h-48 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="Profile Picture"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <span>แสดงรูปภาพ User</span>
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2">User Information</h3>
          <p>
            <strong>ชื่อ:</strong> {user?.firstName} {user?.lastName}
          </p>
          <p>
            <strong>ชื่อผู้ใช้:</strong> {user?.username}
          </p>
          <p>
            <strong>Email:</strong> {user?.email}
          </p>
          <p>
            <strong>โทรศัพท์:</strong> {user?.phone}
          </p>
          <p>
            <strong>เพศ:</strong> {user?.gender}
          </p>
          <p>
            <strong>วันเกิด:</strong>{" "}
            {user?.birthday
              ? new Date(user.birthday).toLocaleDateString("th-TH")
              : "-"}
          </p>

          {/* ✅ ปุ่มแก้ไข */}
          <button
            onClick={() => setShowPopup(true)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            แก้ไขข้อมูลส่วนตัว
          </button>

          {/* ✅ เพิ่มปุ่ม Upload (เพิ่มอย่างเดียว) */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="mt-3 ml-3 bg-purple-600 text-white px-4 py-2 rounded"
          >
            {loading ? "กำลังอัปโหลด..." : "อัปโหลดรูปโปรไฟล์"}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* ✅ เพิ่ม: ปุ่มเปลี่ยนรหัสผ่าน */}
          <button
            onClick={() => setShowPasswordPopup(true)}
            disabled={passwordLoading}
            className="mt-3 ml-3 bg-orange-600 text-white px-4 py-2 rounded"
          >
            เปลี่ยนรหัสผ่าน
          </button>
        </div>
      </div>

      {/* ---------------- Popup แก้ไขข้อมูล ---------------- */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">แก้ไขข้อมูลส่วนตัว</h2>

            <div className="space-y-3">
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="ชื่อ"
                className="w-full border p-2 rounded"
              />
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="นามสกุล"
                className="w-full border p-2 rounded"
              />
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="ชื่อผู้ใช้"
                className="w-full border p-2 rounded"
              />
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full border p-2 rounded"
              />
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="โทรศัพท์"
                className="w-full border p-2 rounded"
              />
              {/* Gender Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-1">เพศ</label>

                <select
                  className="w-full border p-2 rounded"
                  value={
                    formData.gender === "Male" || formData.gender === "Female"
                      ? formData.gender
                      : formData.gender
                      ? "Other"
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value;

                    if (value === "Other") {
                      setFormData((prev: any) => ({
                        ...prev,
                        gender: "", // เคลียร์ก่อนให้พิมพ์เอง
                      }));
                    } else {
                      setFormData((prev: any) => ({
                        ...prev,
                        gender: value,
                      }));
                    }
                  }}
                >
                  <option value="">-- เลือกเพศ --</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other...</option>
                </select>

                {/* ถ้าเลือก Other ให้แสดงช่องกรอกเพิ่ม */}
                {formData.gender !== "Male" &&
                  formData.gender !== "Female" &&
                  formData.gender !== "" && (
                    <input
                      className="w-full border p-2 rounded mt-3"
                      placeholder="ระบุเพศอื่นๆ"
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData((prev: any) => ({
                          ...prev,
                          gender: e.target.value,
                        }))
                      }
                    />
                  )}
              </div>
              <input
                type="date"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                ยกเลิก
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                {loading ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- Popup เปลี่ยนรหัสผ่าน ---------------- */}
      {showPasswordPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">เปลี่ยนรหัสผ่าน</h2>

            <div className="space-y-3">
              <input
                type="password"
                name="oldPassword"
                value={passwordForm.oldPassword}
                onChange={handlePasswordChange}
                placeholder="รหัสผ่านเดิม"
                className="w-full border p-2 rounded"
              />
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                placeholder="รหัสผ่านใหม่"
                className="w-full border p-2 rounded"
              />
              <input
                type="password"
                name="confirmNewPassword"
                value={passwordForm.confirmNewPassword}
                onChange={handlePasswordChange}
                placeholder="ยืนยันรหัสผ่านใหม่"
                className="w-full border p-2 rounded"
              />
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowPasswordPopup(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                ยกเลิก
              </button>

              <button
                onClick={handleChangePasswordSubmit}
                disabled={passwordLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                {passwordLoading ? "กำลังเปลี่ยน..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
