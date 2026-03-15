import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname, search } = req.nextUrl;

  const protectedRoutes = [
    "/wishlist",
    "/whishlist",   // เผื่อสะกดผิด
    "/shoppingcart",
  ];

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // ถ้ายังไม่ได้ login และพยายามเข้า protected page
  if (isProtected && !token) {
    const loginUrl = req.nextUrl.clone();

    loginUrl.pathname = "/login";
    loginUrl.search = `?redirect=${encodeURIComponent(pathname + search)}`;

    return NextResponse.redirect(loginUrl);
  }

  // ถ้า login แล้ว ห้ามเข้า login page
  if (pathname === "/login" && token) {
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
  ],
};