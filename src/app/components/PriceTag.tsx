"use client";

import { PreorderInfo } from "@/types/Mostseller";

type Props = {
  prices?: number[];          // ราคาปกติ (raw)
  finalPrices?: number[];     // ราคาหลัง campaign discount
  preorder?: PreorderInfo | null;
  size?: "sm" | "md" | "lg";
};

function minOf(arr: number[]) {
  return arr.length > 0 ? Math.min(...arr) : null;
}

function fmt(n: number) {
  return `฿ ${Math.round(n).toLocaleString()}`;
}

export default function PriceTag({ prices = [], finalPrices = [], preorder, size = "md" }: Props) {
  const validPrices = prices.filter((n) => Number.isFinite(n) && n > 0);
  const validFinal = finalPrices.filter((n) => Number.isFinite(n) && n > 0);

  const minOriginal = minOf(validPrices);
  const minCampaign = minOf(validFinal.length > 0 ? validFinal : []);
  const preorderPrice = preorder?.preorderPrice ?? null;
  const preorderPct = preorder?.discountPercent ?? 0;

  // Option C: เลือกราคาต่ำสุดที่เป็นไปได้
  let bestPrice: number | null = null;
  let label: "preorder" | "discount" | null = null;
  let strikePrice: number | null = null;

  const regularBest = minCampaign ?? minOriginal;

  if (regularBest !== null && preorderPrice !== null) {
    if (preorderPrice < regularBest) {
      bestPrice = preorderPrice;
      label = "preorder";
      strikePrice = minOriginal ?? null;
    } else {
      bestPrice = regularBest;
      label = minCampaign ? "discount" : null;
      strikePrice = minCampaign && minOriginal ? minOriginal : null;
    }
  } else if (preorderPrice !== null) {
    bestPrice = preorderPrice;
    label = "preorder";
    strikePrice = minOriginal ?? null;
  } else if (regularBest !== null) {
    bestPrice = regularBest;
    label = minCampaign ? "discount" : null;
    strikePrice = minCampaign && minOriginal ? minOriginal : null;
  }

  const isMultiPrice = validPrices.length > 1;
  const maxOriginal = validPrices.length > 0 ? Math.max(...validPrices) : null;

  const textSm = size === "sm" ? "text-[10px]" : size === "lg" ? "text-sm sm:text-base" : "text-xs sm:text-sm";
  const textXs = size === "sm" ? "text-[9px]" : size === "lg" ? "text-xs sm:text-sm" : "text-[10px] sm:text-xs";

  if (bestPrice === null) {
    return <p className={`font-bold ${textSm} text-[#D4AF37] mt-1`}>ไม่มีราคา</p>;
  }

  const discountPct = label === "preorder"
    ? preorderPct
    : minOriginal && minCampaign
      ? Math.round((1 - minCampaign / minOriginal) * 100)
      : 0;

  return (
    <div className="mt-1 space-y-0.5">
      {/* ราคาเดิม (strikethrough) */}
      {strikePrice && (
        <p className={`${textXs} text-[#445566] line-through`}>
          {fmt(strikePrice)}
          {isMultiPrice && maxOriginal && maxOriginal !== strikePrice
            ? ` - ${fmt(maxOriginal)}`
            : ""}
        </p>
      )}

      {/* ราคา best + badge */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <p className={`font-bold ${textSm} text-[#D4AF37]`}>
          {fmt(bestPrice)}
          {/* ถ้า multi-price และไม่มี discount แสดง range */}
          {!strikePrice && isMultiPrice && maxOriginal && maxOriginal !== bestPrice
            ? ` - ${fmt(maxOriginal)}`
            : ""}
        </p>

        {discountPct > 0 && (
          <span className={`${textXs} font-bold bg-[rgba(212,175,55,0.2)] border border-[rgba(212,175,55,0.6)] text-[#F5CC40] px-1.5 py-0.5 rounded-sm shadow-[0_0_6px_rgba(212,175,55,0.3)]`}>
            ลด {discountPct}%
          </span>
        )}
        {label === "preorder" && discountPct === 0 && (
          <span className={`${textXs} font-bold bg-[rgba(212,175,55,0.2)] border border-[rgba(212,175,55,0.6)] text-[#F5CC40] px-1.5 py-0.5 rounded-sm`}>
            Preorder
          </span>
        )}
      </div>
    </div>
  );
}
