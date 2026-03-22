"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MdDriveFolderUpload } from "react-icons/md";
import Link from "next/link";

import { useRouter } from "next/navigation"; // นำเข้า useRouter สำหรับการทำการ redirect

import { CreatePaymentResponse } from "@/types/Paymentclient"

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const DEFAULT_TTL_SECONDS = 30 * 60; // 30 นาที (fallback)

function formatMMSS(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

// Progress Ring (SVG)
function ProgressRing({
  progress, // 0..1
  size = 84,
  stroke = 8,
  label,
  subLabel,
  isExpired,
}: {
  progress: number;
  size?: number;
  stroke?: number;
  label: string;
  subLabel?: string;
  isExpired?: boolean;
}) {
  const clamped = Math.min(1, Math.max(0, progress));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          className="stroke-gray-200"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={isExpired ? "stroke-red-500" : "stroke-emerald-500"}
          strokeLinecap="round"
        />
      </svg>

      <div className="absolute text-center">
        <div
          className={`text-sm font-bold ${
            isExpired ? "text-red-600" : "text-emerald-700"
          }`}
        >
          {label}
        </div>
        {subLabel && (
          <div className="text-[11px] text-gray-500">{subLabel}</div>
        )}
      </div>
    </div>
  );
}

type QrCache = {
  qrCodeUrl: string;
  expiresAt: string; // ISO
  ttlSec: number;
};

