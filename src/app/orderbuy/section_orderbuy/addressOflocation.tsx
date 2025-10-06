"use client";
import "flowbite";
import { useState } from "react";

export default function AddressLocation() {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(
    "123 ถนนตัวอย่าง แขวงตัวอย่าง เขตตัวอย่าง กรุงเทพฯ 10100"
  );

  const addresses = [
    "123 ถนนตัวอย่าง แขวงตัวอย่าง เขตตัวอย่าง กรุงเทพฯ 10100",
    "456 ถนนสายสอง แขวงสอง เขตสอง กรุงเทพฯ 10200",
    "789 ถนนสายสาม แขวงสาม เขตสาม กรุงเทพฯ 10300",
    "101 ถนนสายสี่ แขวงสี่ เขตสี่ กรุงเทพฯ 10400",
    "202 ถนนสายห้า แขวงห้า เขตห้า กรุงเทพฯ 10500",
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">เลือกที่อยู่การจัดส่ง</h2>
      <div className="border border-gray-300 rounded-md p-4">
        <p className="mb-2">{selectedAddress}</p>
        <div>
          <button
            className="ml-0 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            onClick={() => setShowPopup(true)}
          >
            เปลี่ยนที่อยู่
          </button>
          {showPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-md shadow-md">
                <h3 className="text-lg font-semibold mb-4">เลือกที่อยู่ใหม่</h3>
                <select
                  className="border border-gray-300 rounded-md p-2 w-full mb-4"
                  value={selectedAddress}
                  onChange={(e) => setSelectedAddress(e.target.value)}
                >
                  {addresses.map((address, index) => (
                    <option key={index} value={address}>
                      {address}
                    </option>
                  ))}
                </select>
                {/* <p className="mb-4 text-gray-700">{selectedAddress}</p> */}
                <div className="flex justify-end">
                  <button
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md mr-2 hover:bg-gray-400"
                    onClick={() => setShowPopup(false)}
                  >
                    ยกเลิก
                  </button>
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    onClick={() => setShowPopup(false)}
                  >
                    ยืนยัน
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
