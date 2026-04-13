import React from "react";

export default function PrivacyPage() {
  return (
    <div className="w-full bg-gray-100 px-4 py-8 md:py-10">
      <div className="mx-auto max-w-4xl rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-8">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
          นโยบายความเป็นส่วนตัว
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          อัปเดตล่าสุด: 13 เมษายน 2026
        </p>

        <div className="mt-6 space-y-5 text-sm leading-7 text-gray-700 md:text-base">
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              1. ข้อมูลที่เราเก็บ
            </h2>
            <p>
              เราเก็บเฉพาะข้อมูลที่จำเป็นต่อการให้บริการ เช่น ข้อมูลบัญชีผู้ใช้
              ข้อมูลการติดต่อ ข้อมูลการจัดส่ง และข้อมูลที่เกี่ยวข้องกับคำสั่งซื้อ
              เพื่อให้ระบบสามารถทำงานได้อย่างเหมาะสม
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              2. วัตถุประสงค์การใช้ข้อมูล
            </h2>
            <p>
              เราใช้ข้อมูลเพื่อดำเนินการตามคำสั่งซื้อ ติดต่อกลับในกรณีจำเป็น
              ปรับปรุงคุณภาพการให้บริการ และดูแลความปลอดภัยของระบบ
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              3. การเปิดเผยข้อมูล
            </h2>
            <p>
              เราไม่มีนโยบายขายข้อมูลส่วนบุคคลของผู้ใช้งาน
              และจะเปิดเผยข้อมูลเท่าที่จำเป็นต่อการดำเนินงานตามกฎหมายและการให้บริการเท่านั้น
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              4. การเก็บรักษาและความปลอดภัยของข้อมูล
            </h2>
            <p>
              เราเก็บรักษาข้อมูลตามระยะเวลาที่เหมาะสมและจำเป็น
              พร้อมใช้มาตรการด้านเทคนิคและการจัดการที่เหมาะสมเพื่อปกป้องข้อมูล
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              5. คุกกี้ (Cookies)
            </h2>
            <p>
              เว็บไซต์อาจใช้คุกกี้เพื่อการทำงานของระบบ การยืนยันตัวตน
              และการปรับปรุงประสบการณ์การใช้งาน โดยผู้ใช้สามารถจัดการคุกกี้ผ่านเบราว์เซอร์ได้
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              6. สิทธิของผู้ใช้งาน
            </h2>
            <p>
              ผู้ใช้งานสามารถขอเข้าถึง แก้ไข
              หรือขอลบข้อมูลส่วนบุคคลได้ตามเงื่อนไขที่กฎหมายกำหนด
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              7. การติดต่อ
            </h2>
            <p>
              หากมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัว
              สามารถติดต่อผ่านหน้า Contact ของเว็บไซต์
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
