/**
 * ดึงรายการสินค้าจาก backend สำหรับงานฝั่งเซิร์ฟเวอร์ (sitemap / feed สินค้า)
 *
 * ใช้ endpoint สาธารณะตัวเดียวกับที่หน้าเว็บใช้ จึงได้การกรอง is_published
 * มาให้ฟรี — สินค้าที่ปิดการแสดงผลจะไม่หลุดไปอยู่ใน Google
 */

export const SITE_URL = "https://burithaiteam.com";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:5001";

export type CatalogImage = { url?: string; type?: string };

export type CatalogProduct = {
  id_products: number;
  name?: string;
  short_description?: string;
  description?: string;
  brand?: string | null;
  prices?: number[];
  images?: CatalogImage[];
  category?: { name?: string } | null;
  availability?: { status?: string; canBuyNow?: boolean; canPreorder?: boolean } | null;
};

export async function fetchPublishedProducts(): Promise<CatalogProduct[]> {
  try {
    const res = await fetch(`${BACKEND_API_URL}/api/products`, {
      // ขอใหม่ทุกชั่วโมงก็พอ — Google ไม่ได้มาบ่อยกว่านั้น และกัน backend โดนยิงรัว
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];

    const json = await res.json();
    return Array.isArray(json?.data) ? json.data : [];
  } catch (error) {
    // ล้มเหลวแล้วคืนลิสต์ว่าง ดีกว่าโยน error ให้ sitemap พังทั้งหน้า
    console.error("fetchPublishedProducts failed:", error);
    return [];
  }
}

export function productUrl(id: number) {
  return `${SITE_URL}/detail_product/${id}`;
}

/** รูปแรกที่ใช้ได้จริง — ไม่มี is_cover ใน API จึงเอาตัวแรกที่มี url */
export function coverImage(product: CatalogProduct): string | null {
  const img = (product.images ?? []).find((i) => i?.url);
  return img?.url ?? null;
}

export function priceRange(product: CatalogProduct) {
  const prices = (product.prices ?? [])
    .map(Number)
    .filter((n) => Number.isFinite(n) && n > 0);

  if (!prices.length) return null;
  return { low: Math.min(...prices), high: Math.max(...prices) };
}
