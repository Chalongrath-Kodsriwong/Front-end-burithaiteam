"use client";

const services = [
  {
    icon: "🖥️",
    title: "จำหน่ายอุปกรณ์จอ LED",
    subtitle: "LED Display Equipment",
    items: [
      "จอ LED Module ทุกประเภท (Indoor/Outdoor)",
      "Video Processor, Sender Card, Receiver Card",
      "Switching Power Supply",
      "คอมพิวเตอร์ควบคุมสำหรับงานจอ LED",
    ],
  },
  {
    icon: "🔧",
    title: "ออกแบบและติดตั้งครบวงจร",
    subtitle: "Design & Installation",
    items: [
      "ออกแบบและวางแผนการแสดงผลให้เหมาะกับพื้นที่",
      "ติดตั้งโดยทีมช่างผู้เชี่ยวชาญ",
      "รับประกันงานติดตั้งและบริการหลังการขาย",
    ],
  },
  {
    icon: "💬",
    title: "ให้คำปรึกษาฟรี",
    subtitle: "Free Consultation",
    items: [
      "วิเคราะห์ความต้องการของลูกค้า",
      "แนะนำโซลูชันที่เหมาะสมกับการใช้งาน",
      "ไม่มีค่าใช้จ่ายในการให้คำปรึกษา",
    ],
  },
  {
    icon: "🎪",
    title: "บริการงาน Event & เช่าจอ LED",
    subtitle: "Event & LED Rental",
    items: [
      "ให้เช่าจอ LED สำหรับงานทุกประเภท",
      "คอนเสิร์ต, งานประชุม, งานแสดงสินค้า",
      "ครอบคลุมทั่วประเทศไทยและประเทศใกล้เคียง",
    ],
  },
  {
    icon: "🛡️",
    title: "รับประกันและบริการหลังการขาย",
    subtitle: "Warranty & After-Sales",
    items: [
      "รับประกันสินค้าและงานติดตั้งตามเงื่อนไข",
      "ทีมช่างเทคนิคพร้อมให้บริการ",
      "ตรวจสอบและซ่อมบำรุงอย่างรวดเร็ว",
    ],
  },
];

export default function Ourservice() {
  return (
    <div className="container mx-auto px-4 py-8 my-4">
      {/* Section Header */}
      <div className="mb-10 sm:mb-14">
        <span className="section-eyebrow-led mb-4 justify-start">What We Do</span>
        <h2 className="section-heading mt-3 mb-2">บริการของเรา</h2>
        <p className="text-sm text-[#5A7A98] mt-2 max-w-md">
          ครบวงจรทุกความต้องการด้านจอ LED ตั้งแต่จัดจำหน่ายจนถึงติดตั้งและดูแลหลังการขาย
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {services.map((s, i) => (
          <div key={i} className="card-service p-5 sm:p-6 flex flex-col gap-4">
            {/* Header row: icon + titles */}
            <div className="flex items-start gap-4">
              <div className="icon-circle-gold">{s.icon}</div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#00CFFF] mb-0.5">
                  {s.subtitle}
                </p>
                <h3 className="font-bold text-sm sm:text-base text-[#E8F0F8] leading-snug">
                  {s.title}
                </h3>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-[rgba(0,207,255,0.3)] to-transparent" />

            {/* Items */}
            <ul className="space-y-2 flex-1">
              {s.items.map((item, j) => (
                <li key={j} className="flex items-start gap-2.5 text-sm text-[#5A7A98] leading-relaxed">
                  <span className="text-[#00CFFF] mt-0.5 shrink-0 text-xs font-bold">▸</span>
                  <span className="transition-colors">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
