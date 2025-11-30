"use client";
import "flowbite";
import { useEffect, useState } from "react";

import { AiOutlineAppstore, AiOutlineMenu } from "react-icons/ai";

export default function FilterProduct({ category }: { category: string }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      {isClient && (
        <div className="flex justify-between items-center outline outline-1 outline-gray-500 rounded p-2">
          <div className="flex items-center space-x-2">
            <h3>Selected: </h3>
            <h3 className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-full text-sm text-gray-700 font-medium shadow-sm">
              {category}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <div>
              <select
                id="topic"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                required
              >
                <option value="">Bug Report</option>
                <option value="general">General Inquiry</option>
                <option value="support">Support</option>
                <option value="feedback">Feedback</option>
                <option value="other">Other</option>
              </select>
            </div>
            <AiOutlineAppstore />
            <AiOutlineMenu />
          </div>
        </div>
      )}
    </>
  );
}
