import { SITE_URL, coverImage, priceRange, type CatalogProduct } from "./catalog";

/**
 * สร้างข้อมูลสินค้าในรูปแบบที่ Google อ่านได้ (schema.org/Product)
 *
 * ทำไมต้องมี: เว็บขายของที่ไม่มีอันนี้ ผลค้นหาจะขึ้นแค่ชื่อกับคำบรรยาย
 * ใส่แล้ว Google จะแสดง "ราคา" และ "มีสินค้า" ใต้ชื่อเว็บ ซึ่งคนกดเข้ามากกว่าเยอะ
 * และเป็นเงื่อนไขบังคับถ้าจะลง Google Shopping
 *
 * ⚠️ ห้ามใส่ข้อมูลที่หน้าเว็บไม่ได้แสดงจริง เช่นคะแนนรีวิวที่ไม่มีอยู่
 * Google ถือเป็นการหลอก และลงโทษด้วยการถอดผลค้นหาแบบพิเศษออกทั้งเว็บ
 */
export function buildProductJsonLd(product: CatalogProduct, id: string | number) {
  const range = priceRange(product);
  const image = coverImage(product);
  const url = `${SITE_URL}/detail_product/${id}`;

  const inStock =
    product.availability?.status === "in_stock" ||
    product.availability?.canBuyNow === true;

  const canPreorder = product.availability?.canPreorder === true;

  const availability = inStock
    ? "https://schema.org/InStock"
    : canPreorder
      ? "https://schema.org/PreOrder"
      : "https://schema.org/OutOfStock";

  const description =
    product.short_description ||
    product.description ||
    product.name ||
    "สินค้าจาก BuriThaiTeam Store";

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    // ตัดให้สั้นลง เพราะคำบรรยายของบางตัวยาวเป็นหน้า ไม่มีประโยชน์ในผลค้นหา
    description: description.replace(/\s+/g, " ").trim().slice(0, 500),
    url,
    sku: `BTT-${id}`,
    ...(image ? { image: [image] } : {}),
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    ...(product.category?.name ? { category: product.category.name } : {}),
  };

  if (range) {
    jsonLd.offers =
      range.low === range.high
        ? {
            "@type": "Offer",
            url,
            priceCurrency: "THB",
            price: range.low,
            availability,
            seller: { "@type": "Organization", name: "BuriThaiTeam Store" },
          }
        : {
            // ราคามีหลายแบบ (ตัว/ถุง, ความยาวต่างกัน) ต้องใช้ AggregateOffer
            // ถ้ายัดเป็น Offer เดียวแล้วเลือกราคาเดียว Google จะเจอราคาบนเว็บไม่ตรง
            // แล้วตีว่าเป็นข้อมูลเท็จ
            "@type": "AggregateOffer",
            url,
            priceCurrency: "THB",
            lowPrice: range.low,
            highPrice: range.high,
            offerCount: (product.prices ?? []).length,
            availability,
            seller: { "@type": "Organization", name: "BuriThaiTeam Store" },
          };
  }

  return jsonLd;
}
