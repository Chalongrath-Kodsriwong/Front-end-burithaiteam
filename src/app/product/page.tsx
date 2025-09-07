"use client";
import "flowbite";
import { useEffect, useState } from "react";

import { AiOutlineAppstore, AiOutlineMenu } from "react-icons/ai";

import TopicMenu from "./section_product/Topic_Menu";
import FilterProduct from "./section_product/FilterOfProduct";
import Productdisplay from "./section_product/Productdisplay";

export default function Product() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="container mx-auto px-0 py-2 my-2 rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-6">Product</h1>
      {isClient && (
        <>
          <div className="grid grid-cols-8 gap-1">
            {/* ฝั่งซ้าย Topic */}
              <TopicMenu />

            {/* ฝั่งขวา All / menu / Category */}
            <div className="col-span-7 space-y-1">
                <FilterProduct />

              {/* <div className="outline outline-1 outline-gray-500 rounded p-2">
                <h3>Category</h3>
                <div></div>
              </div> */}
                <Productdisplay />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
