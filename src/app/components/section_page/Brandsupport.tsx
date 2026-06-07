"use client";

const brandList = [
  { name: "Novastar",   img: "/image/brandsupport/NovaStar.jpg",  desc: "Control Systems" },
  { name: "Linsn",      img: "/image/brandsupport/Linsn.png",     desc: "Sending Cards" },
  { name: "Colorlight", img: "/image/brandsupport/Colorlight.jpg",desc: "LED Controllers" },
  { name: "Kystar",     img: "/image/brandsupport/Kystar.jpg",    desc: "Video Processors" },
  { name: "Mooncell",   img: "/image/brandsupport/Mooncell.png",  desc: "LED Modules" },
];

export default function BrandSupport() {
  return (
    <section className="relative">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-10 sm:mb-14">
        <span className="section-eyebrow-led mb-4">Our Partners</span>
        <h2 className="section-heading mb-3">Brand Support</h2>
        <p className="text-sm text-[#5A7A98]">แบรนด์ชั้นนำระดับโลกที่เราเชี่ยวชาญและให้บริการ</p>
        <div className="gold-dot-sep">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00CFFF] shadow-[0_0_8px_rgba(0,207,255,0.9)]" />
        </div>
      </div>

      {/* Brand cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {brandList.map((brand) => (
          <div key={brand.name} className="brand-card group flex flex-col items-center gap-3 p-4 sm:p-5 cursor-default">
            {/* Corner glow on hover */}
            <div className="absolute inset-0 rounded-[0.875rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500
              bg-[radial-gradient(ellipse_at_top,rgba(0,207,255,0.06)_0%,transparent_70%)]
              pointer-events-none" />

            {/* Logo circle */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-sm overflow-hidden
              ring-2 ring-[rgba(0,207,255,0.15)] group-hover:ring-[rgba(0,207,255,0.7)]
              shadow-[0_4px_16px_rgba(0,0,0,0.6)]
              group-hover:shadow-[0_0_20px_rgba(0,207,255,0.2)]
              transition-all duration-350">
              <img
                src={brand.img}
                alt={brand.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>

            {/* Name + desc */}
            <div className="text-center relative z-10">
              <p className="text-sm sm:text-base font-bold text-[#E8F0F8] group-hover:text-[#00CFFF] transition-colors duration-300 drop-shadow-sm">
                {brand.name}
              </p>
              <p className="text-[10px] sm:text-xs text-[#445566] mt-0.5">{brand.desc}</p>
            </div>

            {/* Bottom sliding cyan line */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-0 group-hover:w-2/3
              bg-gradient-to-r from-transparent via-[rgba(0,207,255,0.7)] to-transparent
              transition-all duration-500 rounded-full" />
          </div>
        ))}
      </div>
    </section>
  );
}
