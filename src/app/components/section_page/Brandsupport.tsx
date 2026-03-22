"use client";
import "flowbite";

// 🔸 Mock data แบรนด์
const brandList = [
  { name: "Novastar", img: "/image/brandsupport/NovaStar.jpg" },
  { name: "Linsn", img: "/image/brandsupport/Linsn.png" },
  { name: "Colorlight", img: "/image/brandsupport/Colorlight.jpg" },
  { name: "Kystar", img: "/image/brandsupport/Kystar.jpg" },
  { name: "Mooncell", img: "/image/brandsupport/Mooncell.png" },
];

export default function BrandSupport() {
  return (
    <div className="relative container mx-auto px-6 py-16 rounded-[60px] overflow-hidden bg-[#0f172a]">
      
      {/* 🌟 Dark Gold Fade Background */}
      <div
        className="absolute inset-0 pointer-events-none
        bg-[linear-gradient(to_top,_rgba(120,90,20,0.20),_rgba(15,23,42,1)_100%)]"
      ></div>

      <div className="relative z-10 text-yellow-400">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold">Brandsupport</h2>
          <h3 className="text-xl font-semibold mt-2">
            (แบรนด์ที่เราสนับสนุน)
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-10 mx-auto">
          {brandList.map((brand, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center"
            >
              <img
                className="rounded-full w-44 h-44 sm:w-52 sm:h-52 object-cover border-2 border-yellow-500 shadow-lg"
                src={brand.img}
                alt={brand.name}
              />

              <h3 className="mt-5 text-lg sm:text-xl font-semibold">
                {brand.name}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}