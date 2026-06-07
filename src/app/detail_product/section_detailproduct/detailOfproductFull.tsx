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
  const hasHeaderValue = headers.some((h) => `${h ?? ""}`.trim().length > 0);
  const hasRowValue = rows.some((row) => {
    const label = `${row?.label ?? ""}`.trim();
    const values = Array.isArray(row?.values) ? row.values : [];
    return label.length > 0 || values.some((v) => `${v ?? ""}`.trim().length > 0);
  });
  return hasHeaderValue && hasRowValue;
};

export default function DetailOfProductFull({ product }: any) {
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
    <div className="bg-[rgba(6,8,14,0.95)] border border-[rgba(0,207,255,0.12)] rounded-xl p-5 sm:p-6">

      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="w-1 h-6 rounded-full bg-[#00CFFF] shadow-[0_0_8px_rgba(0,207,255,0.8)]" />
        <h3 className="text-base sm:text-lg font-black text-[#E8F0F8] tracking-wide">
          รายละเอียดสินค้า
        </h3>
      </div>

      {/* Description */}
      <p className="text-sm sm:text-[15px] text-[#7A9AB8] leading-relaxed mb-5 break-words">
        {description}
      </p>

      {/* Spec table */}
      {hasSpecTable && (
        <div className="mb-5 overflow-x-auto rounded-lg border border-[rgba(0,207,255,0.15)]">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[rgba(0,207,255,0.07)] border-b border-[rgba(0,207,255,0.15)]">
                <th className="border-r border-[rgba(0,207,255,0.12)] px-4 py-3 text-center text-[10px] font-black tracking-widest text-[#00CFFF] uppercase">
                  {specTable?.firstColumnHeader || "Model"}
                </th>
                {specTable?.columnHeaders?.map((header, index) => (
                  <th
                    key={`spec-header-${index}`}
                    className="border-r last:border-r-0 border-[rgba(0,207,255,0.12)] px-4 py-3 text-center text-[10px] font-black tracking-widest text-[#00CFFF] uppercase"
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
                  className={`border-b border-[rgba(0,207,255,0.08)] last:border-b-0 transition-colors ${
                    rowIndex % 2 === 0
                      ? "bg-transparent"
                      : "bg-[rgba(0,207,255,0.03)]"
                  }`}
                >
                  <td className="border-r border-[rgba(0,207,255,0.08)] px-4 py-3 text-center text-[#B0CEEA] font-medium text-sm">
                    {row.label || "-"}
                  </td>
                  {specTable.columnHeaders?.map((_, columnIndex) => (
                    <td
                      key={`spec-row-${rowIndex}-value-${columnIndex}`}
                      className="border-r last:border-r-0 border-[rgba(0,207,255,0.08)] px-4 py-3 text-center text-[#7A9AB8] text-sm"
                    >
                      {row.values?.[columnIndex] || "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PDF download */}
      {pdfAsset?.url && (
        <button
          type="button"
          onClick={handleDownloadPdf}
          className="inline-flex items-center gap-2 btn-gold text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          ดาวน์โหลดไฟล์ PDF
        </button>
      )}
    </div>
  );
}
