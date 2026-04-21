import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, SortDesc, SortAsc, Clock } from "lucide-react";

const AllReviews = ({ isOpen, onClose, reviews = [] }) => {
  // 🌟 1. State สำหรับเก็บสถานะการเรียงลำดับ
  const [sortBy, setSortBy] = useState("latest"); // ตัวเลือก: latest, highRate, lowRate

  // 🌟 2. คำนวณการเรียงลำดับข้อมูลใหม่ทุกครั้งที่ sortBy เปลี่ยน
  const filteredReviews = useMemo(() => {
    let result = [...reviews];
    if (sortBy === "latest") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "highRate") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "lowRate") {
      result.sort((a, b) => a.rating - b.rating);
    }
    return result;
  }, [reviews, sortBy]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end pointer-events-none">
          {/* 🛡️ แผ่นกระจกใสกันคลิกทะลุ (ยันต์กันผี) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 pointer-events-auto"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          />

          {/* 🌟 แผ่นรีวิว (สไลด์ขึ้นมาจากข้างล่างแกน Y) */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full h-full bg-[#FFF8F4] flex flex-col pointer-events-auto shadow-2xl"
          >
            {/* --- Header --- */}
            <div className="bg-white border-b border-[#EEE2D1] shrink-0">
              <div className="flex items-center justify-between px-6 py-5">
                <h2 className="text-xl font-bold text-[#2D3E25]">
                  รีวิวทั้งหมด
                </h2>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onClose();
                  }}
                  onTouchEnd={(e) => e.stopPropagation()}
                  className="p-2 text-[#2D3E25] bg-[#F4E8DB]/50 rounded-full active:scale-90 transition-transform cursor-pointer"
                >
                  <X size={20} className="text-[#A67045]" />
                </button>
              </div>

              {/* 🌟 แถบ Filter Chips (กดเปลี่ยนการเรียงลำดับ) */}
              <div className="flex gap-2 px-6 pb-4 overflow-x-auto no-scrollbar">
                <FilterChip
                  label="ล่าสุด"
                  active={sortBy === "latest"}
                  onClick={() => setSortBy("latest")}
                  icon={<Clock size={14} />}
                />
                <FilterChip
                  label="คะแนนสูง"
                  active={sortBy === "highRate"}
                  onClick={() => setSortBy("highRate")}
                  icon={<SortAsc size={14} />}
                />
                <FilterChip
                  label="คะแนนน้อย"
                  active={sortBy === "lowRate"}
                  onClick={() => setSortBy("lowRate")}
                  icon={<SortDesc size={14} />}
                />
              </div>
            </div>

            {/* --- Content (แสดงรายการรีวิวที่เรียงแล้ว) --- */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 no-scrollbar pb-32">
              {filteredReviews.length > 0 ? (
                filteredReviews.map((review, index) => {
                  const formattedDate = review.createdAt
                    ? new Date(review.createdAt).toLocaleDateString("th-TH", {
                        year: "2-digit",
                        month: "short",
                        day: "numeric",
                      })
                    : "เมื่อเร็วๆ นี้";

                  return (
                    <div
                      key={review.id || index}
                      className="bg-white p-5 rounded-[2rem] shadow-sm border border-[#EEE2D1]/40"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              review.user?.avatarUrl ||
                              "https://i.pravatar.cc/150"
                            }
                            className="w-10 h-10 rounded-full object-cover bg-[#F4E8DB]"
                            alt="User"
                          />
                          <div>
                            <h4 className="text-[14px] font-bold text-[#2C241E]">
                              {review.user?.name || "ไม่ระบุชื่อ"}
                            </h4>
                            <span className="text-[10px] text-[#A68F7E]">
                              {formattedDate}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-[2px]">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              fill={
                                i < review.rating ? "#A67045" : "transparent"
                              }
                              className={
                                i < review.rating
                                  ? "text-[#A67045]"
                                  : "text-[#D4C5B9]"
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-[14px] text-[#7A6A5E] leading-relaxed font-medium">
                        {review.comment
                          ? `"${review.comment}"`
                          : "ให้คะแนนโดยไม่มีความคิดเห็น"}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-20 text-[#A8A29F] font-medium italic">
                  ยังไม่มีรีวิวสำหรับร้านนี้
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// 🌟 Sub-component สำหรับปุ่ม Filter
const FilterChip = ({ label, active, onClick, icon }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[13px] font-bold transition-all whitespace-nowrap cursor-pointer ${
      active
        ? "bg-[#A67045] text-white shadow-md shadow-[#A67045]/30"
        : "bg-white text-[#A67045] border border-[#EAD9CF] hover:bg-[#F4E8DB]/30"
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default AllReviews;
