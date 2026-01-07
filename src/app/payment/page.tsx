"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const DEFAULT_TTL_SECONDS = 30 * 60; // 30 นาที (fallback)

type CreatePaymentResponse =
  | {
      success: true;
      message?: string;
      data?: {
        payment_id?: string;
        qrDataUrl?: string | null;
        expires_at?: string | null;
      };
    }
  | {
      status?: string;
      message?: string;
      error?: string;
      data?: any;
    }
  | any;

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
  const [remainingText, setRemainingText] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);

  // progress percent
  const [ttlSec, setTtlSec] = useState<number>(DEFAULT_TTL_SECONDS);
  const [fetchedAtMs, setFetchedAtMs] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

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

  async function generateQRCode() {
    if (!isReady) return;

    // กันยิงซ้ำเอง + กันกดรัว
    if (requestedRef.current) return;
    requestedRef.current = true;

    setLoading(true);
    setErrorText("");

    // ❗️ไม่ reset countdown ตรงนี้ เพื่อไม่ให้ดูเหมือนเวลาเริ่มใหม่
    // setQrCodeUrl("");
    // setExpiresAt(null);
    // setRemainingText("");
    // setRemainingSec(0);
    // setIsExpired(false);
    // setFetchedAtMs(null);
    // setTtlSec(DEFAULT_TTL_SECONDS);

    try {
      const amount = Math.round(totalPrice * 100) / 100;

      const res = await fetch(`${API_URL}/api/payment`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },

        // ✅ ตรงตาม Back-end: { id_order, dynamic_amount, payment_method }
        body: JSON.stringify({
          id_order: Number(orderId),
          dynamic_amount: Number(amount),
          payment_method: "PROMPTPAY",
        }),
      });

      const json: CreatePaymentResponse | null = await res
        .json()
        .catch(() => null);

      const qr = json?.data?.qrDataUrl;
      const exp = json?.data?.expires_at;

      if (!res.ok) {
        const msg =
          json?.message ||
          json?.error ||
          `Internal server error (${res.status})`;
        setErrorText(msg);
        return;
      }

      if (!qr) {
        setErrorText(
          "Backend response ไม่มี qrDataUrl (ตรวจสอบฝั่ง Back-end response shape)"
        );
        return;
      }

      if (!exp) {
        setErrorText("Backend response ไม่มี expires_at");
        return;
      }

      const now = Date.now();
      setFetchedAtMs(now);

      setQrCodeUrl(qr);
      setExpiresAt(exp);

      // TTL สำหรับ progress (คำนวณครั้งที่ได้ exp ครั้งแรก)
      let computedTtl = DEFAULT_TTL_SECONDS;
      const expMs = new Date(exp).getTime();
      if (Number.isFinite(expMs) && expMs > now) {
        const diff = Math.round((expMs - now) / 1000);
        computedTtl = diff > 0 ? diff : DEFAULT_TTL_SECONDS;
      }
      setTtlSec(computedTtl);

      // ✅ cache เพื่อให้ refresh หน้าแล้วเวลาคงเดิม
      writeCache({ qrCodeUrl: qr, expiresAt: exp, ttlSec: computedTtl });
    } catch (e: any) {
      setErrorText(e?.message || "Request failed");
    } finally {
      setLoading(false);
      requestedRef.current = false;
    }
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-2xl font-extrabold text-center tracking-tight">
          🧾 ชำระเงิน
        </h1>
        <p className="text-center text-sm text-gray-500 mt-1">
          สแกน QR PromptPay เพื่อชำระเงิน
        </p>

        {errorText && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errorText}
          </div>
        )}

        {/* Card: Order summary */}
        {/* <div className="mt-6 rounded-2xl border bg-white shadow-sm p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs text-gray-500">Order</div>
              <div className="font-semibold">#{orderIdStr || "-"}</div>

              <div className="mt-2 text-xs text-gray-500">ยอดชำระ</div>
              <div className="text-xl font-extrabold">
                {totalPriceStr || "-"}{" "}
                <span className="text-sm font-semibold text-gray-500">THB</span>
              </div>
            </div> */}

            {/* Ring */}
            {/* {expiresAt ? (
              <ProgressRing
                progress={progress}
                label={isExpired ? "หมดอายุ" : remainingText || "--:--"}
                subLabel="เหลือเวลา"
                isExpired={isExpired}
              />
            ) : (
              <ProgressRing progress={0} label="--:--" subLabel="เหลือเวลา" />
            )}
          </div>

          {expiresAt && (
            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
              <span>หมดอายุ: {new Date(expiresAt).toLocaleString()}</span>
              <span
                className={`px-2 py-1 rounded-full border ${
                  isExpired
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}
              >
                {isExpired ? "Expired" : "Active"}
              </span>
            </div>
          )} */}

          {/* Progress bar */}
          {/* {expiresAt && (
            <div className="mt-3">
              <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-[width] duration-300 ${
                    isExpired ? "bg-red-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
              <div className="mt-1 text-[11px] text-gray-500 flex justify-between">
                <span>0:00</span>
                <span>{Math.round(progress * 100)}%</span>
                <span>
                  {Math.floor(ttlSec / 60)}:
                  {String(ttlSec % 60).padStart(2, "0")}
                </span>
              </div>
            </div>
          )}
        </div> */}

        {/* QR Card */}
        <div className="mt-4 rounded-2xl border bg-white shadow-sm overflow-hidden">
          {/* Header bar (PromptPay style) */}
          <div className="relative px-4 py-3 bg-gradient-to-r from-[#213660] to-[#213660]">
            {/* Center content */}
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-3">
                {/* Logo */}
                <img
                  src="/image/logo_promtpay.png"
                  alt="PromptPay"
                  className="h-10 w-10 object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display =
                      "none";
                  }}
                />

                {/* Text */}
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

            {/* Status badge (right aligned) */}
            <span
              className={`absolute right-4 top-1/2 -translate-y-1/2 text-[11px] px-2 py-1 rounded-full border ${
                isExpired
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {isExpired ? "Expired" : "Active"}
            </span>
          </div>

          {/* Body */}
          <div className="p-4">
            {loading && (
              <div className="text-center text-sm text-gray-600 py-10">
                กำลังสร้าง QR Code…
              </div>
            )}

            {!loading && qrCodeUrl && (
              <div className="text-center">
                {/* QR box */}
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

                    {/* optional: logo center (ไม่ใหญ่เกินไปเพื่อไม่ให้สแกนยาก) */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-white rounded-lg shadow-md">
                        <img
                          src="/image/logo_promtpay.png"
                          alt=""
                          className="h-8 w-8 object-contain rounded-lg"
                          onError={(e) => {
                            (
                              e.currentTarget as HTMLImageElement
                            ).style.display = "none";
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-xs text-gray-500">
                  เปิดแอปธนาคาร → สแกน QR → ตรวจสอบยอดก่อนกดยืนยัน
                </p>

                {isExpired && (
                  <div className="mt-3 text-sm text-red-600">
                    QR นี้หมดอายุแล้ว กรุณากด “สร้าง QR ใหม่”
                  </div>
                )}

                <div className="mt-6 flex flex-col items-center gap-4">
                  <div className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                    นาย ฉลองรัฐ โคตรศรีวงศ์
                  </div>
                  <div className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                    เบอร์โทร 0812345678
                  </div>
                </div>

                {/* Amount + Countdown */}
                <div className="flex items-start justify-between gap-3 mt-6">
                  <div className="text-left">
                    <div className="text-xs text-gray-500">Order</div>
                    <div className="font-semibold">#{orderIdStr || "-"}</div>
                    <div className="text-xs text-gray-500">ยอดชำระ</div>
                    <div className="text-2xl font-extrabold">
                      {totalPriceStr || "-"}{" "}
                      <span className="text-sm font-semibold text-gray-500">
                        THB
                      </span>
                    </div>

                    {expiresAt && (
                      <div className="mt-1 text-[11px] text-gray-500">
                        หมดอายุ: {new Date(expiresAt).toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* mini timer badge */}
                  {/* <div
                    className={`px-3 py-2 rounded-xl border text-center ${
                      isExpired
                        ? "border-red-200 bg-red-50"
                        : "border-emerald-200 bg-emerald-50"
                    }`}
                  >
                    <div
                      className={`text-sm font-extrabold ${
                        isExpired ? "text-red-700" : "text-emerald-700"
                      }`}
                    >
                      {isExpired ? "00:00" : remainingText || "--:--"}
                    </div>
                    <div className="text-[10px] text-gray-500">เหลือเวลา</div>
                  </div> */}
                  {expiresAt ? (
              <ProgressRing
                progress={progress}
                label={isExpired ? "หมดอายุ" : remainingText || "--:--"}
                subLabel="เหลือเวลา"
                isExpired={isExpired}
              />
            ) : (
              <ProgressRing progress={0} label="--:--" subLabel="เหลือเวลา" />
            )}
                </div>
              </div>
            )}

            {!loading && !qrCodeUrl && (
              <div className="text-center text-sm text-gray-600 py-10">
                ยังไม่มี QR — กดสร้างเพื่อเริ่มชำระเงิน
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex gap-3">
          <button
            onClick={() => {
              requestedRef.current = false;
              generateQRCode();
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
              ? "สร้าง QR ใหม่"
              : "รีเฟรช QR"}
          </button>

          <button
            onClick={() => window.history.back()}
            className="rounded-xl px-4 py-3 font-semibold border bg-white hover:bg-gray-50"
          >
            ย้อนกลับ
          </button>
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-5">
          * เวลานับถอยหลังอ้างอิงจาก expires_at ที่ได้จาก Back-end
        </p>
      </div>
    </div>
  );
}
