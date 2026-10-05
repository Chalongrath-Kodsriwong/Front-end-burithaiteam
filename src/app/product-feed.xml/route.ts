import {
  SITE_URL,
  coverImage,
  fetchPublishedProducts,
  priceRange,
  productUrl,
  stockState,
} from "@/lib/catalog";

/**
 * ไฟล์ข้อมูลสินค้า (product feed) สำหรับ Google Merchant Center และ Facebook Shop
 *
 * ทั้งสองที่กินรูปแบบ RSS 2.0 + namespace g: เหมือนกัน จึงใช้ไฟล์เดียวได้
 * เอา URL นี้ไปใส่ในระบบของแต่ละเจ้า แล้วมันจะมาดึงเองทุกวัน
 * ไม่ต้องอัปสินค้าเข้าไปทีละตัว และไม่ต้องมาอัปเดตราคาซ้ำสองที่
 *
 * เส้นทาง: https://burithaiteam.com/product-feed.xml
 */
export const revalidate = 3600;

/** &, <, > ในชื่อสินค้าทำให้ XML พังทั้งไฟล์ ต้องแปลงก่อนเสมอ */
function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function clean(value: string | undefined | null, max: number) {
  return escapeXml((value ?? "").replace(/\s+/g, " ").trim().slice(0, max));
}

export async function GET() {
  const products = await fetchPublishedProducts();

  const items = products
    .map((product) => {
      const range = priceRange(product);
      const image = coverImage(product);

      // ไม่มีราคา หรือไม่มีรูป = ส่งไปก็โดนปฏิเสธ ข้ามไปเลยดีกว่า
      // ปล่อยให้ติดอยู่ในระบบแบบ "ไม่อนุมัติ" จะกลายเป็นขยะที่ไม่มีใครตามเก็บ
      if (!range || !image) return null;

      const { inStock: available, canPreorder: preorder } = stockState(product);

      return `    <item>
      <g:id>BTT-${product.id_products}</g:id>
      <g:title>${clean(product.name, 150)}</g:title>
      <g:description>${clean(product.short_description || product.description || product.name, 5000)}</g:description>
      <g:link>${escapeXml(productUrl(product.id_products))}</g:link>
      <g:image_link>${escapeXml(image)}</g:image_link>
      <g:availability>${available ? "in_stock" : preorder ? "preorder" : "out_of_stock"}</g:availability>
      <g:price>${range.low}.00 THB</g:price>
      <g:condition>new</g:condition>
      <g:brand>${clean(product.brand || "BuriThaiTeam", 70)}</g:brand>
      <g:identifier_exists>no</g:identifier_exists>${
        product.category?.name
          ? `\n      <g:product_type>${clean(product.category.name, 750)}</g:product_type>`
          : ""
      }
    </item>`;
    })
    .filter(Boolean)
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>BuriThaiTeam Store</title>
    <link>${SITE_URL}</link>
    <description>อะไหล่และอุปกรณ์จอ LED</description>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
