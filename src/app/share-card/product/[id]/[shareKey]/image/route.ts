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

type Product = {
  id_products?: number | string;
  images?: ProductImage[];
  avatar?: string;
};

function toAbsoluteImageUrl(url?: string | null) {
  if (!url) return `${SITE_URL}/image/logo_white.jpeg`;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return encodeURI(url);
  }
  return encodeURI(`${SITE_URL}${url.startsWith("/") ? url : `/${url}`}`);
}

function getCoverImageUrl(product: Product | null) {
  const images = Array.isArray(product?.images) ? product.images : [];
  const coverImage =
    images.find((image) => image?.is_cover && image?.url) ||
    images.find((image) => image?.type === "cover" && image?.url) ||
    images.find(
      (image) =>
        image?.url && !String(image.url).toLowerCase().endsWith(".mp4")
    );

  return toAbsoluteImageUrl(coverImage?.url || product?.avatar);
}

async function fetchProduct(id: string): Promise<Product | null> {
  try {
    const detailRes = await fetch(`${BACKEND_API_URL}/api/products/${id}`, {
      cache: "no-store",
    });

    if (!detailRes.ok) return null;

    const detailJson = await detailRes.json();
    const detailProduct = (detailJson?.data ?? null) as Product | null;

    if (Array.isArray(detailProduct?.images) && detailProduct.images.length > 0) {
      return detailProduct;
    }

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

    return listProduct
      ? {
          ...detailProduct,
          images: listProduct?.images,
          avatar: detailProduct?.avatar || listProduct?.avatar,
        }
      : detailProduct;
  } catch (error) {
    console.error("Failed to fetch product share image:", error);
    return null;
  }
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const product = await fetchProduct(id);
  const imageUrl = getCoverImageUrl(product);

  try {
    const imageRes = await fetch(imageUrl, {
      cache: "no-store",
      headers: {
        Accept: "image/avif,image/webp,image/png,image/jpeg,image/*,*/*;q=0.8",
      },
    });

    if (!imageRes.ok || !imageRes.body) {
      throw new Error(`Image fetch failed with ${imageRes.status}`);
    }

    const contentType = imageRes.headers.get("content-type") || "image/png";
    const contentLength = imageRes.headers.get("content-length");
    const headers = new Headers({
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "X-Robots-Tag": "all",
    });

    if (contentLength) headers.set("Content-Length", contentLength);

    return new Response(imageRes.body, { headers });
  } catch (error) {
    console.error("Failed to proxy product share image:", error);
    const fallbackRes = await fetch(`${SITE_URL}/image/logo_white.jpeg`, {
      cache: "no-store",
    });

    return new Response(fallbackRes.body, {
      headers: {
        "Content-Type": fallbackRes.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
        "X-Robots-Tag": "all",
      },
    });
  }
}
