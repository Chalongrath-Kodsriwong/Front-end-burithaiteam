"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchWithTimeout } from "@/app/utils/fetchWithTimeout";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * แผงหมวดหมู่กลาง hero
 *
 * ซ้าย  = ปุ่มวงกลมของแต่ละหมวด (เฉพาะหมวดที่เปิดไว้ในหน้า management)
 * ขวา   = รายละเอียดหมวดที่เลือก — รูปพื้นหลัง + ข้อความโปรโมท + สินค้าในหมวดนั้น
 *
 * ถ้ายังไม่เปิดหมวดไหนเลย ทั้งแผงจะไม่ขึ้น (ไม่ใช่โชว์กล่องว่าง)
 */
type FeaturedCategory = {
  id_category: number;
  name: string | null;
  image_url: string | null;
  home_tagline: string | null;
};

type ProductLite = {
  id_products: number;
  name: string;
  id_category: number;
  images?: { url: string }[];
  prices?: number[];
  bestDiscount?: { finalPrice: number; discountPercent: number } | null;
};

const money = (n: number) => `฿${Math.round(n).toLocaleString()}`;

/** โชว์ทีละ 5 หัวข้อ ไม่ว่าจะเปิดไว้กี่หมวดก็ตาม */
const VISIBLE = 5;

