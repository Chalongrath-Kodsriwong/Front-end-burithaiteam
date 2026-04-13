import React from "react";

export default function LicensingPage() {
  return (
    <div className="w-full bg-gray-100 px-4 py-8 md:py-10">
      <div className="mx-auto max-w-4xl rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-8">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
          เงื่อนไขการใช้งานและลิขสิทธิ์
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          อัปเดตล่าสุด: 13 เมษายน 2026
        </p>

        <div className="mt-6 space-y-5 text-sm leading-7 text-gray-700 md:text-base">
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              1. สิทธิในเนื้อหาเว็บไซต์
            </h2>
            <p>
              เนื้อหาบนเว็บไซต์นี้ เช่น ข้อความ รูปภาพ
              และองค์ประกอบที่เกี่ยวข้องกับแบรนด์ ถือเป็นทรัพย์สินทางปัญญาของผู้ให้บริการ
              หรือเจ้าของสิทธิ์ที่เกี่ยวข้อง
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              2. การใช้งานที่อนุญาต
            </h2>
            <p>
              ผู้ใช้งานสามารถใช้งานเว็บไซต์เพื่อการเข้าชมข้อมูล
              และการใช้งานตามวัตถุประสงค์ปกติของระบบได้
              โดยไม่กระทำการที่ละเมิดสิทธิ์หรือสร้างความเสียหายต่อระบบ
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              3. ซอฟต์แวร์หรือบริการจากบุคคลที่สาม
            </h2>
            <p>
              เว็บไซต์อาจมีการใช้งานเครื่องมือหรือไลบรารีจากบุคคลที่สาม
              ซึ่งเป็นไปตามเงื่อนไขลิขสิทธิ์ของเจ้าของซอฟต์แวร์นั้นๆ
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              4. เอกสารและไฟล์ประกอบสินค้า
            </h2>
            <p>
              เอกสารประกอบสินค้าและไฟล์ดาวน์โหลดมีไว้เพื่อการใช้งานตามวัตถุประสงค์ของลูกค้า
              ไม่อนุญาตให้นำไปใช้ในทางที่ผิดกฎหมาย หรือละเมิดสิทธิ์ของเจ้าของข้อมูล
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              5. การติดต่อเกี่ยวกับสิทธิ์การใช้งาน
            </h2>
            <p>
              หากต้องการสอบถามเกี่ยวกับสิทธิ์การใช้งานหรือการอนุญาตเพิ่มเติม
              กรุณาติดต่อผ่านหน้า Contact ของเว็บไซต์
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
