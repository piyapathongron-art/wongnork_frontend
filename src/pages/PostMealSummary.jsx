import React, { useState } from "react";
import { CheckCircle2, Receipt, Users } from "lucide-react";
import CreateReviewModal from "../components/Modals/CreateReviewModal";

const PostMealSummary = () => {
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // Mock ข้อมูลร้านและบิล (ของจริงพี่อาจจะรับมาจาก Context หรือ API ตอนสรุปบิล)
  const mockRestaurantId = "12345"; // ID ร้าน
  const mockRestaurantName = "ชาบูหม่าล่า หวังจื่อ";
  const mockBill = {
    total: 1200,
    myShare: 300,
    members: 4,
  };

  return (
    <div className="min-h-screen bg-[#FFF8F2] flex flex-col items-center justify-center p-6">
      {/* --- กล่องสรุปบิล (เหมือนเดิม) --- */}
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-sm border border-[#EEDCcc] p-8 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle2 size={64} className="text-green-500" />
        </div>

        <h1 className="text-2xl font-extrabold text-[#2C241E] mb-2">
          ชำระเงินเรียบร้อย!
        </h1>
        <p className="text-[#7A6A5E] mb-6 font-medium">
          บิลของกลุ่มคุณที่ {mockRestaurantName}
        </p>

        <div className="bg-[#F4E8DB] rounded-2xl p-4 mb-8">
          <div className="flex justify-between items-center mb-2 text-[#7A6A5E] text-sm">
            <span className="flex items-center gap-1">
              <Receipt size={16} /> ยอดรวม
            </span>
            <span className="font-bold">฿{mockBill.total}</span>
          </div>
          <div className="flex justify-between items-center text-[#7A6A5E] text-sm mb-4">
            <span className="flex items-center gap-1">
              <Users size={16} /> สมาชิก
            </span>
            <span className="font-bold">{mockBill.members} คน</span>
          </div>
          <div className="border-t border-[#EEDCcc]/50 pt-4 flex justify-between items-center">
            <span className="text-[#2C241E] font-bold">ส่วนของคุณ</span>
            <span className="text-2xl font-black text-[#A67045]">
              ฿{mockBill.myShare}
            </span>
          </div>
        </div>

        {/* 🌟 ปุ่มเปิด Modal ของพี่ */}
        <button
          onClick={() => setIsReviewOpen(true)}
          className="w-full bg-[#A67045] text-white py-4 rounded-xl font-bold shadow-lg shadow-[#A67045]/30 active:scale-95 transition-all"
        >
          รีวิวร้านอาหารนี้
        </button>

        <button className="w-full mt-3 text-[#A89F95] font-semibold py-3 active:scale-95 transition-transform">
          กลับสู่หน้าหลัก
        </button>
      </div>

      {/* 🌟 เรียกใช้ Modal ของจริงที่พี่ทำไว้ */}
      <CreateReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        restaurantId={mockRestaurantId}
        onReviewSuccess={() => {
          // รีวิวสำเร็จแล้วให้ทำอะไรต่อ เช่น เด้งกลับหน้า Home หรือโชว์ Toast
          alert("ขอบคุณสำหรับรีวิวครับ!");
          setIsReviewOpen(false);
        }}
      />
    </div>
  );
};

export default PostMealSummary;
