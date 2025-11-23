"use client";
import "flowbite";
import React, { useState } from "react";

export default function ImageProduct({ product }: any) {
  if (!product) return <div>กำลังโหลดรูปสินค้า...</div>;

  const images =
    product.images?.length > 0
      ? product.images.map((img: any) => img.url)
      : [product.avatar ?? "/image/logo_white.jpeg"];

  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <div className="flex flex-col items-center">
      <img
        src={selectedImage}
        alt={product.name}
        onError={(e) => (e.currentTarget.src = "/image/logo_white.jpeg")}
        className="w-full h-[350px] object-cover rounded-lg shadow mb-4"
      />
      <div className="flex gap-2 justify-center">
        {images.map((img: string, idx: number) => (
          <img
            key={idx}
            src={img}
            alt={`thumb-${idx}`}
            onClick={() => setSelectedImage(img)}
            className={`w-20 h-20 object-cover rounded cursor-pointer border ${
              selectedImage === img ? "border-blue-500" : "border-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