export default function CategoryShowcase() {
  const [categories, setCategories] = useState<FeaturedCategory[]>([]);
  const [products, setProducts] = useState<ProductLite[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [start, setStart] = useState(0);   // ตำแหน่งเริ่มของหน้าต่าง 5 ช่อง
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetchWithTimeout(`${API_URL}/api/category/featured`, { method: "GET", cache: "no-store" }),
          fetchWithTimeout(`${API_URL}/api/products`, { method: "GET", cache: "no-store" }),
        ]);

        const catJson = await catRes.json().catch(() => ({}));
        const prodJson = await prodRes.json().catch(() => ({}));
        if (!alive) return;

        const cats: FeaturedCategory[] = Array.isArray(catJson?.data) ? catJson.data : [];
        setCategories(cats);
        setActiveIdx(0);
        setStart(0);
        setProducts(Array.isArray(prodJson?.data) ? prodJson.data : []);
      } catch {
        /* โหลดไม่ได้ก็ไม่ต้องโชว์ ไม่ต้องรบกวนลูกค้า */
      }
    })();
    return () => { alive = false; };
  }, []);

  const total = categories.length;
  const hasPager = total > VISIBLE;
  const active = categories[activeIdx] ?? null;

  // หน้าต่างที่มองเห็น — วนรอบเมื่อมีมากกว่า 5 หมวด
  const visible = hasPager
    ? Array.from({ length: VISIBLE }, (_, k) => ({
        cat: categories[(start + k) % total],
        idx: (start + k) % total,
      }))
    : categories.map((cat, idx) => ({ cat, idx }));

  const shiftWindow = (dir: 1 | -1) => {
    if (!hasPager) return;
    setStart((s) => (s + dir + total) % total);
  };

  /** เลื่อนหมวดที่กำลังโชว์ไปทีละ 1 แล้วเลื่อนหน้าต่างให้ตามไปด้วย */
  const stepActive = () => {
    setActiveIdx((prev) => {
      const next = (prev + 1) % total;
      if (hasPager) {
        // จัดให้ตัวที่กำลังโชว์อยู่กลางหน้าต่าง จะได้เห็นตัวถัดไปล่วงหน้า
        setStart(((next - Math.floor(VISIBLE / 2)) % total + total) % total);
      }
      return next;
    });
  };

  // เลื่อนอัตโนมัติทุก 5 วินาที — หยุดเมื่อเอาเมาส์ชี้ ไม่งั้นอ่านไม่ทัน
  useEffect(() => {
    if (paused || total <= 1) return;
    const timer = setInterval(stepActive, 5000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, total]);

  // สินค้าในหมวดที่เลือก — สุ่มลำดับทุกครั้งที่สลับหมวด จะได้ไม่เห็นตัวเดิมตลอด
  const picks = useMemo(() => {
    if (!active) return [];
    const inCat = products.filter((p) => p.id_category === active.id_category);
    return [...inCat].sort(() => Math.random() - 0.5).slice(0, 3);
  }, [active, products]);

  if (categories.length === 0) return null;

  return (
    <div
      className="hidden lg:flex w-full items-stretch gap-5 xl:gap-6 py-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── ปุ่มวงกลมเลือกหมวด + ลูกศรเลื่อน ── */}
      <div className="flex flex-col items-center gap-2 pl-1.5 pr-10 shrink-0 cat-orb-rail">
        {hasPager && (
          <button
            type="button"
            onClick={() => shiftWindow(-1)}
            className="cat-nav"
            aria-label="เลื่อนขึ้นดูหมวดก่อนหน้า"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6}
              strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
              <path d="M6 15l6-6 6 6" />
            </svg>
          </button>
        )}

        <div className="flex flex-col gap-3 py-1">
          {visible.map(({ cat, idx }, k) => {
            const isActive = idx === activeIdx;

            // เส้นโค้ง: sin ทำให้ปุ่มกลางๆ ยื่นออกมาทางกรอบมากสุด ปลายบนล่างหุบเข้า
            const span = visible.length - 1;
            const curve = span > 0 ? Math.sin((Math.PI * k) / span) * 34 : 0;

            return (
              <button
                key={`${cat.id_category}-${k}`}
                type="button"
                onClick={() => setActiveIdx(idx)}
                onMouseEnter={() => setActiveIdx(idx)}
                className={`cat-orb ${isActive ? "cat-orb--active" : ""}`}
                style={{ marginLeft: `${curve.toFixed(1)}px` }}
                aria-pressed={isActive}
              >
                <span className="cat-orb__text">{cat.name}</span>
              </button>
            );
          })}
        </div>

        {hasPager && (
          <button
            type="button"
            onClick={() => shiftWindow(1)}
            className="cat-nav"
            aria-label="เลื่อนลงดูหมวดถัดไป"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6}
              strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        )}
      </div>

      {/* ── รายละเอียดหมวดที่เลือก ── */}
      {active && (
        <div key={active.id_category} className="cat-stage">
          {active.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={active.image_url} alt="" aria-hidden="true" className="cat-stage__bg" />
          )}
          <span className="cat-stage__scrim" />

          {/* มุมเฟรมชุดเดียวกับจอ LED ของแบนเนอร์ ให้สองกล่องดูเป็นชุดเดียวกัน */}
          <div className="led-corner-tl" />
          <div className="led-corner-tr" />
          <div className="led-corner-bl" />
          <div className="led-corner-br" />

          <div className="relative z-10 flex h-full flex-col p-6 xl:p-8">
            <span className="mb-2.5 inline-flex w-fit items-center gap-1.5 rounded-sm border border-[rgba(0,207,255,0.35)] bg-[rgba(0,207,255,0.08)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#00CFFF]">
              <span className="led-badge-dot" />
              หมวดสินค้า
            </span>

            <h3 className="cat-stage__title text-2xl xl:text-[2rem] font-black leading-tight text-[#E8F0F8]">
              {active.name}
            </h3>

            {active.home_tagline && (
              <p className="mt-2.5 max-w-[48ch] text-[15px] leading-relaxed text-[#B0CEEA]">
                {active.home_tagline}
              </p>
            )}

            {/* สินค้าในหมวดนี้ */}
            <div className="mt-auto pt-4">
              {picks.length > 0 ? (
                <>
                  <span className="mb-2.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-[#00CFFF]/70">
                    สินค้าในหมวดนี้
                  </span>
                  <div className="grid grid-cols-3 gap-2.5">
                    {picks.map((p) => {
                      const base = p.prices?.[0];
                      const final = p.bestDiscount?.finalPrice ?? base;
                      return (
                        <Link
                          key={p.id_products}
                          href={`/detail_product/${p.id_products}`}
                          className="cat-pick group"
                        >
                          <span className="cat-pick__thumb">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.images?.[0]?.url || "/image/logo_white.jpeg"}
                              alt={p.name}
                              onError={(e) => { e.currentTarget.src = "/image/logo_white.jpeg"; }}
                            />
                          </span>
                          <span className="cat-pick__name">{p.name}</span>
                          {final != null && (
                            <span className="cat-pick__price">{money(final)}</span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="rounded-lg border border-[rgba(0,207,255,0.18)] bg-[rgba(8,9,13,0.6)] px-3 py-3">
                  <p className="text-[12px] font-semibold text-[#B0CEEA]">
                    หมวดนี้รับสั่งทำ / สั่งเข้าตามงาน
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#5A7A98]">
                    แจ้งสเปกที่ต้องการ ทีมงานหาให้และเสนอราคาให้ได้
                  </p>
                </div>
              )}

              <Link
                href={`/product?category=${encodeURIComponent(active.name ?? "")}`}
                className="group/cta mt-4 inline-flex items-center gap-1.5 rounded-sm border border-[rgba(212,175,55,0.5)] bg-[rgba(212,175,55,0.1)] px-4 py-2 text-[13px] font-bold text-[#F5CC40] transition-all duration-300 hover:border-[rgba(212,175,55,0.95)] hover:bg-[rgba(212,175,55,0.18)] hover:shadow-[0_0_14px_rgba(212,175,55,0.3)]"
              >
                ดูสินค้าหมวด {active.name}
                <span aria-hidden="true" className="transition-transform duration-300 group-hover/cta:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
