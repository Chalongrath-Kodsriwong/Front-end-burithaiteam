"use client";

import { useEffect, useRef, useState } from "react";
import { labelOptions } from "@/data/addressLabels";

/* ──────────────────────────────────────────────────────────
   Types & interfaces
────────────────────────────────────────────────────────── */
export type ThaiAddressDB = Record<string, Record<string, Record<string, string>>>;

export interface AddressFields {
  label: string;
  address_text: string;
  province: string;
  amphoe: string;
  district: string;
  postal_code: string;
  phone: string;
}

export const EMPTY_FIELDS: AddressFields = {
  label: "",
  address_text: "",
  province: "",
  amphoe: "",
  district: "",
  postal_code: "",
  phone: "",
};

/* ──────────────────────────────────────────────────────────
   Thai address database hook — fetches once, cached in module
────────────────────────────────────────────────────────── */
let _dbCache: ThaiAddressDB | null = null;
let _dbPromise: Promise<ThaiAddressDB> | null = null;

export function useThaiAddressDB(): ThaiAddressDB | null {
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
interface ThaiAddressInputProps {
  value: AddressFields;
  onChange: (v: AddressFields) => void;
  db: ThaiAddressDB | null;
}

export function ThaiAddressInput({ value, onChange, db }: ThaiAddressInputProps) {
  const [provinceQuery, setProvinceQuery] = useState(value.province);
  const [amphoeQuery, setAmphoeQuery] = useState(value.amphoe);
  const [districtQuery, setDistrictQuery] = useState(value.district);
  const [showProvince, setShowProvince] = useState(false);
  const [showAmphoe, setShowAmphoe] = useState(false);
  const [showDistrict, setShowDistrict] = useState(false);
  const [showLabel, setShowLabel] = useState(false);
  const [warnProvince, setWarnProvince] = useState(false);
  const [warnAmphoe, setWarnAmphoe] = useState(false);

  const provinceRef = useRef<HTMLDivElement>(null);
  const amphoeRef = useRef<HTMLDivElement>(null);
  const districtRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const provinceInputRef = useRef<HTMLInputElement>(null);
  const amphoeInputRef = useRef<HTMLInputElement>(null);
  const districtInputRef = useRef<HTMLInputElement>(null);
  const addressTextRef = useRef<HTMLTextAreaElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

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

  const filteredProvinces = provinces.filter((p) => p.includes(provinceQuery));
  const filteredAmphoes = amphoes.filter((a) => a.includes(amphoeQuery));
  const filteredDistricts = districts.filter((d) => d.includes(districtQuery));
  const filteredLabels = labelOptions.filter((l) =>
    l.toLowerCase().includes(value.label.toLowerCase())
  );

  function handleNoProvince() {
    setWarnProvince(true);
    provinceRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => provinceInputRef.current?.focus(), 300);
    setTimeout(() => setWarnProvince(false), 3000);
  }

  function handleNoAmphoe() {
    setWarnAmphoe(true);
    amphoeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => amphoeInputRef.current?.focus(), 300);
    setTimeout(() => setWarnAmphoe(false), 3000);
  }

  function selectProvince(p: string) {
    setProvinceQuery(p);
    setAmphoeQuery("");
    setDistrictQuery("");
    setWarnProvince(false);
    onChange({ ...value, province: p, amphoe: "", district: "", postal_code: "" });
    setShowProvince(false);
    setTimeout(() => amphoeInputRef.current?.focus(), 100);
  }

  function selectAmphoe(a: string) {
    setAmphoeQuery(a);
    setDistrictQuery("");
    setWarnAmphoe(false);
    onChange({ ...value, amphoe: a, district: "", postal_code: "" });
    setShowAmphoe(false);
    setTimeout(() => districtInputRef.current?.focus(), 100);
  }

  function selectDistrict(d: string) {
    setDistrictQuery(d);
    const zip = db?.[value.province]?.[value.amphoe]?.[d] ?? "";
    onChange({ ...value, district: d, postal_code: zip });
    setShowDistrict(false);
    setTimeout(() => addressTextRef.current?.focus(), 100);
  }

  const inputClass =
    "border border-gray-300 rounded-lg px-2.5 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition bg-white text-gray-900 placeholder:text-gray-300 text-sm";
  const dropdownClass =
    "absolute z-30 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1";
  const dropdownItemClass =
    "px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-800 border-b border-gray-50 last:border-0";

  return (
    <div className="space-y-2.5">
      {/* ── Label ── */}
      <div ref={labelRef} className="relative">
        <label className="block mb-0.5 text-sm font-medium text-gray-700">
          ป้ายกำกับ <span className="text-gray-800">(บ้าน / ที่ทำงาน)</span>
        </label>
        <input
          type="text"
          className={`${inputClass} text-gray-500`}
          placeholder="กรอกข้อมูล เช่น บ้าน, ที่ทำงาน"
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
        <label className={`block mb-0.5 text-sm font-medium ${warnProvince ? "text-red-500" : "text-gray-700"}`}>
          จังหวัด {warnProvince && <span className="text-xs font-normal">← กรุณากรอกจังหวัดก่อน</span>}
        </label>
        <input
          ref={provinceInputRef}
          type="text"
          className={`${inputClass} ${warnProvince ? "border-red-500 focus:ring-red-400 placeholder:text-red-400" : ""}`}
          placeholder={db ? (warnProvince ? "⚠ กรุณากรอกจังหวัดก่อน" : "กรอกชื่อจังหวัด...") : "กำลังโหลด..."}
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
        <label className={`block mb-0.5 text-sm font-medium ${warnProvince && !value.province ? "text-red-500" : "text-gray-700"}`}>
          {value.province === "กรุงเทพมหานคร" ? "เขต" : "อำเภอ"}
        </label>
        <input
          ref={amphoeInputRef}
          type="text"
          className={`${inputClass} ${!value.province ? (warnProvince ? "bg-red-50 border-red-500 placeholder:text-red-400" : "bg-gray-50") : ""}`}
          placeholder={value.province ? "พิมพ์ชื่ออำเภอ/เขต..." : (warnProvince ? "⚠ กรุณากรอกจังหวัดก่อน" : "เลือกจังหวัดก่อน")}
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
        {!value.province && (
          <div className="absolute inset-0 cursor-pointer z-10" onClick={handleNoProvince} />
        )}
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
        <label className={`block mb-0.5 text-sm font-medium ${
          (warnProvince && !value.province) || (warnAmphoe && !value.amphoe) ? "text-red-500" : "text-gray-700"
        }`}>
          {value.province === "กรุงเทพมหานคร" ? "แขวง" : "ตำบล"}
        </label>
        <input
          ref={districtInputRef}
          type="text"
          className={`${inputClass} ${!value.amphoe ? (
            (warnProvince && !value.province) || warnAmphoe
              ? "bg-red-50 border-red-500 placeholder:text-red-400"
              : "bg-gray-50"
          ) : ""}`}
          placeholder={
            value.amphoe ? "พิมพ์ชื่อตำบล/แขวง..." :
            (!value.province && warnProvince) ? "⚠ กรุณากรอกจังหวัดก่อน" :
            warnAmphoe ? "⚠ กรุณากรอกอำเภอ/เขตก่อน" :
            "เลือกอำเภอ/เขตก่อน"
          }
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
        {!value.province && (
          <div className="absolute inset-0 cursor-pointer z-10" onClick={handleNoProvince} />
        )}
        {value.province && !value.amphoe && (
          <div className="absolute inset-0 cursor-pointer z-10" onClick={handleNoAmphoe} />
        )}
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

      {/* ── Postal code (auto-filled) ── */}
      <div>
        <label className="block mb-0.5 text-sm font-medium text-gray-700">
          รหัสไปรษณีย์
        </label>
        <input
          type="text"
          className={`${inputClass} ${value.district ? "bg-green-50 border-green-300" : "text-gray-400"}`}
          placeholder="รหัสไปรษณีย์จะถูกกรอกอัตโนมัติ"
          maxLength={5}
          value={value.postal_code}
          onChange={(e) => onChange({ ...value, postal_code: e.target.value })}
        />
      </div>

      {/* ── Address text ── */}
      <div>
        <label className="block mb-0.5 text-sm font-medium text-gray-700">
          บ้านเลขที่ / ถนน / ซอย
        </label>
        <textarea
          ref={addressTextRef}
          className={`${inputClass} resize-none`}
          rows={2}
          placeholder="ระบุรายละเอียดที่อยู่เพิ่มเติม เช่น หมู่บ้าน บ้านเลขที่, ถนน, ซอย ฯลฯ"
          value={value.address_text}
          onChange={(e) => onChange({ ...value, address_text: e.target.value })}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); phoneRef.current?.focus(); } }}
        />
      </div>

      {/* ── Phone ── */}
      <div>
        <label className="block mb-0.5 text-sm font-medium text-gray-700">
          เบอร์โทรศัพท์
        </label>
        <input
          type="tel"
          ref={phoneRef}
          className={inputClass}
          placeholder="ระบุเบอร์โทรศัพท์(เช่น 0812345678)"
          maxLength={10}
          value={value.phone}
          onChange={(e) => onChange({ ...value, phone: e.target.value })}
        />
      </div>
    </div>
  );
}
