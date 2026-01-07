"use client";

import { useState } from "react";

export default function PaymentSelection({ onSelect }: any) {
  const [selected, setSelected] = useState<string | null>(null);

  const paymentMethods = [
    // { id: "cod", label: "ชำระเงินปลายทาง (COD)" },
    { id: "qr", label: "โอนผ่าน QR PromptPay" },
    // { id: "card", label: "บัตรเครดิต / เดบิต" },
  ];

  return (
    <div className="p-4 border-b border-gray-300 shadow-md rounded mt-6">
      <h1 className="text-2xl font-bold mb-4">💳 เลือกวิธีการชำระเงิน</h1>

      <div className="space-y-3">
        {paymentMethods.map((pm) => (
          <label
            key={pm.id}
            className="flex items-center gap-3 border p-3 rounded cursor-pointer hover:bg-gray-50"
          >
            <input
              type="radio"
              name="payment"
              checked={selected === pm.id}
              onChange={() => {
                setSelected(pm.id);
                onSelect(pm.id);
              }}
            />
            <span className="text-lg">{pm.label}</span>
          </label>
        ))}
      </div>

      {selected === null && (
        <p className="text-red-500 mt-2 text-sm">
          กรุณาเลือกวิธีการชำระเงินก่อนดำเนินการต่อ
        </p>
      )}
    </div>
  );
}
