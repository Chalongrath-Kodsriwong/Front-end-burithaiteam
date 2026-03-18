import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname, search } = req.nextUrl;

  const protectedRoutes = ["/wishlist", "/whishlist", "/shoppingcart"];

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // 🔐 ยังไม่ได้ login แต่พยายามเข้า protected page
  if (isProtected && !token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = `?redirect=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(loginUrl);
  }

  // 🚫 ถ้า login อยู่แล้ว ห้ามเข้า /login ทุกกรณี
  if (token && pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/wishlist/:path*",
    "/whishlist/:path*",
    "/shoppingcart/:path*",
    "/login",
    "/login/:path*",
  ],
};