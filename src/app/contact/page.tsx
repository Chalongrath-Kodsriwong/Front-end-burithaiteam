"use client";

import ContactForm from "./section_contact/Contactform";
import ContactAddress from "./section_contact/Contactaddress";
import Map from "./section_contact/Map";

export default function ContactPage() {
  return (
    <div className="container px-4 mx-auto py-8 max-w-5xl">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-100 section-title center">ติดต่อเรา</h1>
        <p className="text-gray-400 text-sm mt-5">ยินดีให้คำปรึกษาฟรี — ติดต่อเราได้ทุกช่องทาง</p>
      </div>
      <div className="flex flex-col md:flex-row gap-8 w-full">
        <div className="md:w-1/2 flex flex-col gap-2">
          <Map />
          <ContactAddress />
        </div>
        <div className="md:w-1/2">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
