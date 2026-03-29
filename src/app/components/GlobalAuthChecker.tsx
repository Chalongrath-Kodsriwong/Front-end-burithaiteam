// "use client";
// import { useEffect } from "react";
// import { useRouter, usePathname } from "next/navigation";

// const API_URL =
//   process.env.NEXT_PUBLIC_API_URL || "" || "http://localhost:8080";

// export default function GlobalAuthGuard() {
//   const router = useRouter();
//   const pathname = usePathname();

//   useEffect(() => {
//     const username = localStorage.getItem("username");

//     // 🔥 ถ้าไม่ login → ไม่ต้องเช็คอะไรเลย
//     if (!username) return;

//     const checkAuth = async () => {
//       try {
//         const res = await fetch(`${API_URL}/api/auth/me`, {
//           credentials: "include",
//         });

//         if (res.status === 401) {
//           localStorage.removeItem("username");
//           localStorage.removeItem("first_name");

//           // window.location.href = "/login";
//           window.location.reload(); // รีเฟรชหน้า
          
//           return;
//         }

//         // 🔥 login อยู่แต่พยายามเข้า /login
//         if (res.ok && pathname === "/login") {
//           router.replace("/");
//         }

//       } catch {
//         // ไม่ต้อง log อะไร
//       }
//     };

//     // 🔥 เช็คครั้งแรกตอน mount
//     checkAuth();

//     // 🔥 เช็คทุก 10 นาที (600,000 ms)
//     const interval = setInterval(checkAuth, 600000);

//     return () => clearInterval(interval);

//   }, [pathname, router]);

//   return null;
// }