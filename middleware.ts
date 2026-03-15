// middleware.ts
import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = [
  "/detail_product",
  "/wishlist",
  "/whishlist",    // ✅ เผื่อคุณสะกดแบบนี้ใน app folder
  "/shoppingcart",
];

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get("token")?.value;

  if (!token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = `?redirect=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/detail_product/:path*",
    "/wishlist/:path*",
    "/whishlist/:path*",      // ✅ เผื่อสะกดผิดในโปรเจค
    "/shoppingcart/:path*",
  ],
};