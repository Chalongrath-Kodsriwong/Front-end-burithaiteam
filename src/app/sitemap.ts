import type { MetadataRoute } from "next";
import { SITE_URL, fetchPublishedProducts, productUrl } from "@/lib/catalog";

/**
 * แผนผังเว็บ — สร้างจากสินค้าจริงในฐานข้อมูลทุกครั้ง
 *
 * ก่อนหน้านี้ robots.txt ชี้มาที่ /sitemap.xml แต่ไม่มีไฟล์อยู่จริง (404)
 * Google จึงต้องเดินคลำหาหน้าสินค้าเอง ซึ่งเก็บได้ไม่ครบ
 *
 * ทำเป็นไฟล์ที่สร้างอัตโนมัติ ไม่ใช่ไฟล์นิ่ง เพราะสินค้าเพิ่ม/ลบจากหน้า
 * management ตลอด ถ้าต้องมาแก้มือทุกครั้งเดี๋ยวก็ลืม แล้วมันจะค่อยๆ เก่าไปเงียบๆ
 */
export const revalidate = 3600;

// หน้าที่มีเนื้อหาให้คนทั่วไปอ่าน — หน้าล็อกอิน/ตะกร้า/ประวัติการสั่งซื้อไม่ใส่
// เพราะเป็นหน้าส่วนตัว ไม่มีประโยชน์ในผลค้นหา และบางหน้าต้องล็อกอินก่อน
const STATIC_PATHS: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
  { path: "/", priority: 1.0, changeFrequency: "daily" },
  { path: "/product", priority: 0.9, changeFrequency: "daily" },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
  { path: "/check_order", priority: 0.4, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/licensing", priority: 0.2, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries = STATIC_PATHS.map((entry) => ({
    url: `${SITE_URL}${entry.path}`,
    lastModified: now,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));

  const products = await fetchPublishedProducts();

  const productEntries = products
    .filter((p) => Number.isFinite(Number(p?.id_products)))
    .map((p) => ({
      url: productUrl(p.id_products),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  return [...staticEntries, ...productEntries];
}
