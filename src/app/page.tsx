"use client";
// import TopNavbar from "./components/Topnarbar";
// import Image from "next/image";
import "flowbite";
import { useEffect, useState } from 'react';
import { BookmarkIcon } from "@heroicons/react/24/solid";

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
              <div
                id="default-carousel"
                className="relative w-full max-w-10xl mx-auto"
                data-carousel="slide"
              >
                {/* Carousel wrapper */}
                <div className="relative h-56 overflow-hidden rounded-lg md:h-96">
                  {/* Item 1 - ACTIVE */}
                  <div
                    className="duration-700 ease-in-out"
                    data-carousel-item="active"
                  >
                    <img
                      src="/image/logo_black.jpg"
                      className="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
                      alt="Logo Black"
                    />
                  </div>
                  {/* Item 2 */}
                  <div className="duration-700 ease-in-out" data-carousel-item>
                    <img
                      src="/image/logo_white.jpeg"
                      className="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
                      alt="Logo White"
                    />
                  </div>
                  {/* Item 3 */}
                  <div className="duration-700 ease-in-out" data-carousel-item>
                    <img
                      src="/image/logo_black.jpg"
                      className="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
                      alt="Logo Black 2"
                    />
                  </div>
                  {/* Item 4 */}
                  <div className="duration-700 ease-in-out" data-carousel-item>
                    <img
                      src="/image/logo_white.jpeg"
                      className="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
                      alt="Logo White 2"
                    />
                  </div>
                  {/* Item 5 */}
                  <div className="duration-700 ease-in-out" data-carousel-item>
                    <img
                      src="/image/logo_black.jpg"
                      className="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
                      alt="Logo Black 3"
                    />
                  </div>
                </div>

                {/* Slider indicators */}
                <div className="absolute z-30 flex -translate-x-1/2 bottom-5 left-1/2 space-x-3 rtl:space-x-reverse">
                  {[...Array(5)].map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      className="w-3 h-3 rounded-full bg-white"
                      aria-current={i === 0 ? "true" : "false"}
                      aria-label={`Slide ${i + 1}`}
                      data-carousel-slide-to={i}
                    ></button>
                  ))}
                </div>

                {/* Slider controls */}
                <button
                  type="button"
                  className="absolute top-0 start-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
                  data-carousel-prev
                >
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black/30">
                    <svg
                      className="w-4 h-4 text-white"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 6 10"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 1 1 5l4 4"
                      />
                    </svg>
                    <span className="sr-only">Previous</span>
                  </span>
                </button>
                <button
                  type="button"
                  className="absolute top-0 end-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
                  data-carousel-next
                >
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black/30">
                    <svg
                      className="w-4 h-4 text-white"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 6 10"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m1 9 4-4-4-4"
                      />
                    </svg>
                    <span className="sr-only">Next</span>
                  </span>
                </button>
              </div>
            </section>

            <section className="NewProducts">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <div className="relative w-14 h-14">
                    <BookmarkIcon className="w-20 h-16 text-red-600 rotate-[4.70rad]" />
                    <span className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold ml-4">
                      New
                    </span>
                  </div>
                  <p>สินค้ามาใหม่</p>
                </h2>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  <div className="p-4 border rounded">
                    <h3 className="font-semibold">Product 1</h3>
                    <p className="text-sm text-gray-600">
                      Description of Product 1
                    </p>
                  </div>
                  <div className="p-4 border rounded">
                    <h3 className="font-semibold">Product 2</h3>
                    <p className="text-sm text-gray-600">
                      Description of Product 2
                    </p>
                  </div>
                  <div className="p-4 border rounded">
                    <h3 className="font-semibold">Product 3</h3>
                    <p className="text-sm text-gray-600">
                      Description of Product 3
                    </p>
                  </div>
                  <div className="p-4 border rounded">
                    <h3 className="font-semibold">Product 4</h3>
                    <p className="text-sm text-gray-600">
                      Description of Product 4
                    </p>
                  </div>
                  <div className="p-4 border rounded">
                    <h3 className="font-semibold">Product 5</h3>
                    <p className="text-sm text-gray-600">
                      Description of Product 5
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <section className="IntroWeb"></section>
          <section className="BrandSupport"></section>
          <section className="Archivement"></section>
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
