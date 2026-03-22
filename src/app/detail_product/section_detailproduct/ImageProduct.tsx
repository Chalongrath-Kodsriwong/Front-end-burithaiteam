// ✅ แก้เฉพาะจุดในไฟล์เดิม ImageProduct

"use client";
import "flowbite";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { MediaItem } from "@/types/Imageproduct"

export default function ImageProduct({ product }: any) {
  if (!product) return <div>กำลังโหลดรูปสินค้า...</div>;

  const media: MediaItem[] = useMemo(() => {
    const list =
      product.images?.length > 0
        ? product.images.map((m: any) => {
            const url = String(m?.url || "");
            const isVideo = url.toLowerCase().endsWith(".mp4");
            return { url, kind: isVideo ? "video" : "image" } as MediaItem;
          })
        : [{ url: product.avatar ?? "/image/logo_white.jpeg", kind: "image" }];

    return list;
  }, [product]);

  const [selected, setSelected] = useState<MediaItem>(media[0]);

  // ✅ เพิ่ม ref สำหรับสั่งเล่นอัตโนมัติ
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // ✅ เมื่อเลือกเป็น video ให้ "เล่นเองอัตโนมัติ" + "ปิดเสียงไว้ก่อน"
  useEffect(() => {
    if (selected.kind !== "video") return;

    const v = videoRef.current;
    if (!v) return;

    v.muted = false; // ปิดเสียงไว้ก่อน เปิดคือ false, ปิดคือ true (อย่าลืมไปแก้ไขตรง tag video ด้านล่างด้วย)
    v.currentTime = 0; // เริ่มตั้งแต่ต้น (ถ้าไม่อยากเริ่มใหม่ ลบบรรทัดนี้ได้)

    // autoplay บาง browser ต้องใช้ muted ถึงจะเล่นได้
    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }, [selected]);

  return (
    <div className="flex flex-col items-center">
      {/* ✅ Main viewer */}
      {selected.kind === "video" ? (
        <video
          ref={videoRef}
          key={selected.url}
          src={selected.url}
          controls
          // muted // ปิดเสียง default ผู้ใช้เปิดเองได้จาก controls
          playsInline
          className="w-full h-[350px] object-cover rounded-lg shadow mb-4 bg-black"
        />
      ) : (
        <img
          src={selected.url}
          alt={product.name}
          onError={(e) => (e.currentTarget.src = "/image/logo_white.jpeg")}
          className="w-full h-[350px] object-cover rounded-lg shadow mb-4"
        />
      )}

      {/* ✅ Thumbnails */}
      <div className="flex gap-2 justify-center flex-wrap">
        {media.map((m, idx) => (
          <button
            key={`${m.url}-${idx}`}
            type="button"
            onClick={() => setSelected(m)}
            className={`w-20 h-20 rounded cursor-pointer border overflow-hidden flex items-center justify-center ${
              selected.url === m.url ? "border-blue-500" : "border-gray-300"
            }`}
            title={m.kind === "video" ? "วิดีโอ" : "รูปภาพ"}
          >
            {m.kind === "video" ? (
              <div className="relative w-full h-full bg-black">
                <video
                  src={m.url}
                  muted
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/80 text-black text-xs px-2 py-1 rounded">
                    ▶ Video
                  </div>
                </div>
              </div>
            ) : (
              <img
                src={m.url}
                alt={`thumb-${idx}`}
                onError={(e) => (e.currentTarget.src = "/image/logo_white.jpeg")}
                className="w-full h-full object-cover"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
