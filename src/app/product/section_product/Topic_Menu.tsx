"use client";
import "flowbite";
import { useEffect, useState } from "react";

export default function TopicMenu() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      {isClient && (
        <div className="col-span-1 grid grid-cols-1 gap-1">
          <div className="outline outline-1 outline-gray-500 rounded p-1 h-full p-3">
            <div className="text-center font-bold text-lg mb-3 border-b-2 border-gray-500 pb-2">
            <h1>Topic</h1>
            </div>
            <div className="space-y-2 mt-2">
              <div>All</div>
              <div>Switching</div>
              <div>Magnet</div>
              <div>Card Sender</div>
              <div>Card Receiver</div>
              <div>Module LED</div>

              <div className="space-y-2 py-3 ">
                <div>
                  <input type="checkbox" className="mr-2"/>
                  มือ 1
                </div>
                <div>
                  <input type="checkbox" className="mr-2"/>
                  มือ 2
                </div>
              </div>

              <div className="space-y-2 mt-5 py-3">
                <div>
                  <h2>ต่ำที่สุด</h2>
                  <input
                    type="text"
                    id="Phonenumber"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1"
                    placeholder="lower price"
                    required
                  />
                </div>
                <div className="border-b-2 border-gray-500 pb-2"></div>
                <div>
                  <h2>สูงสุด</h2>
                  <input
                    type="text"
                    id="Phonenumber"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1"
                    placeholder="upper price"
                    required
                  />
                </div>
                <div className="pt-2 text-center">
                <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center">Submit</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
