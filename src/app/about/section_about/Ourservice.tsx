"use client";
import "flowbite";
import { useEffect, useState } from "react";


export default function Ourservice() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return (
        <div className="container mx-auto px-4 py-6 my-3 bg-gray-100 rounded-lg">
            <h1 className="text-3xl font-bold mb-3">Our Services</h1>
            {isClient && (
                <div className="section_ourservice py-4 px-4 flex flex-wrap justify-center gap-8">
                    {/* Add your service components here */}
                    <div className="bg-gray-50 p-4 rounded-lg shadow-md w-full md:w-[45%] lg:w-[30%]">
                        <p className="text-lg mb-1 font-medium">จำหน่ายอุปกรณ์จอ LED และระบบควบคุมภาพหน้าจอ</p>
                        <ul className="list-disc pl-5">
                            <li>จอ LED Module ทุกประเภท (Indoor/Outdoor)</li>
                            <li>Video Processor, Sender Card, Reciver Card, Switching power supply</li>
                            <li>คอมพิวเตอร์และอุปกรณ์ควบคุมสำหรับงานจอ LED</li>
                        </ul>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg shadow-md w-full md:w-[45%] lg:w-[30%]">
                        <p className="text-lg mb-1 font-medium">ออกแบบระบบและติดตั้งจอ LED แบบครบวงจร</p>
                        <ul className="list-disc pl-5">
                            <li>ให้บริการออกแบบและวางแผนการแสดงผลให้เหมาะสมกับพื้นที่และการใช้งาน</li>
                            <li>ติดตั้งจริงโดยทีมช่างผู้เชี่ยวชาญ พร้อมการรับประกันงานติดตั้งและบริการหลังการขาย</li>
                        </ul>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg shadow-md w-full md:w-[45%] lg:w-[30%]">
                        <p className="text-lg mb-1 font-medium">ให้คำปรึกษาและแนะนำฟรีก่อนการติดตั้ง LED</p>
                        <ul className="list-disc pl-5">
                            <li>วิเคราะห์ความต้องการของลูกค้าเพื่อเสนอแนวทางที่เหมาะสม</li>
                            <li>แนะนำอุปกรณ์และโซลูชันที่เหมาะสมกับการใช้งานกับลูกค้า</li>
                        </ul>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg shadow-md w-full md:w-[45%] lg:w-[30%]">
                        <p className="text-lg mb-1 font-medium">ให้บริการด้านงานอีเวนต์และเช่าจอ LED</p>
                        <ul className="list-disc pl-5">
                            <li>บริกรให้เช่าจอ LED สำหรับงานอีเวนต์ทุกประเภท เช่น คอนเสิร์ต, งานประชุม, งานแสดงสินค้า</li>
                            <li>ให้บริการติดตั้งจอชั่วคราวและถาวร ครอบคลุมพื้นที่ทั่วราชอาณาจักรไทยด้วยทีมงานคุณภาพรวมถึงพื้นที่ประเทศใกล้เคียง</li>
                        </ul>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg shadow-md w-full md:w-[45%] lg:w-[30%]">
                        <p className="text-lg mb-1 font-medium">การรับประกันและบริการหลังการขาย</p>
                        <ul className="list-disc pl-5">
                            <li>รับประกันสินค้าและงานติดตั้งตามเงื่อนไขที่กำหนด</li>
                            <li>ให้บริการพร้อมช่างเทคนิคมากประสบการณ์ตรวจสอบและซ่อมบำรุงด้วยความเร็วรวด</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );

}