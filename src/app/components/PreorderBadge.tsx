import { PreorderInfo } from "@/types/Mostseller";

export default function PreorderBadge({ preorder }: { preorder: PreorderInfo }) {
  return (
    <div className="mt-1 space-y-0.5">
      <p className="text-xs text-[#445566] line-through">
        ฿ {preorder.originalPrice.toLocaleString()}
      </p>
      <div className="flex items-center gap-1 flex-wrap">
        <p className="font-bold text-[#D4AF37] text-sm">
          ฿ {preorder.preorderPrice.toLocaleString()}
        </p>
        <span className="text-[9px] font-bold bg-[rgba(212,175,55,0.15)] border border-[rgba(212,175,55,0.35)] text-[#D4AF37] px-1.5 py-0.5 rounded-sm">
          Preorder ลด {preorder.discountPercent}%
        </span>
      </div>
    </div>
  );
}
