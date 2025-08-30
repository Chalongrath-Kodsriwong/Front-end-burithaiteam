"use client";
import "flowbite";
import { useEffect, useState } from "react";
// นำเข้าไอคอนจาก react-icons (FontAwesome)
import { FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa';

export default function ContactAddress() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      <div className="container px-0 mx-auto p-2">
        {isClient && (
          <div>
            <h1 className="text-3xl font-bold my-6 ">Get In Touch</h1>
            <div className="space-y-8 text-xl">
              <p className="flex items-center">
                <FaMapMarkerAlt className="w-8 h-auto mr-5" />
                หมู่บ้าน นราอิลิแกนซ์ 300/83 ซอย 3, หมู่ 6 ต.บ้านกรด อ.บางปะอิน จ.พระนครศรีอยุธยา 13160 Thailand
              </p>
              <p className="flex items-center">
                <FaEnvelope className="w-8 h-auto mr-5" />
                BurithaiTeam@gmail.co.th
              </p>
              <p className="flex items-center">
                <FaPhone className="w-8 h-auto mr-5" />
                +66 87-945-5478
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
