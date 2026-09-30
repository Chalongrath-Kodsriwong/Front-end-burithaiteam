"use client";

/**
 * ตารางไฟล์ดาวน์โหลดของสินค้า — RCG / Software Config / Document
 *
 * ข้อมูลมาพร้อม product จาก `GET /api/products/:id` (field `downloads`)
 * ถ้าสินค้าตัวไหนยังไม่มีไฟล์เลย ทั้งตารางจะไม่ขึ้น ไม่ใช่โชว์ตารางว่าง
 * และหัวข้อที่ยังไม่ได้อัปไฟล์ไว้ก็จะถูกซ่อน — โชว์เฉพาะคอลัมน์ที่มีไฟล์จริง
 */
export type DownloadItem = {
  id: number;
  kind: string;              // "rcg" | "software" | "document"
  label: string | null;      // ข้อความบนปุ่ม เช่น "MRV-412"
  url: string;
};

type Props = { downloads?: DownloadItem[] | null };

const COLUMNS = [
  {
    kind: "rcg",
    title: "RCG",
    subtitle: "Receiver Card Generic",
    note: "ไฟล์ตั้งค่าการ์ดรับสัญญาณ",
  },
  {
    kind: "software",
    title: "Software Config",
    subtitle: "โปรแกรมตั้งค่า",
    note: "โปรแกรมสำหรับตั้งค่าจอ",
  },
  {
    kind: "document",
    title: "Document",
    subtitle: "คู่มือ / สเปก (PDF)",
    note: "เอกสารประกอบสินค้า",
  },
] as const;

function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
      aria-hidden="true"
    >
      <path d="M12 3v12M7 11l5 5 5-5M4 20h16" />
    </svg>
  );
}

export default function ProductDownloads({ downloads }: Props) {
  const items = Array.isArray(downloads) ? downloads : [];
  if (items.length === 0) return null;

  // โชว์เฉพาะหัวข้อที่มีไฟล์ — หัวข้อว่างซ่อนทั้งคอลัมน์ ไม่ขึ้น "ยังไม่มีไฟล์"
  const groups = COLUMNS.map((col) => ({
    ...col,
    files: items.filter((d) => (d.kind ?? "").toLowerCase() === col.kind),
  })).filter((g) => g.files.length > 0);

  if (groups.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center gap-3">
        <h3 className="text-sm font-black tracking-wide text-[#E8F0F8]">
          ไฟล์ดาวน์โหลด
        </h3>
        <div className="h-px flex-1 bg-gradient-to-r from-[rgba(0,207,255,0.35)] to-transparent" />
      </div>

      <div className="download-table" data-cols={groups.length}>
        {groups.map((g) => (
          <div key={g.kind} className="download-cell">
            <div className="download-cell__head">
              <span className="download-cell__title">{g.title}</span>
              <span className="download-cell__sub">{g.subtitle}</span>
            </div>

            <div className="mt-3 flex flex-col items-center gap-2">
              {g.files.map((f) => (
                  <a
                    key={f.id}
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="btn-download"
                  >
                    <span className="flex flex-col items-start leading-tight">
                      {f.label && (
                        <span className="text-[10px] font-bold opacity-80">
                          {f.label}
                        </span>
                      )}
                      <span>Download</span>
                    </span>
                    <DownloadIcon />
                  </a>
              ))}
            </div>

            <p className="mt-2 text-[10px] text-[#3A5A78]">{g.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
