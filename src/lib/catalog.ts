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
  /** endpoint รายตัวคืนมาแบบนี้แทน availability/prices */
  variants?: Array<{
    inventories?: Array<{ price?: number; stock?: number; purchase_mode?: string }>;
  }>;
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

/**
 * รูปแรกที่ใช้ได้จริง — ไม่มี is_cover ใน API จึงเอาตัวแรกที่มี url
 *
 * ⚠️ ต้อง encodeURI เสมอ ชื่อไฟล์บน S3 ถูกอัปด้วยชื่อเดิมซึ่งมีภาษาไทย
 * เว้นวรรค และวงเล็บ ถ้าส่ง URL ดิบเข้า Google Merchant จะโดนปฏิเสธทั้งรายการ
 */
export function coverImage(product: CatalogProduct): string | null {
  const img = (product.images ?? []).find((i) => i?.url);
  if (!img?.url) return null;
  // encodeURI ซ้ำไม่ได้ ถ้ามี %XX อยู่แล้วแปลว่าเข้ารหัสมาแล้ว
  return /%[0-9A-Fa-f]{2}/.test(img.url) ? img.url : encodeURI(img.url);
}

/**
 * ดูว่ามีของขายอยู่จริงมั้ย
 *
 * endpoint รายตัว (/api/products/:id) **ไม่มีฟิลด์ availability** มีแต่ตอนดึงเป็นลิสต์
 * ถ้าดูแค่ availability อย่างเดียว หน้าสินค้าจะประกาศกับ Google ว่า "ของหมด"
 * ทั้งที่มีของ ซึ่งแย่กว่าไม่ประกาศอะไรเลย เพราะคนเห็นแล้วไม่กดเข้ามา
 * จึงต้องเผื่อไปนับ stock จาก variants ด้วย
 */
export function stockState(product: CatalogProduct) {
  const a = product.availability;
  if (a?.status === "in_stock" || a?.canBuyNow === true) {
    return { inStock: true, canPreorder: a?.canPreorder === true };
  }

  const inventories = (product.variants ?? []).flatMap((v) => v?.inventories ?? []);

  const inStock = inventories.some((inv) => Number(inv?.stock) > 0);
  const canPreorder =
    a?.canPreorder === true ||
    inventories.some((inv) => String(inv?.purchase_mode ?? "").includes("preorder"));

  return { inStock, canPreorder };
}

export function priceRange(product: CatalogProduct) {
  const direct = (product.prices ?? [])
    .map(Number)
    .filter((n) => Number.isFinite(n) && n > 0);

  // เหตุผลเดียวกับ stockState — endpoint รายตัวไม่มี prices มีแต่ variants
  const fromVariants = (product.variants ?? [])
    .flatMap((v) => v?.inventories ?? [])
    .map((inv) => Number(inv?.price))
    .filter((n) => Number.isFinite(n) && n > 0);

  const prices = direct.length ? direct : fromVariants;

  if (!prices.length) return null;
  return { low: Math.min(...prices), high: Math.max(...prices) };
}
