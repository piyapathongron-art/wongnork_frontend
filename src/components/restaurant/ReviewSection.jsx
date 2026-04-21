import React from "react";
import { Star } from "lucide-react";

const ReviewSection = ({ reviewItems, isLoading, onViewAllClick }) => {
  return (
    <section className="mb-8 px-6">
      <div className="flex justify-between items-end mb-4">
        <h3 className="text-xl font-bold text-[#2C241E]">รีวิว</h3>
        {reviewItems.length > 0 && (
          <button
            onClick={onViewAllClick}
            className="text-[13px] font-bold text-[#A67045] hover:underline cursor-pointer"
          >
            ดูทั้งหมด ({reviewItems.length})
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-6 text-[#A67045]">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#A67045]"></div>
          <span className="ml-3 text-sm font-bold">กำลังดึงรีวิว...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 🌟 ถ้า Array ว่าง (ไม่มีรีวิว) ก็จะแสดงกล่อง "ยังไม่มีรีวิว" สวยๆ ไม่พังแน่นอน */}
          {reviewItems.length > 0 ? (
            reviewItems.map((rev, index) => {
              const formattedDate = rev.createdAt
                ? new Date(rev.createdAt).toLocaleDateString("th-TH", {
                    year: "2-digit",
                    month: "short",
                    day: "numeric",
                  })
                : "เมื่อเร็วๆ นี้";

              return (
                <div
                  key={rev.id || index}
                  className="bg-[#F4E8DB] p-6 rounded-[2rem] shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.user?.avatarUrl || "https://i.pravatar.cc/150"}
                        className="w-10 h-10 rounded-full object-cover bg-white"
                        alt={rev.user?.name || "User"}
                      />
                      <div>
                        <h4 className="text-[15px] font-bold text-[#2C241E] block">
                          {rev.user?.name || "ไม่ระบุชื่อ"}
                        </h4>
                        <span className="text-[11px] text-[#A68F7E] block mt-0.5">
                          {formattedDate}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-[2px]">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          fill={i < rev.rating ? "#A67045" : "transparent"}
                          className={
                            i < rev.rating ? "text-[#A67045]" : "text-[#D4C5B9]"
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-[14px] text-[#7A6A5E] leading-relaxed font-medium">
                    {rev.comment ? (
                      `"${rev.comment}"`
                    ) : (
                      <span className="italic text-[#A68F7E] text-xs">
                        ให้คะแนนโดยไม่มีความคิดเห็น
                      </span>
                    )}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="bg-[#F4E8DB]/50 p-6 rounded-[2rem] text-center">
              <p className="text-[#7A6A5E] font-medium">
                ยังไม่มีรีวิวสำหรับร้านนี้ เป็นคนแรกที่รีวิวสิ!
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ReviewSection;
