"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { provinceList } from "@/data/provinces";
import { labelOptions } from "@/data/addressLabels";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

// ✅ shared storage key/event (ใช้เหมือนกันทั้ง 2 หน้า)
const SELECTED_ADDRESS_KEY = "selected_address_id_v1";
const ADDRESS_SELECTED_EVENT = "address-selected";

function getSelectedAddressId(): number | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SELECTED_ADDRESS_KEY);
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) ? n : null;
}

function setSelectedAddressId(id: number | null) {
  if (typeof window === "undefined") return;
  if (id === null) window.localStorage.removeItem(SELECTED_ADDRESS_KEY);
  else window.localStorage.setItem(SELECTED_ADDRESS_KEY, String(id));

  // ✅ sync ใน tab เดียวกัน
  window.dispatchEvent(new Event(ADDRESS_SELECTED_EVENT));
}

type Address = {
  id_address: number;
  user_id: number;
  label?: string | null;
  address_text: string;
  province?: string | null;
  postal_code?: string | null;
  phone?: string | null;
  created_at?: string;
  updated_at?: string;
};

export default function EditAddress({ user }: { user: any }) {
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // ✅ Mobile popup (เดิม)
  const [showPopup, setShowPopup] = useState(false);

  // ✅ Add/Edit popup
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);

  // edit
  const [editAddressText, setEditAddressText] = useState({
    label: "",
    address_text: "",
    province: "",
    postal_code: "",
    phone: "",
  });
  const [editId, setEditId] = useState<number | null>(null);

  // new
  const [newAddress, setNewAddress] = useState({
    label: "",
    address_text: "",
    province: "",
    postal_code: "",
    phone: "",
  });

  // Autocomplete
  const [filteredLabels, setFilteredLabels] = useState<string[]>([]);
  const [showLabelDropdown, setShowLabelDropdown] = useState(false);

  const [filteredProvinces, setFilteredProvinces] = useState<string[]>([]);
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);

  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id_address === selectedId),
    [addresses, selectedId]
  );

  function formatAddress(addr: Address | undefined) {
    if (!addr) return null;

    return (
      <div className="leading-relaxed">
        <p className="font-semibold">{addr.label || "ที่อยู่"}</p>
        <p>{addr.address_text}</p>
        <p>
          {addr.province || "-"} {addr.postal_code || ""}
        </p>
        <p className="mt-1 text-sm text-gray-600">โทร: {addr.phone || "-"}</p>
      </div>
    );
  }

  // ✅ เลือกที่อยู่ + persist ใน browser + (option) ไปหน้า orderbuy
  async function selectAddress(id: number, goToOrder = false) {
    setSelectedId(id);
    setSelectedAddressId(id);

    // if (goToOrder) {
    //   router.push("/orderbuy");
    // }
  }

  /* ------------------------ LOAD ADDRESS ------------------------ */
  useEffect(() => {
    async function loadAddresses() {
      try {
        setLoading(true);
        setErrorMsg("");

        const res = await fetch(`${API_URL}/api/address`, {
          credentials: "include",
        });

        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          setErrorMsg(json?.message || "โหลดที่อยู่ไม่สำเร็จ");
          setAddresses([]);
          setSelectedId(null);
          setSelectedAddressId(null);
          return;
        }

        const list: Address[] = json?.data || [];
        setAddresses(list);

        const saved = getSelectedAddressId();
        if (saved && list.some((a) => a.id_address === saved)) {
          setSelectedId(saved);
        } else if (list.length > 0) {
          setSelectedId(list[0].id_address);
          setSelectedAddressId(list[0].id_address);
        } else {
          setSelectedId(null);
          setSelectedAddressId(null);
        }
      } catch (err) {
        console.error("Failed to load addresses:", err);
        setErrorMsg("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
        setAddresses([]);
        setSelectedId(null);
        setSelectedAddressId(null);
      } finally {
        setLoading(false);
      }
    }

    loadAddresses();
  }, []);

  // ✅ sync ถ้ามีการเลือกจากหน้าอื่น (tab เดียวกัน / คนละ tab)
  useEffect(() => {
    function syncFromStorage() {
      const saved = getSelectedAddressId();
      if (saved && addresses.some((a) => a.id_address === saved)) {
        setSelectedId(saved);
      }
      if (!saved && addresses.length > 0) {
        // ถ้าไม่มี saved แต่มี address ให้ตั้งเป็นอันแรก
        setSelectedId(addresses[0].id_address);
        setSelectedAddressId(addresses[0].id_address);
      }
    }

    if (typeof window === "undefined") return;

    window.addEventListener("storage", syncFromStorage);
    window.addEventListener(ADDRESS_SELECTED_EVENT, syncFromStorage);

    return () => {
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener(ADDRESS_SELECTED_EVENT, syncFromStorage);
    };
  }, [addresses]);

  /* ------------------------ ADD ADDRESS ------------------------ */
  async function handleAdd() {
    if (!newAddress.address_text.trim() || !newAddress.province.trim()) {
      return alert("กรุณากรอกข้อมูลให้ครบถ้วน (ที่อยู่ + จังหวัด)");
    }

    const res = await fetch(`${API_URL}/api/address`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAddress),
    });

    const json = await res.json().catch(() => ({}));

    if (res.ok) {
      const created: Address = json.data;

      setAddresses((prev) => [...prev, created]);

      // เลือกอันใหม่เป็นค่าเริ่มต้นใน browser ด้วย
      setSelectedId(created.id_address);
      setSelectedAddressId(created.id_address);

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

  /* ------------------------ EDIT ------------------------ */
  function openEditPopup(addr: Address) {
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
    if (!editId) return;

    if (!editAddressText.address_text.trim() || !editAddressText.province.trim()) {
      return alert("กรุณากรอกข้อมูลให้ครบถ้วน (ที่อยู่ + จังหวัด)");
    }

    const res = await fetch(`${API_URL}/api/address/${editId}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editAddressText),
    });

    const json = await res.json().catch(() => ({}));

    if (res.ok) {
      setAddresses((prev) =>
        prev.map((a) => (a.id_address === editId ? { ...a, ...editAddressText } : a))
      );
      setShowEditPopup(false);
    } else {
      alert(json.message || "แก้ไขที่อยู่ล้มเหลว");
    }
  }

  /* ------------------------ DELETE ------------------------ */
  async function handleDelete(id: number) {
    if (!confirm("ต้องการลบที่อยู่นี้จริงหรือไม่?")) return;

    const res = await fetch(`${API_URL}/api/address/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    const json = await res.json().catch(() => ({}));

    if (res.ok) {
      setAddresses((prev) => {
        const next = prev.filter((a) => a.id_address !== id);

        // ถ้าลบอันที่เลือกอยู่: เลือกอันแรกที่เหลือ หรือ null
        if (selectedId === id) {
          const nextId = next.length > 0 ? next[0].id_address : null;
          setSelectedId(nextId);
          setSelectedAddressId(nextId);
        }

        // ถ้าลบจนหมด เคลียร์ storage ด้วย
        if (next.length === 0) {
          setSelectedAddressId(null);
          setShowPopup(false);
        }

        return next;
      });
    } else {
      alert(json.message || "ลบไม่สำเร็จ");
    }
  }

  if (loading) return <div>กำลังโหลดที่อยู่...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">My Address</h1>
      {/* <p className="text-gray-700 mb-4">จัดการที่อยู่ของคุณ (user_id: {user?.user_id})</p> */}

      {errorMsg && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-red-700">
          {errorMsg}
        </div>
      )}

      {/* ========================= MOBILE (เหมือนเดิมก่อนหน้า) ========================= */}
      <div className="block md:hidden">
        <div className="border border-gray-300 rounded-md p-4 bg-white">
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
              <div className="mb-2">{formatAddress(selectedAddress)}</div>

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

              {/* ✅ ไปหน้า orderbuy ได้จากมือถือด้วย (ถ้าต้องการคลิกเลือกแล้วไปเลยให้ใส่ใน popup) */}
              <button
                className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 ml-2 mt-2 w-full"
                onClick={() => router.push("/orderbuy")}
              >
                ไปหน้าสั่งซื้อ (ใช้ที่อยู่ที่เลือก)
              </button>
            </>
          )}

          {/* Popup เลือกที่อยู่ (Mobile) */}
          {showPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-md shadow-md w-80 max-w-[92vw]">
                <h3 className="text-lg font-semibold mb-4">เลือกที่อยู่ใหม่</h3>

                {addresses.map((addr) => (
                  <div key={addr.id_address} className="border p-2 rounded-md mb-2">
                    <label className="flex items-start gap-2">
                      <input
                        type="radio"
                        name="address"
                        checked={selectedId === addr.id_address}
                        onChange={() => {
                          setSelectedId(addr.id_address);
                          setSelectedAddressId(addr.id_address);
                        }}
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
                      // ✅ ยืนยันแล้วไปหน้า orderbuy เลยตาม requirement
                      if (selectedId) setSelectedAddressId(selectedId);
                      setShowPopup(false);
                      router.push("/orderbuy");
                    }}
                  >
                    ยืนยัน
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================= DESKTOP (card grid + คลิกการ์ดเพื่อเลือก + ไปหน้า orderbuy) ========================= */}
      <div className="hidden md:block">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button
            onClick={() => setShowAddPopup(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            ＋ เพิ่มที่อยู่ใหม่
          </button>

          <button
            onClick={() => router.push("/orderbuy")}
            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
          >
            ไปหน้าสั่งซื้อ
          </button>

          {selectedAddress && (
            <div className="text-sm text-gray-600">
              ที่อยู่ที่เลือกตอนนี้:{" "}
              <span className="font-semibold">
                {selectedAddress.label || `#${selectedAddress.id_address}`}
              </span>
            </div>
          )}
        </div>

        {addresses.length === 0 ? (
          <div className="border border-gray-300 rounded-md p-6 bg-white text-center">
            <p className="text-gray-600 mb-4">ยังไม่มีที่อยู่</p>
            <button
              onClick={() => setShowAddPopup(true)}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
            >
              <span className="text-xl font-bold">＋</span>
              เพิ่มที่อยู่ใหม่
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {addresses.map((addr) => {
              const isSelected = selectedId === addr.id_address;

              return (
                <div
                  key={addr.id_address}
                  className={`rounded-lg border p-4 bg-white ${
                    isSelected ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"
                  }`}
                >
                  {/* ✅ คลิกพื้นที่นี้ = เลือก + ไปหน้า orderbuy */}
                  <div
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer"
                    onClick={() => selectAddress(addr.id_address, true)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        selectAddress(addr.id_address, true);
                      }
                    }}
                  >
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="selectedAddressDesktop"
                        checked={isSelected}
                        onChange={() => selectAddress(addr.id_address, true)}
                        className="mt-1"
                      />
                      <div className="flex-1">{formatAddress(addr)}</div>
                    </label>
                  </div>

                  {/* Actions under each card */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <button
                      className="bg-yellow-500 text-white px-3 py-2 rounded-md hover:bg-yellow-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditPopup(addr);
                      }}
                    >
                      แก้ไข
                    </button>

                    <button
                      className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(addr.id_address);
                      }}
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================= POPUP ADD ========================= */}
      {showAddPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-md w-96 max-w-[92vw]">
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
                onBlur={() => setTimeout(() => setShowLabelDropdown(false), 150)}
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

                  const results = provinceList.filter((p) => p.includes(value));
                  setFilteredProvinces(results);
                  setShowProvinceDropdown(true);
                }}
                onFocus={() => {
                  setFilteredProvinces(provinceList);
                  setShowProvinceDropdown(true);
                }}
                onBlur={() => setTimeout(() => setShowProvinceDropdown(false), 150)}
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
              onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
            />

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

      {/* ========================= POPUP EDIT ========================= */}
      {showEditPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-md w-96 max-w-[92vw]">
            <h3 className="text-lg font-semibold mb-4">แก้ไขที่อยู่</h3>

            <label className="block mb-2 font-medium">ป้ายกำกับ</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md p-2 w-full mb-4"
              value={editAddressText.label}
              onChange={(e) =>
                setEditAddressText({ ...editAddressText, label: e.target.value })
              }
            />

            <label className="block mb-2 font-medium">ที่อยู่</label>
            <textarea
              className="border border-gray-300 rounded-md p-2 w-full mb-4"
              rows={3}
              value={editAddressText.address_text}
              onChange={(e) =>
                setEditAddressText({ ...editAddressText, address_text: e.target.value })
              }
            />

            <label className="block mb-2 font-medium">จังหวัด</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md p-2 w-full mb-4"
              value={editAddressText.province}
              onChange={(e) =>
                setEditAddressText({ ...editAddressText, province: e.target.value })
              }
            />

            <label className="block mb-2 font-medium">รหัสไปรษณีย์</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md p-2 w-full mb-4"
              maxLength={5}
              value={editAddressText.postal_code}
              onChange={(e) =>
                setEditAddressText({ ...editAddressText, postal_code: e.target.value })
              }
            />

            <label className="block mb-2 font-medium">เบอร์โทรศัพท์</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md p-2 w-full mb-4"
              maxLength={10}
              value={editAddressText.phone}
              onChange={(e) =>
                setEditAddressText({ ...editAddressText, phone: e.target.value })
              }
            />

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
  );
}