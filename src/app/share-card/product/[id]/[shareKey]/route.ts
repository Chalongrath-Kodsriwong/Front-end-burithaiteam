const SITE_URL = "https://burithaiteam.com";
const BACKEND_API_URL =
  process.env.BACKEND_API_URL || "http://158.173.159.107:5001";

type RouteContext = {
  params: Promise<{ id: string; shareKey: string }>;
};

type ProductImage = {
  is_cover?: boolean;
  type?: string;
  url?: string;
};

type ProductInventory = {
  price?: number | string;
};

type ProductVariant = {
  inventories?: ProductInventory[];
};

type Product = {
  id_products?: number | string;
  name?: string;
  prices?: Array<number | string>;
  variants?: ProductVariant[];
  images?: ProductImage[];
  avatar?: string;
  brand?: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function fetchProduct(id: string): Promise<Product | null> {
  try {
    const detailRes = await fetch(`${BACKEND_API_URL}/api/products/${id}`, {
      cache: "no-store",
    });

    if (!detailRes.ok) return null;

    const detailJson = await detailRes.json();
    const detailProduct = (detailJson?.data ?? null) as Product | null;

    const hasPrices =
      Array.isArray(detailProduct?.prices) && detailProduct.prices.length > 0;

    if (hasPrices) return detailProduct;

    const listRes = await fetch(`${BACKEND_API_URL}/api/products`, {
      cache: "no-store",
    });

    if (!listRes.ok) return detailProduct;

    const listJson = await listRes.json();
    const listProduct = Array.isArray(listJson?.data)
      ? listJson.data.find(
          (item: Product) => String(item?.id_products) === String(id)
        )
      : null;

    if (!listProduct) return detailProduct;

    return {
      ...detailProduct,
      prices: Array.isArray(listProduct?.prices)
        ? listProduct.prices
        : detailProduct?.prices,
      images:
        Array.isArray(detailProduct?.images) && detailProduct.images.length > 0
          ? detailProduct.images
          : listProduct?.images,
      avatar: detailProduct?.avatar || listProduct?.avatar,
      brand: detailProduct?.brand || listProduct?.brand,
    };
  } catch (error) {
    console.error("Failed to fetch product share card:", error);
    return null;
  }
}

function extractPriceText(product: Product) {
  const directPrices = Array.isArray(product?.prices)
    ? product.prices
        .map((price) => Number(price))
        .filter((price: number) => Number.isFinite(price))
    : [];

  const inventoryPrices = Array.isArray(product?.variants)
    ? product.variants
        .flatMap((variant) =>
          Array.isArray(variant?.inventories)
            ? variant.inventories.map((inventory) =>
                Number(inventory?.price)
              )
            : []
        )
        .filter((price: number) => Number.isFinite(price))
    : [];

  const prices = directPrices.length > 0 ? directPrices : inventoryPrices;

  if (prices.length === 0) return null;
  if (prices.length === 1) return prices[0].toLocaleString("th-TH");

  return `${Math.min(...prices).toLocaleString("th-TH")} - ${Math.max(
    ...prices
  ).toLocaleString("th-TH")}`;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id, shareKey } = await params;
  const product = await fetchProduct(id);
  const productUrl = `${SITE_URL}/detail_product/${encodeURIComponent(id)}`;
  const imageUrl = `${SITE_URL}/detail_product/${encodeURIComponent(
    id
  )}/opengraph-image?v=${encodeURIComponent(shareKey)}`;

  const productName = product?.name || "สินค้า BuriThaiTeam";
  const priceText = product ? extractPriceText(product) : null;
  const title = priceText
    ? `${productName} | ราคา ฿${priceText}`
    : productName;
  const description = priceText
    ? `${productName} ราคา ฿${priceText}`
    : "รายละเอียดสินค้าจาก BuriThaiTeam Store";

  const html = `<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} | BuriThaiTeam Store</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="all">
  <link rel="canonical" href="${escapeHtml(productUrl)}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="th_TH">
  <meta property="og:site_name" content="BuriThaiTeam Store">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(productUrl)}">
  <meta property="og:image" content="${escapeHtml(imageUrl)}">
  <meta property="og:image:secure_url" content="${escapeHtml(imageUrl)}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(productName)}">
  <meta property="product:price:amount" content="${escapeHtml(
    priceText ?? ""
  )}">
  <meta property="product:price:currency" content="THB">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(imageUrl)}">
</head>
<body>
  <main style="font-family: sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: 24px; background: #f8fafc;">
    <div style="max-width: 760px; width: 100%; background: #fff; border: 1px solid #e5e7eb; border-radius: 24px; padding: 24px; box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);">
      <img
        src="${escapeHtml(imageUrl)}"
        alt="${escapeHtml(productName)}"
        width="1200"
        height="630"
        style="width: 100%; height: auto; border-radius: 18px; display: block; margin-bottom: 20px;"
      >
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(description)}</p>
      <p>กำลังพาไปหน้าสินค้า...</p>
      <p><a href="${escapeHtml(productUrl)}">เปิดหน้าสินค้าเดี๋ยวนี้</a></p>
    </div>
  </main>
  <script>
    window.setTimeout(function () {
      window.location.replace("${escapeHtml(productUrl)}");
    }, 3000);
  </script>
</body>
</html>`;
  const htmlBytes = new TextEncoder().encode(html);

  return new Response(htmlBytes, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Length": String(htmlBytes.byteLength),
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "X-Robots-Tag": "all",
    },
  });
}
