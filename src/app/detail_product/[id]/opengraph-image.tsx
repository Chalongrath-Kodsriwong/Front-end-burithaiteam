import { ImageResponse } from "next/og";

const SITE_URL = "https://burithaiteam.com";
const BACKEND_API_URL =
  process.env.BACKEND_API_URL || "http://158.173.159.107:5001";

export const runtime = "nodejs";
export const contentType = "image/png";
export const size = {
  width: 1200,
  height: 630,
};

function toAbsoluteUrl(url?: string | null) {
  if (!url) return `${SITE_URL}/image/logo_white.jpeg`;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${SITE_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

async function fetchProduct(id: string) {
  try {
    const response = await fetch(`${BACKEND_API_URL}/api/products/${id}`, {
      cache: "no-store",
    });

    if (!response.ok) return null;
    const json = await response.json();
    return json?.data ?? null;
  } catch (error) {
    console.error("Failed to build og image:", error);
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

function trimText(text: string, max = 72) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}...`;
}

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await fetchProduct(id);

  const title = trimText(product?.name || "BuriThaiTeam Store");
  const priceText = extractPriceText(product);
  const description = trimText(
    product?.short_description ||
      product?.description ||
      "Shop & Service for LED display equipment",
    120
  );
  const productImages = Array.isArray(product?.images) ? product.images : [];
  const coverImageUrl =
    productImages.find(
      (item: any) =>
        item?.url && !String(item.url).toLowerCase().endsWith(".mp4")
    )?.url || product?.avatar;
  const imageUrl = toAbsoluteUrl(coverImageUrl);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#f4f0e8",
          color: "#171717",
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <div
          style={{
            width: "56%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#ffffff",
            padding: "36px",
          }}
        >
          <img
            src={imageUrl}
            alt={title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              borderRadius: "28px",
              border: "2px solid #efe4cd",
              background: "#ffffff",
            }}
          />
        </div>

        <div
          style={{
            width: "44%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "42px 38px",
            background:
              "linear-gradient(180deg, rgba(16,23,34,0.96) 0%, rgba(29,34,41,0.98) 100%)",
            color: "#ffffff",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontSize: 26,
                fontWeight: 700,
                color: "#f3c63f",
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 999,
                  background: "#f3c63f",
                }}
              />
              BuriThaiTeam Store
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div
                style={{
                  fontSize: 44,
                  lineHeight: 1.18,
                  fontWeight: 800,
                }}
              >
                {title}
              </div>

              {priceText ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    alignSelf: "flex-start",
                    padding: "14px 20px",
                    borderRadius: "18px",
                    background: "#f6f0e3",
                    color: "#d94917",
                    fontSize: 38,
                    fontWeight: 900,
                  }}
                >
                  ราคา ฿{priceText}
                </div>
              ) : null}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 26,
                lineHeight: 1.45,
                color: "rgba(255,255,255,0.88)",
              }}
            >
              {description}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: "18px",
                borderTop: "1px solid rgba(255,255,255,0.14)",
                fontSize: 24,
                color: "rgba(255,255,255,0.7)",
              }}
            >
              <div>burithaiteam.com</div>
              <div>Shop & Service</div>
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
