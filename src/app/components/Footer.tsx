import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Mail, Phone } from "lucide-react";

const Footer: React.FC = () => (
  <footer className="w-full bg-[#0a0a0a] border-t border-[rgba(212,175,55,0.15)] mt-12">
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* Brand */}
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/image/logo_black-removebg-preview.png"
              alt="BuriThaiTeam Logo"
              width={48}
              height={48}
              className="h-12 w-auto"
            />
            <span className="text-xl font-bold text-yellow-500">BuriThaiTeam</span>
          </Link>
          <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
            ผู้เชี่ยวชาญด้านจอ LED Module อุปกรณ์ควบคุม และงานติดตั้งระบบจอ LED
            คุณภาพสูง ประสบการณ์มากกว่า 20 ปี
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-3">
          <h3 className="text-yellow-500 font-semibold text-sm uppercase tracking-widest mb-1">
            เมนู
          </h3>
          {[
            { label: "หน้าแรก", href: "/" },
            { label: "สินค้า", href: "/product" },
            { label: "เกี่ยวกับเรา", href: "/about" },
            { label: "ติดต่อเรา", href: "/contact" },
            { label: "นโยบายความเป็นส่วนตัว", href: "/privacy" },
          ].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-sm text-gray-400 hover:text-yellow-400 transition-colors duration-200"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-4">
          <h3 className="text-yellow-500 font-semibold text-sm uppercase tracking-widest mb-1">
            ติดต่อ
          </h3>
          <a
            href="tel:+66873683548"
            className="flex items-center gap-3 text-sm text-gray-400 hover:text-yellow-400 transition-colors duration-200"
          >
            <Phone className="w-4 h-4 text-yellow-600 shrink-0" />
            087-368-3548
          </a>
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=burithiateamstore.info@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm text-gray-400 hover:text-yellow-400 transition-colors duration-200"
          >
            <Mail className="w-4 h-4 text-yellow-600 shrink-0" />
            burithiateamstore.info@gmail.com
          </a>
          <p className="flex items-start gap-3 text-sm text-gray-400">
            <MapPin className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
            <span>หมู่บ้านนราอิลิแกนซ์ 300/81 ซอย 3 หมู่ 5 ต.บ้านกรด อ.บางปะอิน จ.พระนครศรีอยุธยา 13160</span>
          </p>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-[rgba(212,175,55,0.1)] flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-gray-600">
          © {new Date().getFullYear()} BuriThaiTeam Store. All Rights Reserved.
        </p>
        <div className="flex gap-5">
          <Link href="/privacy" className="text-xs text-gray-600 hover:text-yellow-500 transition-colors">Privacy Policy</Link>
          <Link href="/licensing" className="text-xs text-gray-600 hover:text-yellow-500 transition-colors">Licensing</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
