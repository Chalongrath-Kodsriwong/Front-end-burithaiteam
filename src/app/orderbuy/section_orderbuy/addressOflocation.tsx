"use client";

import { useEffect, useRef, useState } from "react";
import { labelOptions } from "@/data/addressLabels";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const SELECTED_ADDRESS_KEY = "selected_address_id_v1";
const ADDRESS_SELECTED_EVENT = "address-selected";

type ThaiAddressDB = Record<string, Record<string, Record<string, string>>>;

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
   Thai address database hook — fetches once, cached in module
────────────────────────────────────────────────────────── */
let _dbCache: ThaiAddressDB | null = null;
let _dbPromise: Promise<ThaiAddressDB> | null = null;

function useThaiAddressDB() {
  const [db, setDb] = useState<ThaiAddressDB | null>(_dbCache);

  useEffect(() => {
    if (_dbCache) { setDb(_dbCache); return; }
    if (!_dbPromise) {
      _dbPromise = fetch("/data/thai-address.json")
        .then((r) => r.json())
        .then((data: ThaiAddressDB) => { _dbCache = data; return data; });
    }
    _dbPromise.then(setDb);
  }, []);

  return db;
}

/* ──────────────────────────────────────────────────────────
   Smart Thai address fields component
────────────────────────────────────────────────────────── */
interface AddressFields {
  label: string;
  address_text: string;
  province: string;
  amphoe: string;
  district: string;
  postal_code: string;
  phone: string;
}

const EMPTY_FIELDS: AddressFields = {
  label: "",
  address_text: "",
  province: "",
  amphoe: "",
  district: "",
  postal_code: "",
  phone: "",
};

interface ThaiAddressInputProps {
  value: AddressFields;
  onChange: (v: AddressFields) => void;
  db: ThaiAddressDB | null;
}

