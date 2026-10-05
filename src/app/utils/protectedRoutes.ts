/**
 * หน้าที่ต้องล็อกอินก่อนถึงจะเข้าได้
 *
 * ใช้ร่วมกันทั้ง middleware (กันตอนกดเข้าหน้า) และ GlobalAuthGuard
 * (กันตอนนั่งค้างอยู่บนหน้าแล้วหมดเวลา) — ถ้าแยกกันเขียนสองที่
 * เดี๋ยวก็ลืมอัปเดตอันใดอันหนึ่ง แล้วจะมีหน้าที่กันครึ่งเดียว
 *
 * ⚠️ เพิ่มหน้าใหม่ที่นี่แล้ว **ต้องไปเพิ่มใน matcher ของ middleware.ts ด้วย**
 * เพราะ Next.js อ่าน matcher ตอน build ใส่ตัวแปรไม่ได้
 */
export const PROTECTED_ROUTES = [
  "/wishlist",
  "/whishlist",
  "/shoppingcart",
  "/check_order",
  "/history_payment",
  "/setting_menu",
  "/orderbuy",
  "/payment",
] as const;

export function isProtectedPath(pathname: string) {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}
