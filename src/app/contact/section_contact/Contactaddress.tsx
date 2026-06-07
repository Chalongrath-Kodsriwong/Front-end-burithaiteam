"use client";
import "flowbite";
import { MapPin, Mail, Phone } from "lucide-react";

export default function ContactAddress() {
  return (
    <div className="container mx-auto px-0 p-2 mt-6">
      <h2 className="text-2xl font-bold text-gray-100 mb-6 section-title">ที่อยู่ติดต่อ</h2>

      <div className="space-y-6">
        <div className="flex items-start gap-4 text-gray-300 group">
          <MapPin className="w-6 h-6 text-yellow-500 shrink-0 mt-0.5" />
          <p className="text-base leading-relaxed">
            หมู่บ้าน นราอิลิแกนซ์ 300/81 ซอย 3, หมู่ 5 ต.บ้านกรด อ.บางปะอิน
            จ.พระนครศรีอยุธยา 13160 Thailand
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Mail className="w-6 h-6 text-yellow-500 shrink-0" />
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=burithiateamstore.info@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-yellow-400 transition-colors duration-200 text-base"
          >
            burithiateamstore.info@gmail.com
          </a>
        </div>

        <div className="flex items-center gap-4">
          <Phone className="w-6 h-6 text-yellow-500 shrink-0" />
          <a
            href="tel:+66873683548"
            className="text-gray-300 hover:text-yellow-400 transition-colors duration-200 text-base"
          >
            +66 087-368-3548
          </a>
        </div>
      </div>
    </div>
  );
}
