"use client";
import "flowbite";
import React from "react";

export default function DetailOfProductFull({ product }: any) {
  const extractPriceRange = (product: any) => {
    if (!product?.variants) return "0";

    const allPrices = product.variants.flatMap((variant: any) =>
      variant.inventories.map((inv: any) => Number(inv.price))
    );

    const prices = allPrices.filter((x: number) => !isNaN(x));

    if (prices.length === 0) return "0";
    if (prices.length === 1) return prices[0].toLocaleString();

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return `${min.toLocaleString()} - ${max.toLocaleString()}`;
  };

  const priceText = extractPriceRange(product);

  const category = product.category?.name ?? "-";
  const description = product.description ?? "ไม่มีรายละเอียดสินค้า";
  const pdfAsset = Array.isArray(product?.images)
    ? product.images.find((img: any) => img?.type === "pdf" && img?.url)
    : null;

  const handleDownloadPdf = async () => {
    if (!pdfAsset?.url) return;

    const fileName = `${product?.name || "product"}-document.pdf`;

    try {
      const response = await fetch(pdfAsset.url);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback to direct open/download when CORS blocks blob fetch.
      const directLink = document.createElement("a");
      directLink.href = pdfAsset.url;
      directLink.target = "_blank";
      directLink.rel = "noopener noreferrer";
      directLink.download = fileName;
      document.body.appendChild(directLink);
      directLink.click();
      directLink.remove();
    }
  };

  return (
    <div className="p-3 sm:p-4 bg-white rounded shadow">
      <div className="flex gap-3 sm:gap-5 items-center justify-center">
        <h3 className="text-lg sm:text-xl font-bold mb-2">รายละเอียดสินค้า</h3>
        {/* <span className="text-gray-600 text-sm">หมวดหมู่: {category}</span> */}
      </div>
      <p className="text-sm sm:text-base text-gray-700 mb-3 break-words">{description}</p>
      {pdfAsset?.url && (
        <button
          type="button"
          onClick={handleDownloadPdf}
          className="inline-flex items-center rounded bg-black px-4 py-2 text-sm font-semibold text-yellow-500 hover:bg-gray-900"
        >
          ดาวน์โหลดไฟล์ PDF
        </button>
      )}
      {/* <p className="text-gray-600">ราคา: ฿ {priceText}</p> */}
    </div>
  );
}
