"use client";
import "flowbite";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

import { MediaItem } from "@/types/Imageproduct";

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

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const selected = media[selectedIndex] ?? media[0];
  const imageMedia = useMemo(
    () => media.filter((item) => item.kind === "image"),
    [media]
  );
  const previewImages = imageMedia.length > 0 ? imageMedia : media;
  const previewIndex = useMemo(
    () => Math.max(0, previewImages.findIndex((item) => item.url === selected.url)),
    [previewImages, selected.url]
  );

  useEffect(() => {
    setSelectedIndex(0);
    setIsPreviewOpen(false);
    setIsPreviewVisible(false);
  }, [media]);

  useEffect(() => {
    if (selected.kind !== "video") return;

    const v = videoRef.current;
    if (!v) return;

    v.muted = false;
    v.currentTime = 0;

    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }, [selected]);

  useEffect(() => {
    if (!isPreviewOpen) return;

    const timer = window.setTimeout(() => setIsPreviewVisible(true), 10);
    return () => window.clearTimeout(timer);
  }, [isPreviewOpen]);

  useEffect(() => {
    if (!isPreviewOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePreview();
        return;
      }

      if (previewImages.length <= 1) return;

      if (event.key === "ArrowRight") {
        showNextPreview();
      }

      if (event.key === "ArrowLeft") {
        showPreviousPreview();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPreviewOpen, previewImages.length, previewIndex]);

  const closePreview = () => {
    setIsPreviewVisible(false);
    window.setTimeout(() => setIsPreviewOpen(false), 180);
  };

  const openPreview = () => {
    if (selected.kind !== "image") return;
    setIsPreviewOpen(true);
  };

  const selectMedia = (index: number) => {
    setSelectedIndex(index);
  };

  const selectPreviewImage = (index: number) => {
    const target = previewImages[index];
    const mediaIndex = media.findIndex((item) => item.url === target.url);
    if (mediaIndex >= 0) setSelectedIndex(mediaIndex);
  };

  const showPreviousPreview = () => {
    if (previewImages.length <= 1) return;
    const nextIndex = (previewIndex - 1 + previewImages.length) % previewImages.length;
    selectPreviewImage(nextIndex);
  };

  const showNextPreview = () => {
    if (previewImages.length <= 1) return;
    const nextIndex = (previewIndex + 1) % previewImages.length;
    selectPreviewImage(nextIndex);
  };

  return (
    <>
      <div className="w-full max-w-[520px] flex flex-col items-center">
        {selected.kind === "video" ? (
          <video
            ref={videoRef}
            key={selected.url}
            src={selected.url}
            controls
            playsInline
            className="w-full h-64 sm:h-72 md:h-[350px] object-cover rounded-lg shadow mb-4 bg-black"
          />
        ) : (
          <button
            type="button"
            onClick={openPreview}
            className="w-full mb-4 rounded-lg overflow-hidden shadow group"
          >
            <Image
              src={selected.url}
              alt={product.name}
              width={520}
              height={350}
              className="w-full h-64 sm:h-72 md:h-[350px] object-cover transition duration-300 group-hover:scale-[1.02]"
              unoptimized={selected.url.startsWith("http")}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/image/logo_white.jpeg"; }}
            />
          </button>
        )}

        <div className="flex gap-2 justify-center flex-wrap">
          {media.map((m, idx) => (
            <button
              key={`${m.url}-${idx}`}
              type="button"
              onClick={() => selectMedia(idx)}
              className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded cursor-pointer border overflow-hidden flex items-center justify-center transition ${
                selected.url === m.url
                  ? "border-blue-500 ring-2 ring-blue-100"
                  : "border-gray-300 hover:border-gray-400"
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
                <Image
                  src={m.url}
                  alt={`thumb-${idx}`}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  unoptimized={m.url.startsWith("http")}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/image/logo_white.jpeg"; }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {isPreviewOpen && selected.kind === "image" && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6 transition duration-200 ${
            isPreviewVisible ? "bg-black/80 opacity-100" : "bg-black/0 opacity-0"
          }`}
          onClick={closePreview}
        >
          <button
            type="button"
            onClick={closePreview}
            className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-2 text-sm font-bold text-gray-900 shadow hover:bg-white"
          >
            ปิด
          </button>

          {previewImages.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showPreviousPreview();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 text-2xl font-bold text-gray-900 shadow hover:bg-white"
              aria-label="รูปก่อนหน้า"
            >
              ‹
            </button>
          )}

          <div
            className={`relative flex max-h-full w-full max-w-6xl flex-col items-center gap-4 transition duration-200 ${
              isPreviewVisible
                ? "translate-y-0 scale-100 opacity-100"
                : "translate-y-4 scale-95 opacity-0"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="w-full overflow-hidden rounded-2xl bg-white shadow-2xl">
              <Image
                src={selected.url}
                alt={product.name}
                width={1200}
                height={900}
                className="max-h-[78vh] w-full object-contain bg-white"
                unoptimized={selected.url.startsWith("http")}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/image/logo_white.jpeg"; }}
              />
            </div>

            {previewImages.length > 1 && (
              <>
                <div className="rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-gray-700 shadow">
                  {previewIndex + 1} / {previewImages.length}
                </div>

                <div className="flex max-w-full gap-2 overflow-x-auto rounded-2xl bg-white/95 px-3 py-3 shadow">
                  {previewImages.map((item, idx) => (
                    <button
                      key={`preview-${item.url}-${idx}`}
                      type="button"
                      onClick={() => selectPreviewImage(idx)}
                      className={`shrink-0 h-16 w-16 sm:h-20 sm:w-20 rounded-lg overflow-hidden border transition ${
                        previewIndex === idx
                          ? "border-blue-500 ring-2 ring-blue-100"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <Image
                        src={item.url}
                        alt={`preview-thumb-${idx}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                        unoptimized={item.url.startsWith("http")}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/image/logo_white.jpeg"; }}
                      />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {previewImages.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showNextPreview();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 text-2xl font-bold text-gray-900 shadow hover:bg-white"
              aria-label="รูปถัดไป"
            >
              ›
            </button>
          )}
        </div>
      )}
    </>
  );
}
