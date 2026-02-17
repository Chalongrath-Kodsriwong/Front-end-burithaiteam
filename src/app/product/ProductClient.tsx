"use client";
import "flowbite";
import { useEffect, useState } from "react";

import { AiOutlineAppstore, AiOutlineMenu } from "react-icons/ai";

import { useSearchParams } from "next/navigation";

import TopicMenu from "./section_product/Topic_Menu";
import FilterProduct from "./section_product/FilterOfProduct";
import Productdisplay from "./section_product/Productdisplay";

export default function Product() {
  const [isClient, setIsClient] = useState(false);
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "All"; // default = All

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="container mx-auto px-0 py-2 my-2 rounded-lg">
      {isClient && (
        <>
          <div className="grid grid-cols-8 gap-1">
            {/* ฝั่งซ้าย Topic */}
            <TopicMenu />

            {/* ฝั่งขวา All / menu / Category */}
            <div className="col-span-7 space-y-1">
              <FilterProduct category={category} />

              <Productdisplay />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
