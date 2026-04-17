"use client";
import "flowbite";
import React from "react";

type ProductSpecTable = {
  firstColumnHeader?: string;
  columnHeaders?: string[];
  rows?: { label?: string; values?: string[] }[];
};

const hasMeaningfulSpecTable = (table?: ProductSpecTable) => {
  if (!table) return false;

  const headers = Array.isArray(table.columnHeaders) ? table.columnHeaders : [];
  const rows = Array.isArray(table.rows) ? table.rows : [];

  if (headers.length === 0 || rows.length === 0) return false;

  const hasHeaderValue = headers.some((header) => `${header ?? ""}`.trim().length > 0);
  const hasRowValue = rows.some((row) => {
    const label = `${row?.label ?? ""}`.trim();
    const values = Array.isArray(row?.values) ? row.values : [];
    return label.length > 0 || values.some((value) => `${value ?? ""}`.trim().length > 0);
  });

  return hasHeaderValue && hasRowValue;
};

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
  const specTable = product?.spec_table as ProductSpecTable | undefined;
  const hasSpecTable = hasMeaningfulSpecTable(specTable);
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
      {hasSpecTable ? (
        <div className="mb-4 overflow-x-auto rounded-md border border-gray-200">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="border border-gray-200 px-4 py-3 text-center font-semibold">
                  {specTable?.firstColumnHeader || "Model"}
                </th>
                {specTable?.columnHeaders?.map((header, index) => (
                  <th
                    key={`spec-header-${index}`}
                    className="border border-gray-200 px-4 py-3 text-center font-semibold"
                  >
                    {header || "-"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {specTable?.rows?.map((row, rowIndex) => (
                <tr
                  key={`spec-row-${rowIndex}`}
                  className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="border border-gray-200 px-4 py-3 text-center text-gray-700">
                    {row.label || "-"}
                  </td>
                  {specTable.columnHeaders?.map((_, columnIndex) => (
                    <td
                      key={`spec-row-${rowIndex}-value-${columnIndex}`}
                      className="border border-gray-200 px-4 py-3 text-center text-gray-600"
                    >
                      {row.values?.[columnIndex] || "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
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
