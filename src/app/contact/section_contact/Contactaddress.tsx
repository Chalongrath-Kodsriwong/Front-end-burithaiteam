"use client";
import "flowbite";
import { FaMapMarkerAlt, FaEnvelope, FaPhone } from "react-icons/fa";

export default function ContactAddress() {
  return (
    <div className="container mx-auto px-0 p-2">
      <div>
        <h1 className="my-6 text-3xl font-bold">ที่อยู่ติดต่อ</h1>

        <div className="space-y-8 text-xl">
          <p className="flex items-center">
            <FaMapMarkerAlt className="mr-5 h-auto w-8" />
            หมู่บ้าน นราอิลิแกนซ์ 300/81 ซอย 3, หมู่ 5 ต.บ้านกรด อ.บางปะอิน
            จ.พระนครศรีอยุธยา 13160 Thailand
          </p>

          <p className="flex items-center gap-2">
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=burithiateamstore.info@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center whitespace-nowrap hover:underline"
            >
              <FaEnvelope className="mr-5 h-auto w-8" />
              <span>burithiateamstore.info@gmail.com</span>
            </a>
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=burithiateamstore.info@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap text-sm text-gray-500 hover:text-gray-700 hover:underline"
            >
              (ส่งข้อความกดที่นี่)
            </a>
          </p>

          <p className="flex items-center gap-2">
            <a
              href="tel:+66873683548"
              className="inline-flex items-center whitespace-nowrap underline-offset-4 hover:underline"
            >
              <FaPhone className="mr-5 h-auto w-8" />
              <span>+66 087-368-3548</span>
            </a>
            <a
              href="tel:+66873683548"
              className="whitespace-nowrap text-sm text-gray-500 hover:text-gray-700 hover:underline"
            >
              (กดเพื่อโทร)
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