function ThaiAddressInput({ value, onChange, db }: ThaiAddressInputProps) {
  const [provinceQuery, setProvinceQuery] = useState(value.province);
  const [amphoeQuery, setAmphoeQuery] = useState(value.amphoe);
  const [districtQuery, setDistrictQuery] = useState(value.district);
  const [showProvince, setShowProvince] = useState(false);
  const [showAmphoe, setShowAmphoe] = useState(false);
  const [showDistrict, setShowDistrict] = useState(false);
  const [showLabel, setShowLabel] = useState(false);

  const provinceRef = useRef<HTMLDivElement>(null);
  const amphoeRef = useRef<HTMLDivElement>(null);
  const districtRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  // Sync query fields when value changes from outside (e.g. edit mode load)
  useEffect(() => { setProvinceQuery(value.province); }, [value.province]);
  useEffect(() => { setAmphoeQuery(value.amphoe); }, [value.amphoe]);
  useEffect(() => { setDistrictQuery(value.district); }, [value.district]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (provinceRef.current && !provinceRef.current.contains(e.target as Node)) setShowProvince(false);
      if (amphoeRef.current && !amphoeRef.current.contains(e.target as Node)) setShowAmphoe(false);
      if (districtRef.current && !districtRef.current.contains(e.target as Node)) setShowDistrict(false);
      if (labelRef.current && !labelRef.current.contains(e.target as Node)) setShowLabel(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const provinces = db ? Object.keys(db).sort() : [];
  const amphoes = db && value.province && db[value.province]
    ? Object.keys(db[value.province]).sort()
    : [];
  const districts = db && value.province && value.amphoe && db[value.province]?.[value.amphoe]
    ? Object.keys(db[value.province][value.amphoe]).sort()
    : [];

  const filteredProvinces = provinces.filter((p) =>
    p.includes(provinceQuery)
  );
  const filteredAmphoes = amphoes.filter((a) =>
    a.includes(amphoeQuery)
  );
  const filteredDistricts = districts.filter((d) =>
    d.includes(districtQuery)
  );
  const filteredLabels = labelOptions.filter((l) =>
    l.toLowerCase().includes(value.label.toLowerCase())
  );

  function selectProvince(p: string) {
    setProvinceQuery(p);
    setAmphoeQuery("");
    setDistrictQuery("");
    onChange({ ...value, province: p, amphoe: "", district: "", postal_code: "" });
    setShowProvince(false);
  }

  function selectAmphoe(a: string) {
    setAmphoeQuery(a);
    setDistrictQuery("");
    onChange({ ...value, amphoe: a, district: "", postal_code: "" });
    setShowAmphoe(false);
  }

  function selectDistrict(d: string) {
    setDistrictQuery(d);
    const zip = db?.[value.province]?.[value.amphoe]?.[d] ?? "";
    onChange({ ...value, district: d, postal_code: zip });
    setShowDistrict(false);
  }

  const inputClass =
    "border border-gray-300 rounded-lg p-2.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition bg-white";
  const dropdownClass =
    "absolute z-30 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1";
  const dropdownItemClass =
    "px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-800 border-b border-gray-50 last:border-0";

  return (
    <div className="space-y-3">
      {/* ── Label ── */}
      <div ref={labelRef} className="relative">
        <label className="block mb-1 text-sm font-medium text-gray-700">
          ป้ายกำกับ <span className="text-gray-400">(บ้าน / ที่ทำงาน)</span>
        </label>
        <input
          type="text"
          className={inputClass}
          placeholder="บ้าน"
          value={value.label}
          onChange={(e) => {
            onChange({ ...value, label: e.target.value });
            setShowLabel(true);
          }}
          onFocus={() => setShowLabel(true)}
        />
        {showLabel && filteredLabels.length > 0 && (
          <ul className={dropdownClass}>
            {filteredLabels.map((l) => (
              <li
                key={l}
                className={dropdownItemClass}
                onMouseDown={() => {
                  onChange({ ...value, label: l });
                  setShowLabel(false);
                }}
              >
                {l}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Province ── */}
      <div ref={provinceRef} className="relative">
        <label className="block mb-1 text-sm font-medium text-gray-700">
          จังหวัด
        </label>
        <input
          type="text"
          className={inputClass}
          placeholder={db ? "พิมพ์ชื่อจังหวัด..." : "กำลังโหลด..."}
          disabled={!db}
          value={provinceQuery}
          onChange={(e) => {
            setProvinceQuery(e.target.value);
            setShowProvince(true);
            if (!e.target.value) {
              onChange({ ...value, province: "", amphoe: "", district: "", postal_code: "" });
            }
          }}
          onFocus={() => setShowProvince(true)}
        />
        {showProvince && filteredProvinces.length > 0 && (
          <ul className={dropdownClass}>
            {filteredProvinces.map((p) => (
              <li key={p} className={dropdownItemClass} onMouseDown={() => selectProvince(p)}>
                {p}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Amphoe (อำเภอ/เขต) ── */}
      <div ref={amphoeRef} className="relative">
        <label className="block mb-1 text-sm font-medium text-gray-700">
          {value.province === "กรุงเทพมหานคร" ? "เขต" : "อำเภอ"}
        </label>
        <input
          type="text"
          className={`${inputClass} ${!value.province ? "bg-gray-50 text-gray-400" : ""}`}
          placeholder={value.province ? "พิมพ์ชื่ออำเภอ/เขต..." : "เลือกจังหวัดก่อน"}
          disabled={!value.province}
          value={amphoeQuery}
          onChange={(e) => {
            setAmphoeQuery(e.target.value);
            setShowAmphoe(true);
            if (!e.target.value) {
              onChange({ ...value, amphoe: "", district: "", postal_code: "" });
            }
          }}
          onFocus={() => { if (value.province) setShowAmphoe(true); }}
        />
        {showAmphoe && filteredAmphoes.length > 0 && (
          <ul className={dropdownClass}>
            {filteredAmphoes.map((a) => (
              <li key={a} className={dropdownItemClass} onMouseDown={() => selectAmphoe(a)}>
                {a}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── District (ตำบล/แขวง) ── */}
      <div ref={districtRef} className="relative">
        <label className="block mb-1 text-sm font-medium text-gray-700">
          {value.province === "กรุงเทพมหานคร" ? "แขวง" : "ตำบล"}
        </label>
        <input
          type="text"
          className={`${inputClass} ${!value.amphoe ? "bg-gray-50 text-gray-400" : ""}`}
          placeholder={value.amphoe ? "พิมพ์ชื่อตำบล/แขวง..." : "เลือกอำเภอ/เขตก่อน"}
          disabled={!value.amphoe}
          value={districtQuery}
          onChange={(e) => {
            setDistrictQuery(e.target.value);
            setShowDistrict(true);
            if (!e.target.value) {
              onChange({ ...value, district: "", postal_code: "" });
            }
          }}
          onFocus={() => { if (value.amphoe) setShowDistrict(true); }}
        />
        {showDistrict && filteredDistricts.length > 0 && (
          <ul className={dropdownClass}>
            {filteredDistricts.map((d) => (
              <li key={d} className={dropdownItemClass} onMouseDown={() => selectDistrict(d)}>
                <span>{d}</span>
                <span className="ml-2 text-xs text-gray-400">
                  {db?.[value.province]?.[value.amphoe]?.[d]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Address text ── */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          บ้านเลขที่ / ถนน / ซอย
        </label>
        <textarea
          className={`${inputClass} resize-none`}
          rows={2}
          placeholder="123/45 ถนนสุขุมวิท ซอย 10"
          value={value.address_text}
          onChange={(e) => onChange({ ...value, address_text: e.target.value })}
        />
      </div>

      {/* ── Postal code (auto-filled) ── */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          รหัสไปรษณีย์
        </label>
        <input
          type="text"
          className={`${inputClass} ${value.district ? "bg-green-50 border-green-300" : ""}`}
          placeholder="10110"
          maxLength={5}
          value={value.postal_code}
          onChange={(e) => onChange({ ...value, postal_code: e.target.value })}
        />
      </div>

      {/* ── Phone ── */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          เบอร์โทรศัพท์
        </label>
        <input
          type="tel"
          className={inputClass}
          placeholder="0801234567"
          maxLength={10}
          value={value.phone}
          onChange={(e) => onChange({ ...value, phone: e.target.value })}
        />
      </div>
    </div>
  );
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999] px-4"
         style={{ paddingTop: "170px", paddingBottom: "16px" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-y-auto"
           style={{ maxHeight: "calc(100vh - 190px)" }}>
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
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm"
                onClick={() => setShowPopup(true)}
              >
                เปลี่ยนที่อยู่
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-sm"
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
                      className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-lg hover:bg-amber-200"
                      onClick={(e) => { e.stopPropagation(); openEditPopup(addr); }}
                    >
                      แก้ไข
                    </button>
                    <button
                      className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-lg hover:bg-red-200"
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
                className="px-4 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 text-sm"
                onClick={() => setShowPopup(false)}
              >
                ยกเลิก
              </button>
              <button
                className="px-5 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 text-sm font-medium"
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
                className="px-4 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 text-sm"
                onClick={() => { setNewAddress(EMPTY_FIELDS); setShowAddPopup(false); }}
              >
                ยกเลิก
              </button>
              <button
                className="px-5 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 text-sm font-medium"
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
                className="px-4 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 text-sm"
                onClick={() => setShowEditPopup(false)}
              >
                ยกเลิก
              </button>
              <button
                className="px-5 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 text-sm font-medium"
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
