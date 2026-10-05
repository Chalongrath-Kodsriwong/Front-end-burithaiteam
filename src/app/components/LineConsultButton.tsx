"use client";

/**
 * ปุ่มทักไลน์สอบถามก่อนซื้อ
 *
 * ลูกค้ากลุ่มนี้คือช่างกับผู้รับเหมา ซึ่งมักต้องถามก่อนว่าอะไหล่ตัวนี้ใช้กับงาน
 * ที่มีอยู่ได้มั้ย มากกว่าจะกดซื้อทันที ถ้าไม่มีทางถามง่ายๆ ก็ปิดหน้าไปเฉยๆ
 *
 * ⚠️ ซ่อนตัวเองถ้ายังไม่ได้ตั้ง NEXT_PUBLIC_LINE_OA_ID
 * ดีกว่าโชว์ปุ่มที่กดแล้วพาไปหน้าเสีย ซึ่งทำลายความน่าเชื่อถือมากกว่าไม่มีปุ่ม
 */
export default function LineConsultButton({
  productName,
  className = "",
}: {
  productName?: string;
  className?: string;
}) {
  const oaId = process.env.NEXT_PUBLIC_LINE_OA_ID?.trim();
  if (!oaId) return null;

  // รองรับทั้งกรอกมาแบบ "@burithaiteam" และ "burithaiteam"
  const id = oaId.startsWith("@") ? oaId.slice(1) : oaId;
  const href = `https://line.me/R/ti/p/@${id}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={
        productName ? `สอบถามเรื่อง ${productName} ทาง LINE` : "สอบถามทาง LINE"
      }
      className={`flex items-center justify-center gap-2 rounded-xl border border-[#06C755] bg-[#06C755]/10 px-4 py-3 text-sm font-bold text-[#06C755] transition hover:bg-[#06C755] hover:text-white ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
        <path d="M12 2C6.48 2 2 5.74 2 10.35c0 4.13 3.56 7.59 8.37 8.24.33.07.78.22.89.5.1.26.07.66.03.92l-.14.86c-.04.26-.2 1.01.89.55 1.09-.46 5.87-3.46 8.01-5.92C21.5 13.9 22 12.18 22 10.35 22 5.74 17.52 2 12 2zM8.09 13.2H6.1a.53.53 0 0 1-.53-.53V8.69c0-.29.24-.53.53-.53s.53.24.53.53v3.45h1.46c.29 0 .53.24.53.53s-.24.53-.53.53zm2.08-.53c0 .29-.24.53-.53.53a.53.53 0 0 1-.53-.53V8.69c0-.29.24-.53.53-.53s.53.24.53.53v3.98zm4.78 0c0 .23-.15.43-.37.5a.56.56 0 0 1-.16.03.53.53 0 0 1-.43-.21l-2.04-2.78v2.46c0 .29-.24.53-.53.53a.53.53 0 0 1-.53-.53V8.69c0-.23.15-.43.36-.5a.51.51 0 0 1 .17-.03c.17 0 .33.08.43.21l2.04 2.78V8.69c0-.29.24-.53.53-.53s.53.24.53.53v3.98zm3.21-2.52c.29 0 .53.24.53.53s-.24.53-.53.53h-1.46v.93h1.46c.29 0 .53.24.53.53s-.24.53-.53.53h-1.99a.53.53 0 0 1-.53-.53V8.69c0-.29.24-.53.53-.53h1.99c.29 0 .53.24.53.53s-.24.53-.53.53h-1.46v.93h1.46z" />
      </svg>
      สอบถามก่อนสั่งซื้อทาง LINE
    </a>
  );
}
