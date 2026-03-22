"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { WishlistItem } from "@/types/Wishlist_home"

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function WishlistPage() {
  const router = useRouter();

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // ✅ modal states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [pendingDeleteName, setPendingDeleteName] = useState<string>("");

  const [deleting, setDeleting] = useState(false);

  const total = useMemo(() => items.length, [items]);

  async function fetchWishlist() {
    try {
      setLoading(true);
      setErrorMsg("");

      const res = await fetch(`${API_URL}/api/wish-list/`, {
        method: "GET",
        credentials: "include",
      });

      if (res.status === 401 || res.status === 403) {
        const redirect = encodeURIComponent(
          window.location.pathname + window.location.search
        );
        router.replace(`/login?redirect=${redirect}`);
        return;
      }

      if (res.status === 404) {
        setItems([]);
        return;
      }

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMsg(json?.message || "โหลด Wishlist ไม่สำเร็จ");
        return;
      }

      setItems(json?.data || []);
    } catch (err) {
      console.error("fetchWishlist error:", err);
      setErrorMsg("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ เปิด popup ยืนยันลบ
  function openDeleteConfirm(productId: number, productName: string) {
    setPendingDeleteId(productId);
    setPendingDeleteName(productName);
    setConfirmOpen(true);
  }

  function closeDeleteConfirm() {
    if (deleting) return;
    setConfirmOpen(false);
    setPendingDeleteId(null);
    setPendingDeleteName("");
  }

  async function handleRemoveConfirmed() {
    if (pendingDeleteId == null) return;

    try {
      setDeleting(true);

      const productId = pendingDeleteId;

      const res = await fetch(`${API_URL}/api/wish-list/${productId}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        // ✅ เผื่อ backend อ่านจาก body ด้วย
        body: JSON.stringify({ productId }),
      });

      if (res.status === 401 || res.status === 403) {
        const redirect = encodeURIComponent(
          window.location.pathname + window.location.search
        );
        router.replace(`/login?redirect=${redirect}`);
        return;
      }

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        alert(json?.message || "ลบ Wishlist ไม่สำเร็จ");
        return;
      }

      // ✅ อัปเดต UI ทันที
      setItems((prev) => prev.filter((x) => x.product.id !== productId));
      closeDeleteConfirm();
    } catch (err) {
      console.error("handleRemoveConfirmed error:", err);
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Wishlist</h1>
        <div className="text-gray-600">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-end justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold">Wishlist</h1>
        <div className="text-sm text-gray-600">
          ทั้งหมด: <span className="font-semibold">{total}</span> รายการ
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-red-700">
          {errorMsg}
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white border rounded-lg p-6 text-center">
          <p className="text-gray-600 mb-4">ยังไม่มีสินค้าใน Wishlist</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            ไปเลือกซื้อสินค้า
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((it) => {
            const p = it.product;

            return (
              <div
                key={p.id}
                className="bg-white border rounded-lg overflow-hidden shadow-sm"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <div className="sm:w-44 sm:min-w-44 w-full">
                    <div className="aspect-[4/3] sm:aspect-square bg-gray-100 flex items-center justify-center">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400 text-sm">No Image</div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="font-semibold text-lg leading-snug line-clamp-2">
                        {p.name}
                      </h2>
                      <span className="text-xs px-2 py-1 rounded-full bg-pink-100 text-pink-700 whitespace-nowrap">
                        ❤️ Wishlist
                      </span>
                    </div>

                    {p.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {p.description}
                      </p>
                    )}

                    <div className="text-sm text-gray-700 mt-3 space-y-1">
                      {p.variant && (
                        <p>
                          <span className="text-gray-500">Variant:</span>{" "}
                          {p.variant}
                        </p>
                      )}
                      {p.inventory && (
                        <p>
                          <span className="text-gray-500">Inventory:</span>{" "}
                          {p.inventory}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="sm:w-52 sm:min-w-52 p-4 sm:border-l border-t sm:border-t-0 flex sm:flex-col gap-2 justify-end">
                    <Link
                      href={`/detail_product/${p.id}`}
                      className="w-full text-center px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm"
                    >
                      ดูสินค้า
                    </Link>

                    <button
                      onClick={() => openDeleteConfirm(p.id, p.name)}
                      className="w-full px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 text-sm"
                    >
                      ลบออก
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ✅ Confirm Delete Modal */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeDeleteConfirm} // คลิกฉากหลัง = ปิด
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg"
            onClick={(e) => e.stopPropagation()} // กันคลิกทะลุ
          >
            <h3 className="text-lg font-semibold">ยืนยันการลบ</h3>
            <p className="mt-2 text-sm text-gray-700">
              ต้องการลบ{" "}
              <span className="font-semibold text-gray-900">
                {pendingDeleteName || "สินค้านี้"}
              </span>{" "}
              ออกจาก Wishlist หรือไม่?
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={closeDeleteConfirm}
                disabled={deleting}
                className={`px-4 py-2 rounded-md border text-sm ${
                  deleting
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                No
              </button>

              <button
                onClick={handleRemoveConfirmed}
                disabled={deleting}
                className={`px-4 py-2 rounded-md text-sm text-white ${
                  deleting
                    ? "bg-red-300 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {deleting ? "Deleting..." : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}