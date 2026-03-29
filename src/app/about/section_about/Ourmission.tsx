"use client";
import "flowbite";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AchievementItem } from "@/types/Achievement";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function Ourmission() {
  const [isClient, setIsClient] = useState(false);

  const [pausedIndexes, setPausedIndexes] = useState<number[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [imageIndexes, setImageIndexes] = useState<number[]>([]);

  const [groupedData, setGroupedData] = useState<
    { category: string; items: AchievementItem[] }[]
  >([]);

  const [itemIndexes, setItemIndexes] = useState<number[]>([]);

  useEffect(() => {
    setIsClient(true);
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    const res = await fetch(`${API_URL}/api/archive/`, {
      credentials: "include",
    });

    const json = await res.json();
    const rawData = json.data.data as AchievementItem[];

    const uniqueItems = Array.from(
      new Map(rawData.map((item) => [item.id, item])).values(),
    );

    const grouped: Record<string, AchievementItem[]> = {};

    uniqueItems.forEach((item) => {
      if (!grouped[item.category_name]) {
        grouped[item.category_name] = [];
      }
      grouped[item.category_name].push(item);
    });

    const result = Object.keys(grouped).map((key) => ({
      category: key,
      items: grouped[key],
    }));

    setGroupedData(result);
    setItemIndexes(Array(result.length).fill(0));
    setImageIndexes(Array(result.length).fill(0));
  };

  // 🔥 hover image slide (ช้าลง)
  useEffect(() => {
    if (hoveredIndex === null) return;

    const interval = setInterval(() => {
      setImageIndexes((prev) =>
        prev.map((imgIndex, i) => {
          if (i !== hoveredIndex) return imgIndex;

          const item = groupedData[i]?.items[itemIndexes[i]];
          const images = item?.url || [];

          if (images.length <= 1) return imgIndex;

          return (imgIndex + 1) % images.length;
        }),
      );
    }, 3000); // 🔥 เพิ่ม delay

    return () => clearInterval(interval);
  }, [hoveredIndex, groupedData, itemIndexes]);

  // 🔥 auto slide (เหมือนเดิม)
  useEffect(() => {
    if (!isClient || groupedData.length === 0) return;

    const interval = setInterval(() => {
      setItemIndexes((prev) =>
        prev.map((index, i) => {
          if (pausedIndexes.includes(i)) return index;

          const items = groupedData[i]?.items || [];
          if (items.length <= 1) return index;

          return (index + 1) % items.length;
        }),
      );
    }, 6000);

    return () => clearInterval(interval);
  }, [isClient, groupedData, pausedIndexes]);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-6 my-3 shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6">Our Mission</h1>

      {isClient && (
        <div className="flex flex-col gap-8">
          {groupedData.map((group, i) => {
            const current = group.items[itemIndexes[i]];
            const images = current?.url || [];
            const currentImageIndex = imageIndexes[i] || 0;

            const isHovered = hoveredIndex === i;

            return (
              <div
                key={group.category}
                onMouseEnter={() => {
                  setHoveredIndex(i);
                  setPausedIndexes((prev) => [...prev, i]);
                }}
                onMouseLeave={() => {
                  setHoveredIndex(null);
                  setImageIndexes((prev) =>
                    prev.map((imgIndex, idx) => (idx === i ? 0 : imgIndex)),
                  );
                  setPausedIndexes((prev) =>
                    prev.filter((index) => index !== i),
                  );
                }}
                onClick={() => {
                  setHoveredIndex(i);
                  setPausedIndexes((prev) => [...prev, i]);
                }}
                className={`flex flex-col md:flex-row ${
                  i % 2 === 0 ? "md:flex-row-reverse" : "md:flex-row"
                } items-center p-6 border rounded-2xl bg-[#0f172a] text-yellow-500 hover:border-yellow-500 relative gap-12`}
              >
                {/* Background Gradient with lighter gold */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#b88a43] to-[#0f172a] opacity-30"></div>

                {/* 🔥 IMAGE */}
                <motion.div
                  className="relative w-full md:w-[45%] h-[200px] md:h-[400px] overflow-hidden rounded-[10px]"
                  whileHover={{ scale: 1.1 }} // ขยายกรอบของภาพเมื่อ hover
                >
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={current?.id + currentImageIndex}
                      src={
                        images[currentImageIndex] || "/image/placeholder.png"
                      }
                      className="absolute w-full h-full object-cover"
                      initial={isHovered ? { x: "-100%" } : { y: "-100%" }}
                      animate={{ x: "0%", y: "0%" }}
                      exit={isHovered ? { x: "100%" } : { y: "100%" }}
                      transition={{
                        duration: 0.3,
                        ease: "easeInOut",
                      }}
                    />
                  </AnimatePresence>
                </motion.div>

                {/* 🔥 TEXT */}
                <div className="w-full md:w-[45%] flex flex-col items-center justify-center px-6 ml-10">
                  <h2 className="text-2xl font-bold mb-2">{group.category}</h2>
                  <div className="relative w-full h-10 overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={current?.id}
                        className="absolute w-full text-center"
                        initial={{ x: -80, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 80, opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 120,
                          damping: 20,
                          mass: 0.8,
                          delay: 0.35, // 🔥 เพิ่ม delay
                        }}
                      >
                        {current?.name}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}