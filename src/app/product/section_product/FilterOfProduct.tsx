"use client";
import "flowbite";
import { useEffect, useState } from "react";

import { AiOutlineAppstore, AiOutlineMenu } from "react-icons/ai";


export default function FilterProduct() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      {isClient && (
        <div className="flex justify-between items-center outline outline-1 outline-gray-500 rounded p-2">
            <h3>All</h3>
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