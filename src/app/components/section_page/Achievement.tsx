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
    <div className="relative container mx-auto px-6 py-16 rounded-[60px] overflow-hidden bg-[#0f172a]">

      {/* 🌟 Dark Gold Fade Background */}
      <div
        className="absolute inset-0 pointer-events-none
        bg-[linear-gradient(to_top,_rgba(120,90,20,0.20),_rgba(15,23,42,1)_100%)]"
      ></div>

      <div className="relative z-10 text-yellow-400">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold">Achievement</h2>
          <h3 className="text-xl font-semibold mt-2">(ผลงานของเรา)</h3>
        </div>

        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : achievementList.length === 0 ? (
          <div className="text-center py-10">No Data</div>
        ) : (
          <div className="overflow-hidden">
            <div className="flex gap-16 animate-marquee w-max">
              {[...achievementList, ...achievementList].map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="flex flex-col items-center text-center min-w-[220px]"
                >
                  <img
                    className="rounded-full w-44 h-44 sm:w-52 sm:h-52 object-cover border-2 border-yellow-500 shadow-lg"
                    src={item.url?.[0] || "/image/logo_black.jpg"}
                    alt={item.name}
                  />
                  <h3 className="mt-5 text-lg sm:text-xl font-semibold">
                    {item.name}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
