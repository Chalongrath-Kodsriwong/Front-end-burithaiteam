import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL || "http://158.173.159.107:5001";
const SITE_URL = "https://burithaiteam.com";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ id: string }> };

async function fetchProduct(id: string) {
  try {
    const res = await fetch(`${BACKEND_API_URL}/api/products/${id}`, {
      cache: "force-cache",
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

function extractPrice(product: any): string | null {
  const prices: number[] = Array.isArray(product?.variants)
    ? product.variants.flatMap((v: any) =>
        Array.isArray(v?.inventories)
          ? v.inventories.map((i: any) => Number(i.price)).filter(Number.isFinite)
          : []
      )
    : [];
  if (prices.length === 0) return null;
  if (prices.length === 1) return prices[0].toLocaleString("th-TH");
  return `${Math.min(...prices).toLocaleString("th-TH")} – ${Math.max(...prices).toLocaleString("th-TH")}`;
}

function getCoverImage(product: any): string | null {
  const images = Array.isArray(product?.images) ? product.images : [];
  const cover = images.find((img: any) => img?.is_cover || img?.type === "cover");
  return (cover ?? images[0])?.url ?? product?.avatar ?? null;
}

export default async function Image({ params }: Props) {
  const { id } = await params;
  const product = await fetchProduct(id);

  const name = product?.name ?? "สินค้า BuriThaiTeam";
  const priceText = product ? extractPrice(product) : null;
  const coverUrl = product ? getCoverImage(product) : null;
  const domain = SITE_URL.replace("https://", "");

  // Read font from filesystem (public/fonts) — avoids circular HTTP request
  let fontData: ArrayBuffer | null = null;
  try {
    const fontPath = path.join(process.cwd(), "public", "fonts", "NotoSansThai-Regular.ttf");
    const fontBuffer = fs.readFileSync(fontPath);
    fontData = fontBuffer.buffer.slice(fontBuffer.byteOffset, fontBuffer.byteOffset + fontBuffer.byteLength) as ArrayBuffer;
  } catch {
    fontData = null;
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          background: "#ffffff",
          fontFamily: fontData ? "Noto Sans Thai" : "sans-serif",
        }}
      >
        {/* Left: product image */}
        <div
          style={{
            width: 630,
            height: 630,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f5f5f5",
            overflow: "hidden",
          }}
        >
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt={name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                fontSize: 80,
                color: "#cccccc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              🛍️
            </div>
          )}
        </div>

        {/* Right: info panel */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "48px 40px",
            background: "#ffffff",
          }}
        >
          {/* Brand */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 22,
                fontWeight: 700,
                color: "#cc0000",
                letterSpacing: 1,
              }}
            >
              BuriThaiTeam Store
            </div>
          </div>

          {/* Product name */}
          <div
            style={{
              fontSize: name.length > 40 ? 32 : 40,
              fontWeight: 800,
              color: "#111111",
              lineHeight: 1.3,
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            {name}
          </div>

          {/* Price + domain */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {priceText && (
              <div
                style={{
                  display: "flex",
                  fontSize: 36,
                  fontWeight: 700,
                  color: "#cc0000",
                }}
              >
                {`฿ ${priceText}`}
              </div>
            )}
            <div
              style={{
                display: "flex",
                fontSize: 18,
                color: "#666666",
              }}
            >
              {domain}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      ...(fontData && {
        fonts: [
          {
            name: "Noto Sans Thai",
            data: fontData,
            weight: 400 as const,
            style: "normal" as const,
          },
        ],
      }),
    }
  );
}
