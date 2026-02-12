import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = [
  "/detail_product", // กันทั้ง /detail_product และ /detail_product/[id]
  // เพิ่มหน้า 1 / หน้า 2 ที่คุณจะกันได้ เช่น:
  // "/page1",
  // "/page2",
];

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // เช็คว่าเป็น path ที่ต้องป้องกันไหม
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // อ่าน token จาก HttpOnly cookie
  const token = req.cookies.get("token")?.value;

  // ถ้าไม่มี token -> เด้งไป login พร้อม redirect กลับหน้าที่ขอ
  if (!token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = `?redirect=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(loginUrl);
  }

  // มี token -> ผ่าน (ไม่ต้องยิง /auth/me)
  return NextResponse.next();
}

// แนะนำใส่ matcher เพื่อลด overhead (เลือกได้)
export const config = {
  matcher: ["/detail_product/:path*"], // เพิ่ม "/page1/:path*", "/page2/:path*" ได้
};
