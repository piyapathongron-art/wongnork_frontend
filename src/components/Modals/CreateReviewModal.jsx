import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Star, X, MessageSquare } from "lucide-react";
import { apiCreateReview } from "../../api/reviewApi";

const CreateReviewModal = ({
  isOpen,
  onClose,
  restaurantId,
  onReviewSuccess,
}) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. เตรียม Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  if (!isOpen) return null;

  // 2. ฟังก์ชันตอนกดส่ง
  const onSubmit = async (data) => {
    if (rating === 0) {
      alert("กรุณาให้คะแนนดาวด้วยครับพี่");
      return;
    }

    try {
      setIsSubmitting(true);
      const body = {
        rating: Number(rating),
        comment: data.comment,
      };

      await apiCreateReview(restaurantId, body);

      // ถ้าสำเร็จ
      reset(); // ล้างฟอร์ม
      setRating(0); // ล้างดาว
      onReviewSuccess(); // เรียกฟังก์ชันให้หน้าหลักดึงรีวิวใหม่
      onClose(); // ปิด Modal
    } catch (error) {
      console.error("ส่งรีวิวไม่สำเร็จ:", error);
      alert("เกิดข้อผิดพลาด ลองใหม่อีกครั้งครับ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#2D3E25]">เขียนรีวิว</h2>
          <button
            onClick={onClose}
            className="p-2 bg-[#F4E8DB] rounded-full text-[#A67045]"
          >
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* ส่วนการเลือกดาว */}
          <div className="flex flex-col items-center py-4 bg-[#FFF8F4] rounded-3xl border border-[#EAD9CF]/50">
            <p className="text-sm font-bold text-[#A67045] mb-3 uppercase tracking-widest">
              ความพึงพอใจ
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="transition-transform active:scale-125"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                >
                  <Star
                    size={36}
                    fill={(hover || rating) >= star ? "#A67045" : "none"}
                    className={
                      (hover || rating) >= star
                        ? "text-[#A67045]"
                        : "text-[#EAD9CF]"
                    }
                    strokeWidth={2}
                  />
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-[#7A6A5E] font-medium">
              {rating > 0 ? `คุณให้ ${rating} คะแนน` : "แตะเพื่อเลือกคะแนน"}
            </p>
          </div>

          {/* ส่วนพิมพ์คอมเมนต์ */}
          <div className="relative">
            <div className="absolute top-4 left-4 text-[#A67045]">
              <MessageSquare size={18} />
            </div>
            <textarea
              {...register("comment", {
                required: "บอกความรู้สึกหน่อยครับพี่",
              })}
              placeholder="รสชาติเป็นยังไงบ้าง? บริการดีไหม?"
              className="w-full bg-[#FBF7F4] border border-[#EAD9CF] rounded-3xl p-4 pl-12 h-32 text-sm focus:outline-none focus:ring-2 focus:ring-[#A67045]/20 resize-none"
            />
            {errors.comment && (
              <p className="text-red-500 text-xs mt-1 ml-4">
                {errors.comment.message}
              </p>
            )}
          </div>

          {/* ปุ่ม Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all active:scale-95 ${
              isSubmitting
                ? "bg-gray-300"
                : "bg-[#A67045] text-white shadow-[#A67045]/30"
            }`}
          >
            {isSubmitting ? "กำลังส่ง..." : "ส่งรีวิวเลย"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateReviewModal;
