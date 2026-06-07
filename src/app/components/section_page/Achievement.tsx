"use client";
import "flowbite";
import { useEffect, useState } from "react";

import { AchievementItem } from "@/types/Achievement" 

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

function resolveClientApiBaseUrl() {
  if (typeof window === "undefined") return API_URL;

  const envUrl = API_URL.trim();
  if (!envUrl) return window.location.origin;

  try {
    const configured = new URL(envUrl);
    const current = new URL(window.location.origin);

    const isLocalConfiguredHost =
      configured.hostname === "localhost" ||
      configured.hostname === "127.0.0.1";

    if (
      isLocalConfiguredHost &&
      configured.hostname === current.hostname &&
      configured.port !== current.port
    ) {
      // If FE is running on another local port (e.g. 3001), follow current origin.
      return window.location.origin;
    }
  } catch {
    return envUrl;
  }

  return envUrl;
}

export default function Achievement() {
  const [achievementList, setAchievementList] = useState<AchievementItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchAchievements = async () => {
    try {
      const apiBaseUrl = resolveClientApiBaseUrl();
      const res = await fetch(`${apiBaseUrl}/api/archive/`, {
        method: "GET",
        credentials: "include",
      });

      const json = await res.json();

      if (res.ok && Array.isArray(json?.data?.data)) {

        const rawData = json.data.data as AchievementItem[];

        const uniqueItems = Array.from(
          new Map(rawData.map((item) => [item.id, item])).values()
        );

        setAchievementList(uniqueItems);
      }

    } catch (error) {
      console.error("Fetch achievement error:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchAchievements();
}, []);

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.06)_0%,transparent_60%)]" />

      <div className="relative z-10">
        <div className="flex flex-col items-center text-center mb-10 sm:mb-14">
          <span className="section-eyebrow-led mb-4">Our Work</span>
          <h2 className="section-heading mb-3">Achievement</h2>
          <p className="text-sm text-[#5A7A98]">ผลงานที่เราภาคภูมิใจ และลูกค้าไว้วางใจ</p>
          <div className="gold-dot-sep">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00CFFF] shadow-[0_0_8px_rgba(0,207,255,0.9)]" />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : achievementList.length === 0 ? (
          <div className="text-center py-10 text-gray-500">ยังไม่มีผลงาน</div>
        ) : (
          <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,black_8%,black_92%,transparent_100%)]">
            <div className="flex gap-6 sm:gap-10 animate-marquee w-max">
              {[...achievementList, ...achievementList].map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="group flex flex-col items-center text-center min-w-[110px] sm:min-w-[145px]"
                >
                  <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-sm overflow-hidden
                    ring-2 ring-[rgba(0,207,255,0.15)]
                    group-hover:ring-[rgba(0,207,255,0.65)]
                    shadow-[0_4px_16px_rgba(0,0,0,0.6)]
                    group-hover:shadow-[0_0_22px_rgba(0,207,255,0.2)]
                    transition-all duration-350 backdrop-blur-sm">
                    <img
                      src={item.url?.[0] || "/image/logo_black.jpg"}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <p className="mt-2 sm:mt-3 text-xs sm:text-sm font-semibold text-[#7A9AB8] group-hover:text-[#00CFFF] line-clamp-2 max-w-[100px] sm:max-w-[130px] transition-colors duration-300">
                    {item.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
