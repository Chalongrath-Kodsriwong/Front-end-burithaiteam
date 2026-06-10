"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function DetailOfSummaryProduct() {
  const searchParams = useSearchParams();
  const itemsParam = searchParams.get("items");
  const selectedItems = itemsParam ? JSON.parse(itemsParam) : [];

  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (selectedItems.length === 0) return;
    setProducts(selectedItems);
  }, []);

  if (products.length === 0)
    return <p className="text-[#5A7A98] text-center mt-6">ไม่พบสินค้า</p>;

  return (
    <div className="bg-[rgba(6,8,14,0.95)] border border-[rgba(0,207,255,0.1)] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[rgba(0,207,255,0.08)]">
        <span className="text-xs font-bold tracking-widest text-[#00CFFF] uppercase">สรุปรายการสินค้า</span>
      </div>

      <div className="divide-y divide-[rgba(0,207,255,0.06)]">
        {products.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <img
              src={p.avatar}
              className="w-14 h-14 rounded-lg object-cover border border-[rgba(0,207,255,0.1)] shrink-0 bg-[rgba(0,207,255,0.03)]"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#C8D8E8] font-medium leading-snug line-clamp-2">{p.name}</p>
              <p className="text-xs text-[#5A7A98] mt-0.5">{p.quantity} ชิ้น</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-sm font-bold text-[#D4AF37]">
                ฿{Number(p.price).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
