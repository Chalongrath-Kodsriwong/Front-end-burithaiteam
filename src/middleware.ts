import { NextRequest, NextResponse } from "next/server";
import { isProtectedPath } from "@/app/utils/protectedRoutes";

/**
 * ⚠️ ไฟล์นี้ต้องอยู่ที่ src/middleware.ts เท่านั้น
 *
 * โปรเจกต์นี้ใช้โฟลเดอร์ src/ (มี src/app) Next.js จึงมองหา middleware ที่ src/
 * ถ้าวางไว้ที่รากโปรเจกต์ มันจะ **ไม่ error ไม่เตือน แต่ไม่ทำงานเลย**
 * build ผ่านปกติ middleware-manifest.json ขึ้นว่า "middleware": {} แล้วเงียบ
 *
 * ของเดิมวางผิดที่มาตลอด หน้า wishlist / shoppingcart จึงไม่เคยถูกกันจริง
 * ทั้งที่โค้ดเขียนไว้ถูกแล้ว (เจอ 5 ต.ค. 2026)
 */

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname, search } = req.nextUrl;

  const isProtected = isProtectedPath(pathname);

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
  // ⚠️ ต้องตรงกับ PROTECTED_ROUTES ใน utils/protectedRoutes.ts
  // Next.js อ่าน matcher ตอน build จึงใส่ตัวแปรไม่ได้ ต้องเขียนซ้ำเป็นข้อความ
  matcher: [
    "/wishlist",
    "/wishlist/:path*",
    "/whishlist",
    "/whishlist/:path*",
    "/shoppingcart",
    "/shoppingcart/:path*",
    "/check_order",
    "/check_order/:path*",
    "/history_payment",
    "/history_payment/:path*",
    "/setting_menu",
    "/setting_menu/:path*",
    "/orderbuy",
    "/orderbuy/:path*",
    "/payment",
    "/payment/:path*",
    "/login",
    "/login/:path*",
  ],
};