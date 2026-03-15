"use client";
import "flowbite";
import { useEffect, useState } from "react";

interface AchievementItem {
  id: number;
  name: string;
  url: string[];
  description: string;
  category_name: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Achievement() {
  const [achievementList, setAchievementList] = useState<AchievementItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const res = await fetch(`${API_URL}/api/archive/`, {
          method: "GET",
          credentials: "include", // ✅ สำคัญมาก
        });

        const data = await res.json();

        if (res.ok) {
          setAchievementList(data.data.data);
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
    <div className="container mx-auto px-4 py-6 bg-gray-100 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-bold flex items-center justify-center gap-2 ">
        <div className="">Achievement</div>
      </h2>

      <h2 className="text-xl font-bold flex items-center justify-center gap-2">
        <div className="">(ผลงานของเรา)</div>
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 mx-auto mt-4">
        {loading ? (
          <div className="col-span-full text-center py-10">
            Loading...
          </div>
        ) : (
          achievementList.map((item) => (
            <div
              key={item.id}
              className="flex flex-col items-center justify-center p-4 border-0 rounded bg-gray-100"
            >
              <img
                className="rounded-full w-40 h-40"
                src={item.url?.[0] || "/image/logo_black.jpg"}
                alt={item.name}
              />

              <div className="text-center mt-2">
                <h3 className="text-lg font-semibold">
                  {item.name}
                </h3>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}