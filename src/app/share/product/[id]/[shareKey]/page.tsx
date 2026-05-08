import type { Metadata } from "next";

import ShareRedirectClient from "./ShareRedirectClient";

const SITE_URL = "https://burithaiteam.com";
const BACKEND_API_URL =
  process.env.BACKEND_API_URL || "http://158.173.159.107:5001";

type PageProps = {
  params: Promise<{ id: string; shareKey: string }>;
};

function toAbsoluteUrl(url?: string | null) {
  if (!url) return `${SITE_URL}/image/logo_white.jpeg`;
  if (url.startsWith("http://") || url.startsWith("https://")) return encodeURI(url);
  return encodeURI(`${SITE_URL}${url.startsWith("/") ? url : `/${url}`}`);
}

function appendCacheParam(url: string, cacheKey?: string | null) {
  if (!cacheKey) return url;

  try {
    const nextUrl = new URL(url);
    nextUrl.searchParams.set("v", cacheKey);
    return nextUrl.toString();
  } catch {
    return url;
  }
}

async function fetchProductForMetadata(id: string) {
  try {
    const res = await fetch(`${BACKEND_API_URL}/api/products/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;

    const result = await res.json();
    const detailProduct = result?.data ?? null;
    const hasPrices =
      Array.isArray(detailProduct?.prices) && detailProduct.prices.length > 0;

    if (hasPrices) return detailProduct;

    const listRes = await fetch(`${BACKEND_API_URL}/api/products`, {
      cache: "no-store",
    });

    if (!listRes.ok) return detailProduct;

    const listJson = await listRes.json();
    const listProduct = Array.isArray(listJson?.data)
      ? listJson.data.find((item: any) => String(item?.id_products) === String(id))
      : null;

    if (!listProduct) return detailProduct;

    return {
      ...detailProduct,
      prices: Array.isArray(listProduct?.prices) ? listProduct.prices : detailProduct?.prices,
      images:
        Array.isArray(detailProduct?.images) && detailProduct.images.length > 0
          ? detailProduct.images
          : listProduct?.images,
      avatar: detailProduct?.avatar || listProduct?.avatar,
      brand: detailProduct?.brand || listProduct?.brand,
    };
  } catch (error) {
    console.error("Failed to fetch share metadata:", error);
    return null;
  }
}

function extractPriceText(product: any) {
  const directPrices = Array.isArray(product?.prices)
    ? product.prices.map((price: any) => Number(price)).filter((price: number) => Number.isFinite(price))
    : [];

  const inventoryPrices = Array.isArray(product?.variants)
    ? product.variants
        .flatMap((variant: any) =>
          Array.isArray(variant?.inventories)
            ? variant.inventories.map((inventory: any) => Number(inventory?.price))
            : []
        )
        .filter((price: number) => Number.isFinite(price))
    : [];

  const prices = directPrices.length > 0 ? directPrices : inventoryPrices;

  if (prices.length === 0) return null;
  if (prices.length === 1) return prices[0].toLocaleString("th-TH");

  return `${Math.min(...prices).toLocaleString("th-TH")} - ${Math.max(...prices).toLocaleString("th-TH")}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id, shareKey } = await params;
  const product = await fetchProductForMetadata(id);
  const productPageUrl = `${SITE_URL}/detail_product/${id}`;
  const shareUrl = `${SITE_URL}/share/product/${id}/${encodeURIComponent(shareKey)}`;
  const previewImage = appendCacheParam(
    `${SITE_URL}/detail_product/${id}/opengraph-image`,
    shareKey
  );

  if (!product) {
    return {
      title: "สินค้า | BuriThaiTeam Store",
      description: "รายละเอียดสินค้าจาก BuriThaiTeam Store",
      alternates: { canonical: shareUrl },
      openGraph: {
        title: "สินค้า | BuriThaiTeam Store",
        description: "รายละเอียดสินค้าจาก BuriThaiTeam Store",
        url: shareUrl,
        images: [{ url: previewImage, width: 1200, height: 630, alt: "BuriThaiTeam Store" }],
      },
    };
  }

  const title = product.name || "สินค้า";
  const priceText = extractPriceText(product);
  const description =
    product.short_description ||
    product.description ||
    "รายละเอียดสินค้าจาก BuriThaiTeam Store";
  const fullDescription = priceText ? `${description} ราคา ฿${priceText}` : description;
  const titleWithPrice = priceText ? `${title} | ราคา ฿${priceText}` : title;

  return {
    title: `${titleWithPrice} | BuriThaiTeam Store`,
    description: fullDescription,
    alternates: { canonical: shareUrl },
    openGraph: {
      title: titleWithPrice,
      description: fullDescription,
      url: shareUrl,
      siteName: "BuriThaiTeam Store",
      type: "website",
      images: [
        {
          url: previewImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: titleWithPrice,
      description: fullDescription,
      images: [previewImage],
    },
    other: {
      "product:price:amount": priceText ?? "",
      "product:price:currency": "THB",
      "product:image": previewImage,
      "og:product_page": productPageUrl,
    },
  };
}

export default async function ShareProductPage({ params }: PageProps) {
  const { id } = await params;
  return <ShareRedirectClient targetUrl={`${SITE_URL}/detail_product/${id}`} />;
}
