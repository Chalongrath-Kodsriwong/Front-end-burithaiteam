"use client";
import "flowbite";
import { useEffect, useState } from "react";
import { BookmarkIcon } from "@heroicons/react/24/solid";

import Promote from "./components/section_page/Promote";
import Newproducts from "./components/section_page/Newproduct";
import IntroWeb from "./components/section_page/Introweb";
import BrandSupport from "./components/section_page/Brandsupport";


export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  return (
    <>
      <div className="container px-0 mx-auto p-2">
        {isClient && (
          <div>
            <div className="flex flex-col gap-3">
              <section className="Promote ">
                <Promote />
              </section>

              <section className="NewProducts">
                <Newproducts />
              </section>

            </div>
            <section className="IntroWeb pt-4">
              <IntroWeb />
            </section>

            <section className="BrandSupport py-6">
              <BrandSupport />
            </section>

            <section className="Archivement">
              
            </section>

            <div>
              <section className="MostSeller"></section>
              <section className="Normalproducts"></section>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
