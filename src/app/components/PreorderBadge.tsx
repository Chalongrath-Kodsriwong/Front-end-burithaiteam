import { PreorderInfo } from "@/types/Mostseller";

export default function PreorderBadge({ preorder }: { preorder: PreorderInfo }) {
  return (
    <div className="mt-1 space-y-0.5">
      <p className="text-xs text-[#445566] line-through">
        ฿ {preorder.originalPrice.toLocaleString()}
      </p>
      <div className="flex items-center gap-1.5 flex-wrap">
        <p className="font-bold text-[#D4AF37] text-sm md:text-base">
          ฿ {preorder.preorderPrice.toLocaleString()}
        </p>
        <span className="text-[11px] md:text-xs font-bold bg-[rgba(212,175,55,0.2)] border border-[rgba(212,175,55,0.6)] text-[#F5CC40] px-2 py-0.5 rounded-sm shadow-[0_0_6px_rgba(212,175,55,0.3)]">
          ลด {preorder.discountPercent}%
        </span>
      </div>
    </div>
  );
}
