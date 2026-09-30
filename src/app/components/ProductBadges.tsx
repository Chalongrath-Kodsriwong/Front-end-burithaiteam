"use client";

/**
 * ป้ายบนรูปสินค้าในการ์ดรายการสินค้า มี 2 กลุ่ม
 *
 * 1) ป้ายลอยมุมขวาบน
 *    - TOP SELLER : สินค้าขายดี — ป้ายสี่เหลี่ยม
 *    - ลดราคา X%  : ป้ายวงกลม (ใช้ % ที่ลดมากที่สุดของสินค้านั้น)
 *
 * 2) ป้ายสถานะกลางรูป (จาก availability ที่ backend คำนวณมา)
 *    - sold_out : ของหมด + ไม่ได้เปิดสั่งจอง → ป้ายเทา รูปเป็นขาวดำ = ซื้อไม่ได้
 *    - preorder : ของหมด + ยังสั่งจองได้    → ป้ายแดง "สินค้าหมด" + แถบทอง "สั่งจองล่วงหน้าได้"
 *                 (บอกทั้งสองอย่างในป้ายเดียว ลูกค้าจะได้รู้ตั้งแต่หน้ารวมว่ายังกดเข้าไปจองได้)
 *
 * การ์ดยังกดเข้า /detail_product/ ได้ทุกกรณี — ป้ายเป็น pointer-events-none
 */
export type Availability = {
  status: "in_stock" | "preorder" | "sold_out";
  canBuyNow?: boolean;
  canPreorder?: boolean;
};

type Props = {
  /** % ส่วนลดที่มากที่สุดของสินค้านั้น (ไม่ลดให้ส่งมา 0 หรือ null) */
  discountPercent?: number | null;
  /** สินค้าขายดีหรือไม่ */
  topSeller?: boolean;
  /** สถานะความพร้อมขาย — ถ้าไม่ส่งมาจะไม่แสดงป้ายสถานะ */
  availability?: Availability | null;
};

export default function ProductBadges({
  discountPercent,
  topSeller = false,
  availability,
}: Props) {
  const pct = Number(discountPercent ?? 0);
  const hasDiscount = Number.isFinite(pct) && pct > 0;

  const status = availability?.status;
  const isSoldOut = status === "sold_out";
  const isPreorder = status === "preorder";

  if (!hasDiscount && !topSeller && !isSoldOut && !isPreorder) return null;

  return (
    <>
      {/* สถานะของหมด — ตราประทับกลางรูป + แถบเต็มความกว้างที่ขอบล่าง
          แถบเต็มความกว้างกินพื้นที่ทั้งใบ อ่านง่ายกว่าป้ายเล็กลอยกลางรูปมาก */}
      {(isSoldOut || isPreorder) && (
        <>
          <div
            className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-2 ${
              isSoldOut ? "product-stock-veil--out" : "product-stock-veil--pre"
            }`}
          >
            <span
              className={`product-stock-stamp ${
                isSoldOut ? "product-stock-stamp--out" : "product-stock-stamp--pre"
              } text-[13px] sm:text-xl md:text-2xl`}
            >
              SOLD OUT
            </span>
          </div>

          {isPreorder ? (
            <div className="product-stock-band product-stock-band--pre pointer-events-none absolute inset-x-0 bottom-0 z-[15] py-1.5 text-[11px] sm:py-2 sm:text-[13px] md:text-sm">
              <span className="product-stock-band__dot" />
              สั่งจองล่วงหน้าได้
            </div>
          ) : (
            <div className="product-stock-band product-stock-band--out pointer-events-none absolute inset-x-0 bottom-0 z-[15] py-1 text-[10px] sm:py-1.5 sm:text-xs md:text-[13px]">
              สินค้าหมดชั่วคราว
            </div>
          )}
        </>
      )}

      {/* ป้ายลอยมุมขวาบน */}
      {(hasDiscount || topSeller) && (
        <div className="pointer-events-none absolute top-1 right-1 sm:top-2 sm:right-2 z-20 flex flex-col items-end gap-1 sm:gap-1.5">
          {topSeller && (
            <div
              className="product-badge product-badge--seller
                px-1.5 py-[3px] text-[6px]
                sm:px-2 sm:py-1 sm:text-[8px]
                md:px-2.5 md:py-1 md:text-[9px]"
              aria-label="สินค้าขายดี"
            >
              TOP&nbsp;SELLER
            </div>
          )}

          {hasDiscount && (
            <div
              className="product-badge product-badge--sale
                w-8 h-8 sm:w-11 sm:h-11 md:w-[52px] md:h-[52px]"
              aria-label={`ลดราคา ${pct}%`}
            >
              <span className="text-[5px] sm:text-[7px] md:text-[8px] leading-[1.05] tracking-wide">
                ลดราคา
              </span>
              <span className="text-[9px] sm:text-[11px] md:text-[13px] leading-none font-extrabold">
                {Math.round(pct)}%
              </span>
            </div>
          )}
        </div>
      )}
    </>
  );
}
