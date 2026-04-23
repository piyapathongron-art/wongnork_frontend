import React from "react";
import { MailCheck, X } from "lucide-react";

const VerifyEmailModal = ({ isOpen, onClose }) => {
  // ถ้า isOpen เป็น false ไม่ต้อง render อะไรเลย (ซ่อนไว้)
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FFF8F4] w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative animate-fade-up border border-[#EAD9CF]">
        {/* ปุ่มปิด (X) */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 bg-[#EAD9CF]/40 hover:bg-[#EAD9CF] p-1.5 rounded-full transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* เนื้อหา Modal */}
        <div className="flex flex-col items-center text-center mt-2">
          <div className="w-16 h-16 bg-[#F7EAD7] text-[#A65D2E] rounded-full flex items-center justify-center mb-4 shadow-inner">
            <MailCheck size={32} strokeWidth={2.5} />
          </div>

          <h2 className="text-xl font-extrabold text-[#2B361B] mb-2">
            บัญชีของคุณยังไม่ได้รับการยืนยัน
          </h2>

          <p className="text-xs text-gray-500 leading-relaxed mb-6 px-2">
            กรุณาตรวจสอบกล่องจดหมายอีเมลของคุณ (รวมถึงโฟลเดอร์จดหมายขยะ)
            และคลิกลิงก์เพื่อยืนยันบัญชีผู้ใช้ ก่อนเข้าสู่ระบบ
          </p>

          <button
            onClick={onClose}
            className="w-full bg-[#A65D2E] hover:bg-[#8e4f27] text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-95 transition-all cursor-pointer text-sm tracking-wide"
          >
            รับทราบ
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailModal;