export default function PaymentPage() {
  const searchParams = useSearchParams();

  const router = useRouter(); // ใส่ useRouter() ไว้ที่นี่

  const orderIdStr = useMemo(
    () => searchParams.get("order_id") ?? "",
    [searchParams]
  );
  const totalPriceStr = useMemo(
    () => searchParams.get("total_price") ?? "",
    [searchParams]
  );

  const orderId = useMemo(() => Number(orderIdStr || 0), [orderIdStr]);
  const totalPrice = useMemo(() => {
    const v = Number(totalPriceStr || 0);
    return Number.isFinite(v) ? v : 0;
  }, [totalPriceStr]);

  const isReady = orderId > 0 && totalPrice > 0;

  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  // countdown
  const [remainingSec, setRemainingSec] = useState<number>(0);
  const [remainingText, setRemainingText] = useState<string>("--:--");
  const [isExpired, setIsExpired] = useState<boolean>(false);

  // progress percent
  const [ttlSec, setTtlSec] = useState<number>(DEFAULT_TTL_SECONDS);
  const [fetchedAtMs, setFetchedAtMs] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  const [paymentId, setPaymentId] = useState<string | null>(null);

  // state สำหรับเก็บข้อมูล PromptPay ที่ active อยู่ (ถ้ามี)
  const [activePromptPay, setActivePromptPay] = useState<{
    first_name?: string;
    last_name?: string;
    payKey?: string;
  } | null>(null);

  const formatPayKey = (value: string) => {
    const digits = value.replace(/\D/g, "");

    if (digits.length === 10) {
      return digits.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
    }

    if (digits.length === 13) {
      return digits.replace(
        /(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/,
        "$1-$2-$3-$4-$5"
      );
    }

    return value;
  };

  // State สำหรับ Modal และการอัปโหลดไฟล์
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const [isPopupOpen, setIsPopupOpen] = useState(false); // เปิดหรือปิด Popup
  const [popupMessage, setPopupMessage] = useState(""); // ข้อความที่จะแสดงใน Popup

  // เพิ่ม state สำหรับควบคุมการเปิด/ปิด Popup
  const [isProcessing, setIsProcessing] = useState(false);

  const closePopup = () => {
    setIsPopupOpen(false); // ปิด Popup
  };

  // กันยิงซ้ำ (dev mode/StrictMode)
  const requestedRef = useRef(false);

  // ✅ key แยกตาม orderId+totalPrice เพื่อกัน cache ปนกัน
  const cacheKey = useMemo(() => {
    return `payment_qr_cache_v1:${orderId}:${totalPrice}`;
  }, [orderId, totalPrice]);

  const readCache = (): QrCache | null => {
    try {
      const raw = sessionStorage.getItem(cacheKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as QrCache;
      if (!parsed?.qrCodeUrl || !parsed?.expiresAt) return null;
      return parsed;
    } catch {
      return null;
    }
  };

  const writeCache = (data: QrCache) => {
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
    } catch {}
  };

  const clearCache = () => {
    try {
      sessionStorage.removeItem(cacheKey);
    } catch {}
  };

  const isStillValid = (expIso: string) => {
    const expMs = new Date(expIso).getTime();
    return Number.isFinite(expMs) && expMs > Date.now();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  // ฟังก์ชันสำหรับอัปโหลดสลิป
  const handleUploadSlip = async () => {
    setIsProcessing(true); // เปิด Popup เมื่อเริ่มประมวลผล

    if (!file) {
      setUploadError("กรุณาเลือกไฟล์สลิปก่อน");
      setIsProcessing(false);
      return;
    }
    if (!paymentId) {
      setUploadError("ไม่พบ paymentId กรุณาสร้างรายการชำระเงินก่อน");
      setIsProcessing(false);
      return;
    }

    setUploading(true);
    setUploadError("");
    setSuccessMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      // 1) upload slip
      const res = await fetch(`${API_URL}/api/payment/${paymentId}`, {
        method: "PUT",
        credentials: "include", // ส่ง cookie session (Beer Token)
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(errText || `Error: ${res.status} - ${res.statusText}`);
      }

      const data = await res.json();

      if (data?.status !== "success") {
        throw new Error(data?.message || "เกิดข้อผิดพลาดในการอัปโหลด");
      }

      setSuccessMessage("สลิปถูกอัปโหลดและตรวจสอบสำเร็จ");

      // 2) --- ดึงสถานะ order หลัง upload slip ---
      const orderRes = await fetch(`${API_URL}/api/account/orders`, {
        method: "GET",
        credentials: "include", // Beer Token
      });

      if (!orderRes.ok) {
        throw new Error("ไม่สามารถดึงข้อมูลออร์เดอร์ได้");
      }

      const orderData = await orderRes.json();

      // หา order ที่ตรงกับ orderId ปัจจุบัน
      const currentOrder = orderData?.data?.find(
        (o: any) => o.id_order === orderId
      );

      console.log("สถานะในฐานข้อมูล:", currentOrder?.status);

      // redirect เมื่อสถานะเป็น checking
      if (currentOrder?.status === "checking") {
        console.log("สถานะเป็น checking, redirect ไปหน้า /check_order");
        router.push(`/check_order?order_id=${orderId}`);
      } else {
        console.log("สถานะยังไม่เป็น checking:", currentOrder?.status);
      }
    } catch (error: any) {
      // ❗️ตามที่คุณกำชับ: ห้ามลบ/ห้ามเปลี่ยน logic ใน catch/finally
      setUploadError(error?.message || "เกิดข้อผิดพลาดในการอัปโหลด");
      console.log("อัปโหลดไม่สำเร็จ");
      console.error("Error during upload:", error);
    } finally {
      // ❗️ตามที่คุณกำชับ: ห้ามลบ/ห้ามเปลี่ยน logic ใน catch/finally
      setUploading(false);
      setIsProcessing(false); // ปิด Popup เมื่อเสร็จสิ้น
    }
  };

  const openModal = () => {
    setIsModalOpen(true); // เปิด Modal
  };

  const closeModal = () => {
    setIsModalOpen(false); // ปิด Modal
  };

  // ฟังก์ชันสำหรับการสร้าง QR ใหม่
  async function generateQRCode() {
    if (!isReady) return;

    if (requestedRef.current) return;
    requestedRef.current = true;

    setLoading(true);
    setErrorText("");

    try {
      const amount = Math.round(totalPrice * 100) / 100;

      const res = await fetch(`${API_URL}/api/payment`, {
        method: "POST",
        credentials: "include", // ส่ง cookie session ไปด้วย
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_order: Number(orderId),
          dynamic_amount: Number(amount),
          payment_method: "PROMPTPAY",
        }),
      });

      const json: CreatePaymentResponse | null = await res.json();

      if (!res.ok) {
        const msg =
          json?.message ||
          json?.error ||
          `Internal server error (${res.status})`;
        setErrorText(msg);
        return;
      }

      const qr = json?.data?.qrDataUrl; // QR code URL
      const exp = json?.data?.expires_at; // เวลาหมดอายุของ QR
      const paymentId = json?.data?.payment_id; // payment_id ที่ได้จาก API response

      if (!qr || !exp || !paymentId) {
        setErrorText(
          "Backend response ไม่มี qrDataUrl, expires_at หรือ payment_id"
        );
        return;
      }

      setQrCodeUrl(qr);
      setExpiresAt(exp);
      setPaymentId(paymentId); // เก็บ payment_id ที่ได้จาก API response

      let computedTtl = DEFAULT_TTL_SECONDS;
      const expMs = new Date(exp).getTime();
      if (Number.isFinite(expMs) && expMs > Date.now()) {
        const diff = Math.round((expMs - Date.now()) / 1000);
        computedTtl = diff > 0 ? diff : DEFAULT_TTL_SECONDS;
      }
      setTtlSec(computedTtl);

      // Cache สำหรับ refresh หน้า
      writeCache({ qrCodeUrl: qr, expiresAt: exp, ttlSec: computedTtl });
    } catch (error: any) {
      setErrorText(error?.message || "Request failed");
    } finally {
      setLoading(false);
      requestedRef.current = false;
    }
  }

  useEffect(() => {
  async function fetchPromptPay() {
    try {
      const res = await fetch(`${API_URL}/api/promtpay?page=1&limit=10`, {
        credentials: "include",
      });

      const text = await res.text();

      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        console.error("Response ไม่ใช่ JSON:", text);
        return;
      }

      const list = json?.data?.data || [];

      const active = list.find((item: any) => item.is_active === true);

      if (active) {
        setActivePromptPay({
          first_name: active.first_name,
          last_name: active.last_name,
          payKey: active.payKey,
        });
      }
    } catch (err) {
      console.error("โหลด promptpay ไม่ได้", err);
    }
  }

  fetchPromptPay();
}, []);

  // ✅ auto gen เมื่อ param พร้อมจริง
  // เปลี่ยน logic: ก่อนจะยิง API ให้พยายามใช้ cache ก่อน (กันเวลาเริ่มใหม่ตอน refresh)
  useEffect(() => {
    if (!isReady) return;

    const cached = readCache();
    if (cached && isStillValid(cached.expiresAt)) {
      setQrCodeUrl(cached.qrCodeUrl);
      setExpiresAt(cached.expiresAt);
      setTtlSec(cached.ttlSec || DEFAULT_TTL_SECONDS);
      setErrorText("");
      setLoading(false);
      return;
    }

    // cache ไม่มี/หมดอายุ -> ขอใหม่จาก backend
    clearCache();
    generateQRCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  // ✅ Countdown effect: อัปเดตทุก 1 วิ และหยุดเมื่อหมดอายุ
  useEffect(() => {
    if (!expiresAt) return;

    const expireMs = new Date(expiresAt).getTime();
    if (!Number.isFinite(expireMs)) return;

    let timer: ReturnType<typeof setInterval> | null = null;

    const tick = () => {
      const diffMs = expireMs - Date.now();
      const sec = Math.max(0, Math.floor(diffMs / 1000));

      setRemainingSec(sec);
      setRemainingText(formatMMSS(sec));

      if (diffMs <= 0) {
        setIsExpired(true);
        setRemainingSec(0);
        setRemainingText("00:00");

        // หมดอายุแล้วล้าง cache (กัน refresh แล้วยังโชว์ของเก่า)
        clearCache();

        if (timer) clearInterval(timer);
        timer = null;
        return;
      }

      setIsExpired(false);
    };

    tick();
    timer = setInterval(tick, 1000);

    return () => {
      if (timer) clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt]);

  const progress = useMemo(() => {
    const total = Math.max(1, ttlSec || DEFAULT_TTL_SECONDS);
    return remainingSec / total;
  }, [remainingSec, ttlSec]);

  // ✅ Countdown effect: อัปเดตทุก 1 วิ และหยุดเมื่อหมดอายุ
  useEffect(() => {
    if (!expiresAt) return;

    const expireMs = new Date(expiresAt).getTime();
    if (!Number.isFinite(expireMs)) return;

    let timer: ReturnType<typeof setInterval> | null = null;

    const tick = () => {
      const diffMs = expireMs - Date.now();
      const sec = Math.max(0, Math.floor(diffMs / 1000));

      setRemainingSec(sec);

      const mm = String(Math.floor(sec / 60)).padStart(2, "0");
      const ss = String(sec % 60).padStart(2, "0");
      setRemainingText(`${mm}:${ss}`);

      if (diffMs <= 0) {
        setIsExpired(true);
        if (timer) clearInterval(timer);
        timer = null;
      } else {
        setIsExpired(false);
      }
    };

    tick();
    timer = setInterval(tick, 1000);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [expiresAt]);

  // เมื่อ QR หมดอายุจะเปิด Popup
  useEffect(() => {
    if (isExpired) {
      setPopupMessage("QR Code นี้หมดอายุแล้วกรุณาสร้าง order ใหม่");
      setIsPopupOpen(true); // เปิด Popup เมื่อ QR หมดอายุ
    }
  }, [isExpired]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-md mx-auto px-4 py-2">
        <h1 className="text-2xl font-extrabold text-center tracking-tight">
          🧾 ชำระเงิน
        </h1>
        {/* <p className="text-center text-sm text-gray-500 mt-1">
          สแกน QR PromptPay เพื่อชำระเงิน
        </p> */}

        {errorText && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errorText}
          </div>
        )}

        {/* Card: Order summary */}
        <div className="mt-4 rounded-2xl border bg-white shadow-sm overflow-hidden">
          <div className="relative px-4 py-3 bg-gradient-to-r from-[#213660] to-[#213660]">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-3">
                <img
                  src="/image/logo_promtpay.png"
                  alt="PromptPay"
                  className="h-10 w-10 object-contain"
                />
                <div className="text-white leading-tight text-center">
                  <div className="text-sm font-semibold tracking-wide">
                    THAI QR
                  </div>
                  <div className="text-[13px] font-extrabold tracking-wide">
                    PAYMENT
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4">
            {loading && (
              <div className="text-center text-sm text-gray-600 py-10">
                กำลังสร้าง QR Code…
              </div>
            )}

            {!loading && qrCodeUrl && (
              <div className="text-center">
                <div className="mt-4 mb-4 flex justify-center">
                  <div
                    className={`relative rounded-2xl border bg-white p-4 shadow-sm ${
                      isExpired ? "opacity-40" : ""
                    }`}
                  >
                    <img
                      src={qrCodeUrl}
                      alt="PromptPay QR"
                      className="w-64 h-64 object-contain"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-white rounded-lg shadow-md">
                        <img
                          src="/image/logo_promtpay.png"
                          alt=""
                          className="h-8 w-8 object-contain rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-xs text-gray-500">
                  เปิดแอปธนาคาร → สแกน QR → ตรวจสอบยอดก่อนกดยืนยัน
                </p>

                {/* <div>
                    <ProgressRing
                        progress={progress}
                        size={96}
                        stroke={10}
                        label={remainingText}
                        subLabel={isExpired ? "หมดอายุ" : "เวลาที่เหลือ"}
                        isExpired={isExpired}
                    />
                </div> */}

                <div className="mt-4 space-y-2 mb-4">
                  <p className="text-xl font-bold text-sky-800">
                    แสกน QR เพื่อโอนเข้าบัญชี
                  </p>
                  {activePromptPay ? (
                    <>
                      <p className="text-[17px] font-bold text-gray-600">
                        ชื่อ: {activePromptPay.first_name}{" "}
                        {activePromptPay.last_name}
                      </p>
                      <p className="text-[17px] font-bold text-gray-600">
                        บัญชี: {formatPayKey(activePromptPay.payKey || "")}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-400">
                      กำลังโหลดข้อมูลบัญชี...
                    </p>
                  )}
                </div>

                {isExpired && (
                  <div className="mt-3 text-sm text-red-600">
                    QR นี้หมดอายุแล้ว กรุณากด “สร้าง QR ใหม่”
                  </div>
                )}

                {expiresAt && (
                  <div className="mt-2 text-center">
                    {paymentId && (
                      <>
                        {/* <div className="text-[18px] font-semibold">
                          หมายเลขการชำระเงิน
                        </div> */}
                        <div className="text-[13px] font-semibold text-gray-400 break-all">
                          หมายเลขการชำระเงิน: {paymentId}
                        </div>
                      </>
                    )}

                    <div
                      className={`mt-2 text-lg font-extrabold ${
                        isExpired ? "text-red-600" : "text-emerald-700"
                      }`}
                    >
                      {isExpired ? "หมดอายุแล้ว" : `เหลือเวลา ${remainingText}`}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {/* // ปรับปุ่ม "Regenerate QR Code ใหม่" เมื่อ QR หมดอายุ */}
        <div className="mt-5 flex gap-3">
          <button
            onClick={() => {
              if (isExpired) {
                setPopupMessage(
                  "QR Code นี้หมดอายุแล้วกรุณาสร้าง QR Code ใหม่"
                );
                setIsPopupOpen(true); // เปิด Popup เมื่อ QR หมดอายุ
              } else {
                openModal(); // เปิด Modal สำหรับอัปโหลดสลิป
              }
            }}
            disabled={loading || !isReady}
            className={`flex-1 rounded-xl px-4 py-3 text-white font-semibold shadow-sm transition ${
              loading || !isReady
                ? "bg-gray-400"
                : isExpired
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading
              ? "กำลังสร้าง…"
              : isExpired
              ? "Regenerate QR Code ใหม่"
              : "Upload slip"}
          </button>
        </div>

        {/* // **Popup** เมื่อ QR หมดอายุ */}
        {isPopupOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg w-1/3">
              <h2 className="text-xl font-semibold mb-4">{popupMessage}</h2>
              <div className="flex justify-center gap-4">
                <Link href="/shoppingcart">
                  <button
                    onClick={closePopup}
                    className="px-4 py-2 bg-gray-300 rounded-lg"
                  >
                    Back to basket
                  </button>
                </Link>
                <button
                  onClick={() => {
                    generateQRCode(); // กดปุ่มนี้จะ Regenerate QR Code ใหม่
                    closePopup(); // ปิด Popup
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  สร้าง Order ใหม่
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal สำหรับอัปโหลดสลิป */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-40 bg-black bg-opacity-50">
            {" "}
            {/* z-40 */}
            <div className="bg-white p-6 rounded-lg w-1/3">
              <h2 className="text-xl font-semibold mb-4">อัปโหลดสลิป</h2>

              {uploadError && (
                <div className="text-red-500 text-sm mb-4">{uploadError}</div>
              )}

              <div className="relative w-full">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,application/pdf"
                  className="mb-4 border-2 border-gray-400 rounded-lg p-2 pr-10 w-full hover:bg-gray-200 cursor-pointer"
                />

                <MdDriveFolderUpload
                  className="absolute right-3 top-1/4 -translate-y-1/4 text-gray-500 pointer-events-none"
                  size={22}
                />
              </div>

              {uploading ? (
                <div>กำลังอัปโหลด...</div>
              ) : (
                <div className="flex justify-between">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-300 rounded-lg"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleUploadSlip}
                    disabled={!file}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    อัปโหลด
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Popup สำหรับแสดงสถานะการประมวลผล */}
        {isProcessing && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            {" "}
            {/* z-50 */}
            <div className="bg-white p-6 rounded-lg w-1/3">
              <h2 className="text-xl font-semibold mb-4">กำลังประมวลผล...</h2>
              <p>กำลังอัปโหลดสลิปและตรวจสอบข้อมูล กรุณารอสักครู่</p>
            </div>
          </div>
        )}

        <p className="text-center text-[11px] text-gray-400 mt-5">
          * เวลานับถอยหลังอ้างอิงจาก expires_at ที่ได้จาก Back-end
        </p>
      </div>
    </div>
  );
}
