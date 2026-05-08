"use client";

import { useEffect } from "react";

export default function ShareRedirectClient({ targetUrl }: { targetUrl: string }) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.location.replace(targetUrl);
    }, 120);

    return () => window.clearTimeout(timer);
  }, [targetUrl]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-6 text-center">
      <div className="max-w-xl space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900">กำลังเปิดหน้าสินค้า...</h1>
        <p className="text-gray-600">หากหน้าไม่เปลี่ยนอัตโนมัติ สามารถกดปุ่มด้านล่างเพื่อไปยังรายละเอียดสินค้าได้ทันที</p>
        <a
          href={targetUrl}
          className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-white hover:bg-gray-800"
        >
          ไปยังหน้าสินค้า
        </a>
      </div>
    </main>
  );
}
