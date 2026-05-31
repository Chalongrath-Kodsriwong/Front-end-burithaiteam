import type { Metadata } from "next";

import ProductDetailClient from "./ProductDetailClient";

export const dynamic = "force-dynamic";

const SITE_URL = "https://burithaiteam.com";
const BACKEND_API_URL =
  process.env.BACKEND_API_URL || "http://localhost:5001";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};


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
      ? listJson.data.find(
          (item: any) => String(item?.id_products) === String(id)
        )
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
    console.error("Failed to fetch product metadata:", error);
    return null;
  }
}

function extractPriceText(product: any) {
  const directPrices = Array.isArray(product?.prices)
    ? product.prices
        .map((price: any) => Number(price))
        .filter((price: number) => Number.isFinite(price))
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
  const { id } = await params;
  const product = await fetchProductForMetadata(id);

  const productUrl = `${SITE_URL}/detail_product/${id}`;
  const ogImageUrl = `${SITE_URL}/detail_product/${id}/opengraph-image?v=2`;

  if (!product) {
    return {
      title: "สินค้า | BuriThaiTeam Store",
      description: "รายละเอียดสินค้าจาก BuriThaiTeam Store",
      alternates: { canonical: productUrl },
      openGraph: {
        title: "สินค้า | BuriThaiTeam Store",
        description: "รายละเอียดสินค้าจาก BuriThaiTeam Store",
        url: productUrl,
        siteName: "BuriThaiTeam Store",
        images: [{ url: ogImageUrl, width: 1200, height: 630, alt: "สินค้า BuriThaiTeam Store" }],
        type: "website",
        locale: "th_TH",
      },
      twitter: {
        card: "summary_large_image",
        title: "สินค้า | BuriThaiTeam Store",
        description: "รายละเอียดสินค้าจาก BuriThaiTeam Store",
        images: [ogImageUrl],
      },
    };
  }

  const title = product.name || "สินค้า";
  const priceText = extractPriceText(product);
  const description =
    product.short_description ||
    product.description ||
    "รายละเอียดสินค้าจาก BuriThaiTeam Store";
  const fullDescription = priceText
    ? `${description} ราคา ฿${priceText}`
    : description;
  const titleWithPrice = priceText ? `${title} | ราคา ฿${priceText}` : title;

  return {
    title: `${titleWithPrice} | BuriThaiTeam Store`,
    description: fullDescription,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title: `${titleWithPrice} | BuriThaiTeam Store`,
      description: fullDescription,
      url: productUrl,
      siteName: "BuriThaiTeam Store",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "website",
      locale: "th_TH",
    },
    twitter: {
      card: "summary_large_image",
      title: `${titleWithPrice} | BuriThaiTeam Store`,
      description: fullDescription,
      images: [ogImageUrl],
    },
    other: {
      "og:updated_time": product?.updated_at ?? new Date().toISOString(),
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ProductDetailClient id={id} />;
}
