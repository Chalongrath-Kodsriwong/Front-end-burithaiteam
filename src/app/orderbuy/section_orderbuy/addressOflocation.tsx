"use client";

import { useEffect, useState } from "react";
import {
  ThaiAddressInput,
  AddressFields,
  EMPTY_FIELDS,
  useThaiAddressDB,
} from "@/app/components/ThaiAddressInput";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

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
  window.dispatchEvent(new Event(ADDRESS_SELECTED_EVENT));
}

/* ──────────────────────────────────────────────────────────
   Format address for display
────────────────────────────────────────────────────────── */
function formatAddress(addr: any) {
  if (!addr) return null;
  const parts = [addr.amphoe, addr.district].filter(Boolean);
  return (
    <div className="leading-relaxed">
      <p className="font-semibold text-gray-800">{addr.label}</p>
      <p className="text-gray-700">{addr.address_text}</p>
      {parts.length > 0 && (
        <p className="text-gray-600 text-sm">
          {parts.join(" › ")}
        </p>
      )}
      <p className="text-gray-600 text-sm">
        {addr.province} {addr.postal_code}
      </p>
      <p className="mt-1 text-sm text-blue-600">โทร: {addr.phone}</p>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Overlay — defined OUTSIDE main component so React never
   unmounts it on re-render (prevents input focus loss)
────────────────────────────────────────────────────────── */
function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[999] px-4 pt-44 pb-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-y-auto max-h-[85vh]">
        {children}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Main component
────────────────────────────────────────────────────────── */
export default function AddressLocation({ onAddressSelect }: any) {
  const db = useThaiAddressDB();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [showPopup, setShowPopup] = useState(false);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);

  const [newAddress, setNewAddress] = useState<AddressFields>(EMPTY_FIELDS);
  const [editAddress, setEditAddress] = useState<AddressFields>(EMPTY_FIELDS);
  const [editId, setEditId] = useState<number | null>(null);

  /* ── Load addresses ── */
  useEffect(() => {
    async function loadAddresses() {
      try {
        const res = await fetch(`${API_URL}/api/address`, { credentials: "include" });
        const json = await res.json().catch(() => ({}));
        const list: any[] = json.data || [];
        setAddresses(list);

        const saved = getSelectedAddressId();
        if (saved && list.some((a) => a.id_address === saved)) {
          setSelectedId(saved);
          onAddressSelect(saved);
        } else if (list.length > 0) {
          setSelectedId(list[0].id_address);
          onAddressSelect(list[0].id_address);
          setSelectedAddressId(list[0].id_address);
        } else {
          setSelectedId(null);
          onAddressSelect(null);
          setSelectedAddressId(null);
        }
      } catch (err) {
        console.error("Failed to load addresses:", err);
      }
    }
    loadAddresses();
  }, []);

  /* ── Sync from storage/other tab ── */
  useEffect(() => {
    function syncFromStorage() {
      const saved = getSelectedAddressId();
      if (saved && addresses.some((a) => a.id_address === saved)) {
        setSelectedId(saved);
        onAddressSelect(saved);
      }
    }
    if (typeof window === "undefined") return;
    window.addEventListener("storage", syncFromStorage);
    window.addEventListener(ADDRESS_SELECTED_EVENT, syncFromStorage);
    return () => {
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener(ADDRESS_SELECTED_EVENT, syncFromStorage);
    };
  }, [addresses, onAddressSelect]);

  /* ── Add ── */
  async function handleAdd() {
    if (!newAddress.address_text.trim() || !newAddress.province.trim()) {
      return alert("กรุณากรอกข้อมูลให้ครบถ้วน (ที่อยู่และจังหวัด)");
    }
    const res = await fetch(`${API_URL}/api/address`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAddress),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      const created = json.data;
      setAddresses((prev) => [...prev, created]);
      setSelectedId(created.id_address);
      setSelectedAddressId(created.id_address);
      onAddressSelect(created.id_address);
      setNewAddress(EMPTY_FIELDS);
      setShowAddPopup(false);
    } else {
      alert(json.message || "เพิ่มที่อยู่ล้มเหลว");
    }
  }

  /* ── Edit ── */
  function openEditPopup(addr: any) {
    setEditAddress({
      label: addr.label || "",
      address_text: addr.address_text || "",
      province: addr.province || "",
      amphoe: addr.amphoe || "",
      district: addr.district || "",
      postal_code: addr.postal_code || "",
      phone: addr.phone || "",
    });
    setEditId(addr.id_address);
    setShowEditPopup(true);
  }

  async function handleUpdate() {
    if (!editAddress.address_text.trim() || !editAddress.province.trim()) {
      return alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    }
    const res = await fetch(`${API_URL}/api/address/${editId}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editAddress),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      setAddresses((prev) =>
        prev.map((a) => (a.id_address === editId ? { ...a, ...editAddress } : a))
      );
      setShowEditPopup(false);
    } else {
      alert(json.message || "แก้ไขที่อยู่ล้มเหลว");
    }
  }

  /* ── Delete ── */
  async function handleDelete(id: number) {
    if (!confirm("ต้องการลบที่อยู่นี้จริงหรือไม่?")) return;
    const res = await fetch(`${API_URL}/api/address/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      const remaining = addresses.filter((a) => a.id_address !== id);
      setAddresses(remaining);
      if (selectedId === id) {
        const nextId = remaining.length > 0 ? remaining[0].id_address : null;
        setSelectedId(nextId);
        setSelectedAddressId(nextId);
        onAddressSelect(nextId);
      }
    } else {
      alert("ลบไม่สำเร็จ");
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">เลือกที่อยู่การจัดส่ง</h2>

      <div className="border border-gray-300 rounded-xl p-4">
        {addresses.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">📦</div>
            <p className="text-gray-500 mb-4">ยังไม่มีที่อยู่จัดส่ง</p>
            <button
              onClick={() => setShowAddPopup(true)}
              className="relative w-full flex items-center justify-center gap-2 bg-black text-yellow-500 py-3 rounded-lg overflow-hidden
                hover:text-[rgb(255,215,0)] hover:[text-shadow:0_0_6px_rgba(255,215,0,0.45),0_0_12px_rgba(255,215,0,0.30)]
                hover:bg-gray-900 transition-all duration-500"
            >
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_top,_rgba(212,175,55,0.16)_0%,_rgba(212,175,55,0)_60%)]" />
              <span className="text-xl font-bold">＋</span>
              เพิ่มที่อยู่ใหม่
            </button>
          </div>
        ) : (
          <>
            <div className="mb-3">{formatAddress(addresses.find((a) => a.id_address === selectedId))}</div>
            <div className="flex gap-2 flex-wrap">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm transition-all duration-200 active:scale-95"
                onClick={() => setShowPopup(true)}
              >
                เปลี่ยนที่อยู่
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-sm transition-all duration-200 active:scale-95"
                onClick={() => setShowAddPopup(true)}
              >
                + เพิ่มที่อยู่
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── Popup: เลือกที่อยู่ ── */}
      {showPopup && (
        <Overlay>
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-800">เลือกที่อยู่จัดส่ง</h3>
            <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
              {addresses.map((addr) => (
                <div
                  key={addr.id_address}
                  className={`border-2 rounded-xl p-3 cursor-pointer transition-all ${
                    selectedId === addr.id_address
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedId(addr.id_address)}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      className="mt-1 accent-blue-500"
                      checked={selectedId === addr.id_address}
                      onChange={() => setSelectedId(addr.id_address)}
                    />
                    <div className="flex-1">{formatAddress(addr)}</div>
                  </div>
                  <div className="flex gap-2 mt-2 ml-6">
                    <button
                      className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-lg hover:bg-amber-200 transition-all duration-200 active:scale-95"
                      onClick={(e) => { e.stopPropagation(); openEditPopup(addr); }}
                    >
                      แก้ไข
                    </button>
                    <button
                      className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-lg hover:bg-red-200 transition-all duration-200 active:scale-95"
                      onClick={(e) => { e.stopPropagation(); handleDelete(addr.id_address); }}
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 justify-end mt-5 pt-4 border-t border-gray-100">
              <button
                className="px-4 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 text-sm transition-all duration-200 active:scale-95"
                onClick={() => setShowPopup(false)}
              >
                ยกเลิก
              </button>
              <button
                className="px-5 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 text-sm font-medium transition-all duration-200 active:scale-95"
                onClick={() => {
                  setSelectedAddressId(selectedId);
                  onAddressSelect(selectedId);
                  setShowPopup(false);
                }}
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </Overlay>
      )}

      {/* ── Popup: เพิ่มที่อยู่ ── */}
      {showAddPopup && (
        <Overlay>
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-800">เพิ่มที่อยู่ใหม่</h3>
              <button
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                onClick={() => setShowAddPopup(false)}
              >
                ×
              </button>
            </div>

            <ThaiAddressInput value={newAddress} onChange={setNewAddress} db={db} />

            <div className="flex gap-2 justify-end mt-6 pt-4 border-t border-gray-100">
              <button
                className="px-4 py-2 rounded-lg text-white bg-black hover:bg-gray-800 text-sm transition-all duration-200 active:scale-95"
                onClick={() => { setNewAddress(EMPTY_FIELDS); setShowAddPopup(false); }}
              >
                ยกเลิก
              </button>
              <button
                className="px-5 py-2 rounded-lg bg-yellow-500 text-black hover:bg-yellow-400 text-sm font-medium transition-all duration-200 active:scale-95"
                onClick={handleAdd}
              >
                บันทึก
              </button>
            </div>
          </div>
        </Overlay>
      )}

      {/* ── Popup: แก้ไขที่อยู่ ── */}
      {showEditPopup && (
        <Overlay>
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-800">แก้ไขที่อยู่</h3>
              <button
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                onClick={() => setShowEditPopup(false)}
              >
                ×
              </button>
            </div>

            <ThaiAddressInput value={editAddress} onChange={setEditAddress} db={db} />

            <div className="flex gap-2 justify-end mt-6 pt-4 border-t border-gray-100">
              <button
                className="px-4 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 text-sm transition-all duration-200 active:scale-95"
                onClick={() => setShowEditPopup(false)}
              >
                ยกเลิก
              </button>
              <button
                className="px-5 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 text-sm font-medium transition-all duration-200 active:scale-95"
                onClick={handleUpdate}
              >
                อัปเดต
              </button>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  );
}
