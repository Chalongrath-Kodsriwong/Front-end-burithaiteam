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

function formatAddress(addr: any) {
  if (!addr) return null;
  const parts = [addr.amphoe, addr.district].filter(Boolean);
  return (
    <div className="leading-relaxed">
      <p className="font-semibold text-[#E8F0F8]">{addr.label}</p>
      <p className="text-[#C8D8E8] text-sm mt-0.5">{addr.address_text}</p>
      {parts.length > 0 && (
        <p className="text-[#5A7A98] text-xs mt-0.5">{parts.join(" › ")}</p>
      )}
      <p className="text-[#5A7A98] text-xs">
        {addr.province} {addr.postal_code}
      </p>
      <p className="mt-1 text-xs text-[#00CFFF]">โทร: {addr.phone}</p>
    </div>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center z-[999] px-4 pt-36 pb-4">
      <div className="bg-[rgba(4,5,10,0.99)] border border-[rgba(0,207,255,0.2)] rounded-2xl shadow-[0_0_40px_rgba(0,207,255,0.1)] w-full max-w-sm overflow-y-auto max-h-[85vh]">
        {children}
      </div>
    </div>
  );
}

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
    <div className="bg-[rgba(6,8,14,0.95)] border border-[rgba(0,207,255,0.1)] rounded-xl overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[rgba(0,207,255,0.08)]">
        <span className="text-xs font-bold tracking-widest text-[#00CFFF] uppercase">ที่อยู่จัดส่ง</span>
      </div>

      <div className="px-4 py-4">
        {addresses.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">📦</div>
            <p className="text-[#5A7A98] mb-4 text-sm">ยังไม่มีที่อยู่จัดส่ง</p>
            <button
              onClick={() => setShowAddPopup(true)}
              className="btn-gold text-sm px-6 py-2.5"
            >
              + เพิ่มที่อยู่ใหม่
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4">{formatAddress(addresses.find((a) => a.id_address === selectedId))}</div>
            <div className="flex gap-2 flex-wrap">
              <button
                className="px-4 py-2 text-sm border border-[rgba(0,207,255,0.3)] text-[#00CFFF] rounded-lg hover:bg-[rgba(0,207,255,0.08)] transition-all duration-200 active:scale-95"
                onClick={() => setShowPopup(true)}
              >
                เปลี่ยนที่อยู่
              </button>
              <button
                className="btn-gold text-sm px-4 py-2"
                onClick={() => setShowAddPopup(true)}
              >
                + เพิ่มที่อยู่
              </button>
            </div>
          </>
        )}
      </div>

      {/* Popup: เลือกที่อยู่ */}
      {showPopup && (
        <Overlay>
          <div className="p-5">
            <h3 className="text-base font-bold mb-4 text-[#E8F0F8]">เลือกที่อยู่จัดส่ง</h3>
            <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
              {addresses.map((addr) => (
                <div
                  key={addr.id_address}
                  className={`border rounded-xl p-3 cursor-pointer transition-all ${
                    selectedId === addr.id_address
                      ? "border-[#00CFFF] bg-[rgba(0,207,255,0.06)]"
                      : "border-[rgba(0,207,255,0.15)] hover:border-[rgba(0,207,255,0.35)]"
                  }`}
                  onClick={() => setSelectedId(addr.id_address)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 w-4 h-4 shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedId === addr.id_address ? "border-[#00CFFF]" : "border-[rgba(0,207,255,0.3)]"
                    }`}>
                      {selectedId === addr.id_address && (
                        <div className="w-2 h-2 rounded-full bg-[#00CFFF]" />
                      )}
                    </div>
                    <div className="flex-1">{formatAddress(addr)}</div>
                  </div>
                  <div className="flex gap-2 mt-2 ml-7">
                    <button
                      className="text-xs px-3 py-1 rounded-lg border border-[rgba(212,175,55,0.3)] text-[#D4AF37] hover:bg-[rgba(212,175,55,0.08)] transition-all active:scale-95"
                      onClick={(e) => { e.stopPropagation(); openEditPopup(addr); }}
                    >
                      แก้ไข
                    </button>
                    <button
                      className="text-xs px-3 py-1 rounded-lg border border-[rgba(255,80,80,0.3)] text-[#FF6060] hover:bg-[rgba(255,80,80,0.06)] transition-all active:scale-95"
                      onClick={(e) => { e.stopPropagation(); handleDelete(addr.id_address); }}
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 justify-end mt-5 pt-4 border-t border-[rgba(0,207,255,0.08)]">
              <button
                className="px-4 py-2 rounded-lg text-sm text-[#5A7A98] border border-[rgba(0,207,255,0.15)] hover:border-[rgba(0,207,255,0.3)] transition-all active:scale-95"
                onClick={() => setShowPopup(false)}
              >
                ยกเลิก
              </button>
              <button
                className="btn-gold text-sm px-5 py-2"
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

      {/* Popup: เพิ่มที่อยู่ */}
      {showAddPopup && (
        <Overlay>
          <div className="p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-[#E8F0F8]">เพิ่มที่อยู่ใหม่</h3>
              <button
                className="text-[#5A7A98] hover:text-[#E8F0F8] text-2xl leading-none transition-colors"
                onClick={() => setShowAddPopup(false)}
              >
                ×
              </button>
            </div>
            <ThaiAddressInput value={newAddress} onChange={setNewAddress} db={db} />
            <div className="flex gap-2 justify-end mt-6 pt-4 border-t border-[rgba(0,207,255,0.08)]">
              <button
                className="px-4 py-2 rounded-lg text-sm text-[#5A7A98] border border-[rgba(0,207,255,0.15)] hover:border-[rgba(0,207,255,0.3)] transition-all active:scale-95"
                onClick={() => { setNewAddress(EMPTY_FIELDS); setShowAddPopup(false); }}
              >
                ยกเลิก
              </button>
              <button
                className="btn-gold text-sm px-5 py-2"
                onClick={handleAdd}
              >
                บันทึก
              </button>
            </div>
          </div>
        </Overlay>
      )}

      {/* Popup: แก้ไขที่อยู่ */}
      {showEditPopup && (
        <Overlay>
          <div className="p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-[#E8F0F8]">แก้ไขที่อยู่</h3>
              <button
                className="text-[#5A7A98] hover:text-[#E8F0F8] text-2xl leading-none transition-colors"
                onClick={() => setShowEditPopup(false)}
              >
                ×
              </button>
            </div>
            <ThaiAddressInput value={editAddress} onChange={setEditAddress} db={db} />
            <div className="flex gap-2 justify-end mt-6 pt-4 border-t border-[rgba(0,207,255,0.08)]">
              <button
                className="px-4 py-2 rounded-lg text-sm text-[#5A7A98] border border-[rgba(0,207,255,0.15)] hover:border-[rgba(0,207,255,0.3)] transition-all active:scale-95"
                onClick={() => setShowEditPopup(false)}
              >
                ยกเลิก
              </button>
              <button
                className="btn-gold text-sm px-5 py-2"
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
