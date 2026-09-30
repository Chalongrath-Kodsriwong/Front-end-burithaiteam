"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { FolderUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreatePaymentResponse } from "@/types/Paymentclient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const DEFAULT_TTL_SECONDS = 30 * 60;
const POLL_INTERVAL_MS = 4000;

function formatMMSS(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

type QrCache = {
  qrCodeUrl: string;
  expiresAt: string;
  ttlSec: number;
};

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderIdStr = useMemo(() => searchParams.get("order_id") ?? "", [searchParams]);
  const totalPriceStr = useMemo(() => searchParams.get("total_price") ?? "", [searchParams]);
  const orderId = useMemo(() => Number(orderIdStr || 0), [orderIdStr]);
  const totalPrice = useMemo(() => {
    const v = Number(totalPriceStr || 0);
    return Number.isFinite(v) ? v : 0;
  }, [totalPriceStr]);

  const isReady = orderId > 0 && totalPrice > 0;

  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [remainingSec, setRemainingSec] = useState<number>(0);
  const [remainingText, setRemainingText] = useState<string>("--:--");
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [ttlSec, setTtlSec] = useState<number>(DEFAULT_TTL_SECONDS);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const [activePromptPay, setActivePromptPay] = useState<{
    first_name?: string;
    last_name?: string;
    payKey?: string;
  } | null>(null);

  // ─── slip upload fallback ───────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // ─── auto-poll state ────────────────────────────────────────────────────────
  const [pollStatus, setPollStatus] = useState<"waiting" | "confirmed" | "redirecting">("waiting");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── popup (QR expired) ─────────────────────────────────────────────────────
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const requestedRef = useRef(false);

  const cacheKey = useMemo(() => `payment_qr_cache_v1:${orderId}:${totalPrice}`, [orderId, totalPrice]);

  const readCache = (): QrCache | null => {
    try {
      const raw = sessionStorage.getItem(cacheKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as QrCache;
      if (!parsed?.qrCodeUrl || !parsed?.expiresAt) return null;
      return parsed;
    } catch { return null; }
  };
  const writeCache = (data: QrCache) => { try { sessionStorage.setItem(cacheKey, JSON.stringify(data)); } catch {} };
  const clearCache = () => { try { sessionStorage.removeItem(cacheKey); } catch {} };
  const isStillValid = (expIso: string) => {
    const expMs = new Date(expIso).getTime();
    return Number.isFinite(expMs) && expMs > Date.now();
  };

  const formatPayKey = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length === 10) return digits.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
    if (digits.length === 13) return digits.replace(/(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/, "$1-$2-$3-$4-$5");
    return value;
  };

  // ─── start / stop polling ──────────────────────────────────────────────────
  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  const startPolling = useCallback((pid: string) => {
    if (pollRef.current) return;
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/payment/poll/${pid}`, { credentials: "include" });
        if (!res.ok) return;
        const json = await res.json();
        const orderStatus: string = json?.data?.order_status ?? "";
        // ค่าที่ enum StatusText มีจริง: pending | confirmed | checking | success | canceled
        // confirmed = Slip2Go ยืนยันกับธนาคารผ่านแล้ว · checking = รอ admin ตรวจ
        if (["confirmed", "checking", "success"].includes(orderStatus)) {
          stopPolling();
          setPollStatus("confirmed");
          setTimeout(() => {
            setPollStatus("redirecting");
            router.push(`/check_order?order_id=${orderId}`);
          }, 1500);
        }
      } catch {}
    }, POLL_INTERVAL_MS);
  }, [orderId, router, stopPolling]);

  useEffect(() => {
    if (paymentId && !isExpired) startPolling(paymentId);
    return () => stopPolling();
  }, [paymentId, isExpired, startPolling, stopPolling]);

  // ─── generate QR ──────────────────────────────────────────────────────────
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
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_order: Number(orderId), dynamic_amount: Number(amount), payment_method: "PROMPTPAY" }),
      });
      const json: CreatePaymentResponse | null = await res.json();
      if (!res.ok) {
        setErrorText(json?.message || json?.error || `Error ${res.status}`);
        return;
      }
      const qr = json?.data?.qrDataUrl;
      const exp = json?.data?.expires_at;
      const pid = json?.data?.payment_id;
      if (!qr || !exp || !pid) { setErrorText("Backend response ไม่ครบ"); return; }
      setQrCodeUrl(qr);
      setExpiresAt(exp);
      setPaymentId(pid);
      let computedTtl = DEFAULT_TTL_SECONDS;
      const expMs = new Date(exp).getTime();
      if (Number.isFinite(expMs) && expMs > Date.now()) {
        const diff = Math.round((expMs - Date.now()) / 1000);
        computedTtl = diff > 0 ? diff : DEFAULT_TTL_SECONDS;
      }
      setTtlSec(computedTtl);
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
        const res = await fetch(`${API_URL}/api/promtpay?page=1&limit=10`, { credentials: "include" });
        const text = await res.text();
        let json;
        try { json = JSON.parse(text); } catch { return; }
        const list = json?.data?.data || [];
        const active = list.find((item: any) => item.is_active === true);
        if (active) setActivePromptPay({ first_name: active.first_name, last_name: active.last_name, payKey: active.payKey });
      } catch {}
    }
    fetchPromptPay();
  }, []);

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
    clearCache();
    generateQRCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

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
        clearCache();
        if (timer) clearInterval(timer);
        timer = null;
      } else {
        setIsExpired(false);
      }
    };
    tick();
    timer = setInterval(tick, 1000);
    return () => { if (timer) clearInterval(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt]);

  useEffect(() => {
    if (isExpired) {
      stopPolling();
      setPopupMessage("QR Code นี้หมดอายุแล้ว กรุณาสร้าง order ใหม่");
      setIsPopupOpen(true);
    }
  }, [isExpired, stopPolling]);

  // ─── slip upload (fallback) ────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleUploadSlip = async () => {
    setIsProcessing(true);
    if (!file) { setUploadError("กรุณาเลือกไฟล์สลิปก่อน"); setIsProcessing(false); return; }
    if (!paymentId) { setUploadError("ไม่พบ paymentId"); setIsProcessing(false); return; }
    setUploading(true);
    setUploadError("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`${API_URL}/api/payment/${paymentId}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(errText || `Error: ${res.status}`);
      }
      const data = await res.json();
      if (data?.status !== "success") throw new Error(data?.message || "เกิดข้อผิดพลาด");
      setIsModalOpen(false);
      router.push(`/check_order?order_id=${orderId}`);
    } catch (error: any) {
      setUploadError(error?.message || "เกิดข้อผิดพลาดในการอัปโหลด");
    } finally {
      setUploading(false);
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#08090d] overflow-hidden">
      {/* LED grid background ให้เข้าธีมเดียวกับหน้าอื่น */}
      <div className="absolute inset-0 bg-led-grid opacity-15 pointer-events-none" />

      <div className="relative z-10 max-w-md mx-auto px-4 py-6">
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00CFFF] animate-pulse shadow-[0_0_6px_rgba(0,207,255,0.9)]" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#00CFFF]/70 uppercase">BuriThaiTeam Store</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#E8F0F8]">ชำระเงิน</h1>
        </div>

        {errorText && (
          <div className="mt-4 rounded-xl border border-[rgba(239,68,68,0.4)] bg-[rgba(239,68,68,0.1)] p-3 text-sm text-[#FCA5A5]">{errorText}</div>
        )}

        {/* Card: QR + PromptPay info */}
        <div className="mt-4 rounded-2xl border border-[rgba(0,207,255,0.15)] bg-[#0d0f14] shadow-sm overflow-hidden">
          <div className="relative px-4 py-3 bg-gradient-to-r from-[#213660] to-[#213660]">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-3">
                <img src="/image/logo_promtpay.png" alt="PromptPay" className="h-10 w-10 object-contain" />
                <div className="text-white leading-tight text-center">
                  <div className="text-sm font-semibold tracking-wide">THAI QR</div>
                  <div className="text-[13px] font-extrabold tracking-wide">PAYMENT</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4">
            {loading && <div className="text-center text-sm text-[#7A9AB8] py-10">กำลังสร้าง QR Code…</div>}

            {!loading && qrCodeUrl && (
              <div className="text-center">
                <div className="mt-4 mb-4 flex justify-center">
                  <div className={`relative rounded-2xl border bg-white p-4 shadow-sm ${isExpired ? "opacity-40" : ""}`}>
                    <img src={qrCodeUrl} alt="PromptPay QR" className="h-56 w-56 sm:h-64 sm:w-64 object-contain" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-white rounded-lg shadow-md">
                        <img src="/image/logo_promtpay.png" alt="" className="h-8 w-8 object-contain rounded-lg" />
                      </div>
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-xs text-[#5A7A98]">เปิดแอปธนาคาร → สแกน QR → ตรวจสอบยอดก่อนกดยืนยัน</p>

                <div className="mt-4 space-y-2 mb-4">
                  <p className="text-xl font-bold text-sky-800">แสกน QR เพื่อโอนเข้าบัญชี</p>
                  {activePromptPay ? (
                    <>
                      <p className="text-[17px] font-bold text-[#7A9AB8]">ชื่อ: {activePromptPay.first_name} {activePromptPay.last_name}</p>
                      <p className="text-[17px] font-bold text-[#7A9AB8]">บัญชี: {formatPayKey(activePromptPay.payKey || "")}</p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-400">กำลังโหลดข้อมูลบัญชี...</p>
                  )}
                </div>

                {isExpired && <div className="mt-3 text-sm text-[#FCA5A5]">QR นี้หมดอายุแล้ว กรุณากด "สร้าง QR ใหม่"</div>}

                {expiresAt && (
                  <div className="mt-2 text-center">
                    {paymentId && (
                      <div className="text-[13px] font-semibold text-gray-400 break-all">หมายเลขการชำระเงิน: {paymentId}</div>
                    )}
                    <div className={`mt-2 text-lg font-extrabold ${isExpired ? "text-[#FCA5A5]" : "text-[#6EE7B7]"}`}>
                      {isExpired ? "หมดอายุแล้ว" : `เหลือเวลา ${remainingText}`}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── status bar ──────────────────────────────────────────────────────── */}
        {!isExpired && paymentId && (
          <div className="mt-5">
            {pollStatus === "waiting" && (
              <div className="rounded-xl border border-[rgba(0,207,255,0.25)] bg-[rgba(0,207,255,0.06)] px-4 py-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <svg className="animate-spin h-5 w-5 text-[#00CFFF]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  <span className="text-sm font-semibold text-[#E8F0F8]">รอการตรวจสอบการชำระเงิน...</span>
                </div>
                <p className="text-xs text-[#7A9AB8]">โอนแล้วกดปุ่มด้านล่างเพื่ออัปโหลดสลิป ระบบจะยืนยันกับธนาคารให้ทันที</p>
              </div>
            )}
            {pollStatus === "confirmed" && (
              <div className="rounded-xl border border-[rgba(16,185,129,0.35)] bg-[rgba(16,185,129,0.08)] px-4 py-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <svg className="h-6 w-6 text-[#34D399]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                  <span className="text-sm font-bold text-[#6EE7B7]">ยืนยันการชำระเงินสำเร็จ!</span>
                </div>
                <p className="text-xs text-[#34D399]">กำลังพาคุณไปหน้าตรวจสอบออเดอร์...</p>
              </div>
            )}
            {pollStatus === "redirecting" && (
              <div className="rounded-xl border border-[rgba(16,185,129,0.35)] bg-[rgba(16,185,129,0.08)] px-4 py-4 text-center text-sm font-semibold text-[#6EE7B7]">
                กำลังโหลด...
              </div>
            )}
          </div>
        )}

        {/* ─── expired button ─────────────────────────────────────────────────── */}
        {isExpired && (
          <div className="mt-5">
            <button
              onClick={() => { setPopupMessage("QR Code นี้หมดอายุแล้ว กรุณาสร้าง QR Code ใหม่"); setIsPopupOpen(true); }}
              className="w-full rounded-xl px-4 py-3 text-white font-semibold shadow-sm bg-red-600 hover:bg-red-700 transition"
            >
              Regenerate QR Code ใหม่
            </button>
          </div>
        )}

        {/* ─── อัปโหลดสลิป (ทางหลัก — ระบบยืนยันกับธนาคารอัตโนมัติ) ──────────── */}
        {!isExpired && paymentId && pollStatus === "waiting" && (
          <div className="mt-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full rounded-xl px-4 py-3.5 font-bold text-[#08090d] bg-gradient-to-r from-[#D4AF37] to-[#E8C040] shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:shadow-[0_0_28px_rgba(212,175,55,0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <FolderUp size={20} />
              โอนแล้ว? อัปโหลดสลิปที่นี่
            </button>
            <p className="mt-2 text-center text-[11px] text-[#5A7A98]">
              ระบบจะตรวจสอบกับธนาคารและยืนยันให้อัตโนมัติภายในไม่กี่วินาที
            </p>
          </div>
        )}

        {/* ─── Popup: QR expired ─────────────────────────────────────────────── */}
        {isPopupOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="mx-4 w-full max-w-md bg-[#0d0f14] border border-[rgba(0,207,255,0.15)] text-[#E8F0F8] p-4 sm:p-6 rounded-xl shadow-xl">
              <h2 className="text-base sm:text-xl font-semibold mb-4 break-words">{popupMessage}</h2>
              <div className="flex flex-col-reverse sm:flex-row justify-center gap-2 sm:gap-4">
                <Link href="/shoppingcart">
                  <button onClick={() => setIsPopupOpen(false)} className="w-full sm:w-auto px-4 py-2 bg-gray-300 rounded-lg text-sm sm:text-base">
                    Back to basket
                  </button>
                </Link>
                <button
                  onClick={() => { generateQRCode(); setIsPopupOpen(false); }}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-sm sm:text-base"
                >
                  สร้าง Order ใหม่
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Modal: อัปโหลดสลิป (fallback) ────────────────────────────────── */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-40 bg-black bg-opacity-50">
            <div className="mx-4 w-full max-w-md bg-[#0d0f14] border border-[rgba(0,207,255,0.15)] text-[#E8F0F8] p-4 sm:p-6 rounded-xl shadow-xl">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">อัปโหลดสลิป</h2>
              {uploadError && <div className="text-red-500 text-sm mb-4 break-words">{uploadError}</div>}
              <div className="relative w-full">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="mb-4 border-2 border-[rgba(0,207,255,0.25)] rounded-lg p-2 pr-10 w-full text-sm text-[#A9C0D6] hover:bg-[rgba(0,207,255,0.08)] cursor-pointer"
                />
                <FolderUp className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A7A98] pointer-events-none" size={20} />
              </div>
              {uploading ? (
                <div className="text-sm">กำลังอัปโหลด...</div>
              ) : (
                <div className="flex flex-col-reverse sm:flex-row justify-between gap-2">
                  <button onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto px-4 py-2 bg-gray-300 rounded-lg text-sm sm:text-base">
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleUploadSlip}
                    disabled={!file}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-sm sm:text-base disabled:opacity-60"
                  >
                    อัปโหลด
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Processing overlay ─────────────────────────────────────────────── */}
        {isProcessing && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="mx-4 w-full max-w-sm bg-[#0d0f14] border border-[rgba(0,207,255,0.15)] text-[#E8F0F8] p-4 sm:p-6 rounded-xl shadow-xl">
              <h2 className="text-lg sm:text-xl font-semibold mb-3">กำลังประมวลผล...</h2>
              <p className="text-sm sm:text-base leading-relaxed">กำลังอัปโหลดสลิปและตรวจสอบข้อมูล กรุณารอสักครู่</p>
            </div>
          </div>
        )}

        <p className="text-center text-[11px] text-gray-400 mt-5">* เวลานับถอยหลังอ้างอิงจาก expires_at ที่ได้จาก Back-end</p>
      </div>
    </div>
  );
}
