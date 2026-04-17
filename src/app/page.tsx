"use client";

import Banner from "./components/section_page/Banner";
import Newproducts from "./components/section_page/Newproduct";
import BrandSupport from "./components/section_page/Brandsupport";
import Achievement from "./components/section_page/Achievement";
import Mostsell from "./components/section_page/Mostsell";
import Normalproducts from "./components/section_page/Normalproducts";

export default function Home() {
  return (
    <div className="container px-0 mx-auto p-2">
      <div>
        <div className="flex flex-col gap-3">
          <section className="Promote ">
            <Banner />
          </section>

          <section className="NewProducts">
            <Newproducts />
          </section>
        </div>

        <section className="BrandSupport py-4">
          <Achievement />
        </section>

        <section className="IntroWeb py-1">
          <Mostsell />
        </section>

        <section className="Achievement py-2">
          <BrandSupport />
        </section>

        <div>
          <section className="Normalproducts">
            <Normalproducts />
          </section>
        </div>
      </div>
    </div>
  );
}
