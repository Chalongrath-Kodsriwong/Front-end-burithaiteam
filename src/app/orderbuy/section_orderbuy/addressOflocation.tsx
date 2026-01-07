import { useEffect, useState } from "react";

import { provinceList } from "@/data/provinces";
import { labelOptions } from "@/data/addressLabels";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function AddressLocation({ onAddressSelect }: any) {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [showPopup, setShowPopup] = useState(false);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);

  // 🔧 แก้จาก string → เป็น object เก็บทั้งชุดของ address
  const [editAddressText, setEditAddressText] = useState({
    label: "",
    address_text: "",
    province: "",
    postal_code: "",
    phone: "",
  });
  const [editId, setEditId] = useState<number | null>(null);

  const [newAddress, setNewAddress] = useState({
    label: "",
    address_text: "",
    province: "",
    postal_code: "",
    phone: "",
  });

  // Autocomplete states
  const [filteredLabels, setFilteredLabels] = useState<string[]>([]);
  const [showLabelDropdown, setShowLabelDropdown] = useState(false);

  const [filteredProvinces, setFilteredProvinces] = useState<string[]>([]);
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);

  function formatAddress(addr: any) {
    if (!addr) return "";

    return (
      <div className="leading-relaxed">
        <p className="font-semibold">{addr.label}</p>
        <p>{addr.address_text}</p>
        <p>
          {addr.province} {addr.postal_code}
        </p>
        <p className="mt-1 text-sm text-gray-600">โทร: {addr.phone}</p>
      </div>
    );
  }

  /* ------------------------ LOAD ADDRESS ------------------------ */
  useEffect(() => {
    async function loadAddresses() {
      try {
        const res = await fetch(`${API_URL}/api/address`, {
          credentials: "include",
        });

        const json = await res.json();
        setAddresses(json.data || []);

        if (json.data?.length > 0) {
          setSelectedId(json.data[0].id_address);
          onAddressSelect(json.data[0].id_address);
        }
      } catch (err) {
        console.error("Failed to load addresses:", err);
      }
    }

    loadAddresses();
  }, []);

  /* ------------------------ ADD ADDRESS ------------------------ */
  async function handleAdd() {
    if (!newAddress.address_text.trim() || !newAddress.province.trim()) {
      return alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    }

    const res = await fetch(`${API_URL}/api/address`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAddress),
    });

    const json = await res.json();

    if (res.ok) {
      setAddresses((prev) => [...prev, json.data]);
      setNewAddress({
        label: "",
        address_text: "",
        province: "",
        postal_code: "",
        phone: "",
      });
      setShowAddPopup(false);
    } else {
      alert(json.message || "เพิ่มที่อยู่ล้มเหลว");
    }
  }

  /* ------------------------ EDIT POPUP ------------------------ */
  function openEditPopup(addr: any) {
    setEditAddressText({
      label: addr.label || "",
      address_text: addr.address_text || "",
      province: addr.province || "",
      postal_code: addr.postal_code || "",
      phone: addr.phone || "",
    });

    setEditId(addr.id_address);
    setShowEditPopup(true);
  }

  async function handleUpdate() {
    if (!editAddressText.address_text.trim() || !editAddressText.province.trim()) {
      return alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    }

    const res = await fetch(`${API_URL}/api/address/${editId}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editAddressText), // ✅ ส่งทั้ง object ไปอัปเดต
    });

    const json = await res.json();

    if (res.ok) {
      setAddresses((prev) =>
        prev.map((a) =>
          a.id_address === editId ? { ...a, ...editAddressText } : a
        )
      );
      setShowEditPopup(false);
    } else {
      alert(json.message || "แก้ไขที่อยู่ล้มเหลว");
    }
  }

  /* ------------------------ DELETE ADDRESS ------------------------ */
  async function handleDelete(id: number) {
    if (!confirm("ต้องการลบที่อยู่นี้จริงหรือไม่?")) return;

    const res = await fetch(`${API_URL}/api/address/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (res.ok) {
      setAddresses((prev) => prev.filter((a) => a.id_address !== id));

      if (selectedId === id) {
        if (addresses.length > 1) {
          setSelectedId(addresses[0].id_address);
          onAddressSelect(addresses[0].id_address);
        } else {
          setSelectedId(null);
          onAddressSelect(null);
        }
      }
    } else {
      alert("ลบไม่สำเร็จ");
    }
  }

  /* --------------------------------------------------------- */
  /* ------------------------ RENDER UI ----------------------- */
  /* --------------------------------------------------------- */

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">เลือกที่อยู่การจัดส่ง</h2>

      <div className="border border-gray-300 rounded-md p-4">
        {/* ไม่มีที่อยู่ */}
        {addresses.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">ยังไม่มีที่อยู่จัดส่งตอนนี้</p>

            <button
              onClick={() => setShowAddPopup(true)}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
            >
              <span className="text-xl font-bold">＋</span>
              เพิ่มที่อยู่ใหม่
            </button>
          </div>
        ) : (
          <>
            {/* แสดงที่อยู่ที่เลือก */}
            <div className="mb-2">
              {formatAddress(
                addresses.find((a) => a.id_address === selectedId)
              )}
            </div>

            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              onClick={() => setShowPopup(true)}
            >
              เปลี่ยนที่อยู่
            </button>

            <button
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 ml-2"
              onClick={() => setShowAddPopup(true)}
            >
              เพิ่มที่อยู่ใหม่
            </button>
          </>
        )}

        {/* Popup เลือกที่อยู่ */}
        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-md shadow-md w-80">
              <h3 className="text-lg font-semibold mb-4">เลือกที่อยู่ใหม่</h3>

              {addresses.map((addr) => (
                <div
                  key={addr.id_address}
                  className="border p-2 rounded-md mb-2"
                >
                  <label className="flex items-start gap-2">
                    <input
                      type="radio"
                      name="address"
                      checked={selectedId === addr.id_address}
                      onChange={() => setSelectedId(addr.id_address)}
                    />
                    <div>{formatAddress(addr)}</div>
                  </label>

                  <div className="flex gap-2 mt-2">
                    <button
                      className="bg-yellow-500 text-white px-3 py-1 rounded-md"
                      onClick={() => openEditPopup(addr)}
                    >
                      แก้ไข
                    </button>

                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded-md"
                      onClick={() => handleDelete(addr.id_address)}
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex justify-end mt-4">
                <button
                  className="bg-gray-300 px-4 py-2 rounded-md mr-2"
                  onClick={() => setShowPopup(false)}
                >
                  ยกเลิก
                </button>

                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-md"
                  onClick={() => {
                    onAddressSelect(selectedId);
                    setShowPopup(false);
                  }}
                >
                  ยืนยัน
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Popup เพิ่มที่อยู่ */}
        {showAddPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-md shadow-md w-96">
              <h3 className="text-lg font-semibold mb-4">เพิ่มที่อยู่ใหม่</h3>

              {/* Label Autocomplete */}
              <div className="relative mb-4">
                <label className="block mb-2 font-medium">ป้ายกำกับ</label>
                <input
                  type="text"
                  className="border border-gray-300 rounded-md p-2 w-full"
                  placeholder="บ้าน / ที่ทำงาน / อื่นๆ"
                  value={newAddress.label}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewAddress({ ...newAddress, label: value });

                    const results = labelOptions.filter((item) =>
                      item.toLowerCase().includes(value.toLowerCase())
                    );
                    setFilteredLabels(results);
                    setShowLabelDropdown(true);
                  }}
                  onFocus={() => {
                    setFilteredLabels(labelOptions);
                    setShowLabelDropdown(true);
                  }}
                />

                {showLabelDropdown && filteredLabels.length > 0 && (
                  <ul className="absolute z-20 w-full bg-white border border-gray-300 rounded-md shadow-md max-h-40 overflow-y-auto">
                    {filteredLabels.map((item) => (
                      <li
                        key={item}
                        className="p-2 hover:bg-gray-200 cursor-pointer"
                        onClick={() => {
                          setNewAddress({ ...newAddress, label: item });
                          setShowLabelDropdown(false);
                        }}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Address */}
              <label className="block mb-2 font-medium">ที่อยู่</label>
              <textarea
                className="border border-gray-300 rounded-md p-2 w-full mb-4"
                rows={3}
                placeholder="123/45 ถนน... ซอย..."
                value={newAddress.address_text}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, address_text: e.target.value })
                }
              />

              {/* Province Autocomplete */}
              <div className="relative mb-4">
                <label className="block mb-2 font-medium">จังหวัด</label>

                <input
                  type="text"
                  className="border border-gray-300 rounded-md p-2 w-full"
                  placeholder="กรุงเทพมหานคร"
                  value={newAddress.province}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewAddress({ ...newAddress, province: value });

                    const results = provinceList.filter((p) =>
                      p.includes(value)
                    );
                    setFilteredProvinces(results);
                    setShowProvinceDropdown(true);
                  }}
                  onFocus={() => {
                    setFilteredProvinces(provinceList);
                    setShowProvinceDropdown(true);
                  }}
                />

                {showProvinceDropdown && filteredProvinces.length > 0 && (
                  <ul className="absolute z-20 w-full bg-white border border-gray-300 rounded-md shadow-md max-h-40 overflow-y-auto">
                    {filteredProvinces.map((item) => (
                      <li
                        key={item}
                        className="p-2 hover:bg-gray-200 cursor-pointer"
                        onClick={() => {
                          setNewAddress({ ...newAddress, province: item });
                          setShowProvinceDropdown(false);
                        }}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Postal Code */}
              <label className="block mb-2 font-medium">รหัสไปรษณีย์</label>
              <input
                type="text"
                className="border border-gray-300 rounded-md p-2 w-full mb-4"
                placeholder="10110"
                maxLength={5}
                value={newAddress.postal_code}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, postal_code: e.target.value })
                }
              />

              {/* Phone */}
              <label className="block mb-2 font-medium">เบอร์โทรศัพท์</label>
              <input
                type="text"
                className="border border-gray-300 rounded-md p-2 w-full mb-4"
                placeholder="0801234567"
                maxLength={10}
                value={newAddress.phone}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, phone: e.target.value })
                }
              />

              {/* Buttons */}
              <div className="flex justify-end mt-4">
                <button
                  className="bg-gray-300 px-4 py-2 rounded-md mr-2"
                  onClick={() => setShowAddPopup(false)}
                >
                  ยกเลิก
                </button>

                <button
                  className="bg-green-500 text-white px-4 py-2 rounded-md"
                  onClick={handleAdd}
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Popup แก้ไขที่อยู่ */}
        {showEditPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-md shadow-md w-96">
              <h3 className="text-lg font-semibold mb-4">แก้ไขที่อยู่</h3>

              {/* Label */}
              <div className="relative mb-4">
                <label className="block mb-2 font-medium">ป้ายกำกับ</label>
                <input
                  type="text"
                  className="border border-gray-300 rounded-md p-2 w-full"
                  value={editAddressText.label}
                  onChange={(e) =>
                    setEditAddressText({
                      ...editAddressText,
                      label: e.target.value,
                    })
                  }
                />
              </div>

              {/* Address */}
              <label className="block mb-2 font-medium">ที่อยู่</label>
              <textarea
                className="border border-gray-300 rounded-md p-2 w-full mb-4"
                rows={3}
                value={editAddressText.address_text}
                onChange={(e) =>
                  setEditAddressText({
                    ...editAddressText,
                    address_text: e.target.value,
                  })
                }
              />

              {/* Province */}
              <label className="block mb-2 font-medium">จังหวัด</label>
              <input
                type="text"
                className="border border-gray-300 rounded-md p-2 w-full mb-4"
                value={editAddressText.province}
                onChange={(e) =>
                  setEditAddressText({
                    ...editAddressText,
                    province: e.target.value,
                  })
                }
              />

              {/* Postal Code */}
              <label className="block mb-2 font-medium">รหัสไปรษณีย์</label>
              <input
                type="text"
                className="border border-gray-300 rounded-md p-2 w-full mb-4"
                maxLength={5}
                value={editAddressText.postal_code}
                onChange={(e) =>
                  setEditAddressText({
                    ...editAddressText,
                    postal_code: e.target.value,
                  })
                }
              />

              {/* Phone */}
              <label className="block mb-2 font-medium">เบอร์โทรศัพท์</label>
              <input
                type="text"
                className="border border-gray-300 rounded-md p-2 w-full mb-4"
                maxLength={10}
                value={editAddressText.phone}
                onChange={(e) =>
                  setEditAddressText({
                    ...editAddressText,
                    phone: e.target.value,
                  })
                }
              />

              {/* Buttons */}
              <div className="flex justify-end">
                <button
                  className="bg-gray-300 px-4 py-2 rounded-md mr-2"
                  onClick={() => setShowEditPopup(false)}
                >
                  ยกเลิก
                </button>

                <button
                  className="bg-yellow-500 text-white px-4 py-2 rounded-md"
                  onClick={handleUpdate}
                >
                  อัปเดต
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}