"use client";
import "flowbite";
import { useState } from "react";

interface Props {
  product: {
    id: string;
    name: string;
    avatar: string;
  };
}

export default function ImageProduct({ product }: Props) {
  const [selectedImage, setSelectedImage] = useState(product.avatar);
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = [
    product.avatar,
    "/image/logo_white.jpeg",
    "/image/logo_black.jpg",
    "/image/logo_black.jpg",
    product.avatar,
    "/image/logo_white.jpeg",
  ];

  const handleImageClick = (imageSrc: string) => {
    setSelectedImage(imageSrc);
  };

  const handleNext = () => {
    if (currentIndex + 3 < images.length) {
      setCurrentIndex(currentIndex + 3);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex - 3 >= 0) {
      setCurrentIndex(currentIndex - 3);
    } else {
      setCurrentIndex(images.length - (images.length % 3 || 3));
    }
  };

  return (
    <div>
      {/* แสดงภาพขนาดใหญ่ */}
      <div className="Show_selected mb-4">
        <img
          src={selectedImage}
          alt="Product Image"
          className="w-full max-w-md h-auto object-cover mx-auto rounded-lg shadow"
        />
      </div>

      {/* ปุ่มเปลี่ยนภาพ */}
      <div className="flex items-center justify-center space-x-4">
        <button
          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50"
          onClick={handlePrev}
        >
          <span>&larr;</span>
        </button>

        {/* แสดงภาพย่อย */}
        <div className="flex space-x-2 overflow-x-auto md:overflow-hidden">
          {images.slice(currentIndex, currentIndex + 3).map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Thumbnail ${index + 1}`}
              className="w-16 h-16 md:w-24 md:h-24 object-cover rounded-lg cursor-pointer border hover:ring-2 ring-blue-400"
              onClick={() => handleImageClick(image)}
            />
          ))}
        </div>

        <button
          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50"
          onClick={handleNext}
        >
          <span>&rarr;</span>
        </button>
      </div>
    </div>
  );
}
