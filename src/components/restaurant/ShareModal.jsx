import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Link, MessageCircle, Send, Share2 } from "lucide-react";
import { toast } from "react-toastify";

const ShareModal = ({ isOpen, onClose, restaurant }) => {
  const shareUrl = restaurant?.id
    ? `${window.location.origin}/restaurant/${restaurant.id}`
    : window.location.href;

  const restaurantName = restaurant?.name || "ร้านอาหาร";

  const shareOptions = [
    {
      name: "LINE",
      icon: <MessageCircle className="text-white" fill="white" size={24} />,
      color: "bg-[#00B900]",
      action: () => {
        const text = `ไปกินร้านนี้กัน! ${restaurantName} ${shareUrl}`;
        // 🌟 ต้องใช้ encodeURIComponent เพื่อให้ภาษาไทยและเว้นวรรคไม่พัง
        window.open(
          `https://line.me/R/msg/text/?${encodeURIComponent(text)}`,
          "_blank",
        );
      },
    },
    {
      name: "Facebook",
      icon: <Share2 className="text-white" size={24} />,
      color: "bg-[#1877F2]",
      action: () => {
        // 🌟 Facebook ต้องการแค่ URL ที่ encode แล้ว
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
          "_blank",
        );
      },
    },
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);

    toast.success("คัดลอกลิงก์เรียบร้อย!", {
      icon: "🔗", // ใส่ไอคอนน่ารักๆ ได้
      style: {
        borderRadius: "16px", // ทำมุมโค้งให้เข้ากับ UI ร้านอาหาร
        background: "#FFF8F4", // สีครีมตามธีมแอป
        color: "#A65D2E", // สีน้ำตาลเข้ม
        fontWeight: "bold",
        fontSize: "14px",
        marginBottom: "80px", // 🌟 สำคัญ! ดันขึ้นหนีแถบ Bottom Bar ของมือถือ
      },
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[200] backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed inset-x-0 bottom-0 z-[201] bg-white rounded-t-[2.5rem] p-8 pb-12 shadow-2xl max-w-[500px] mx-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-[#2D3E25]">
                แชร์ให้เพื่อน
              </h3>
              <button
                onClick={onClose}
                className="p-2 bg-gray-100 rounded-full text-gray-500 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex justify-center items-start gap-6 mb-8 w-full">
              {shareOptions.map((option) => (
                <div
                  key={option.name}
                  className="flex flex-col items-center gap-2 cursor-pointer"
                  onClick={option.action}
                >
                  <div
                    className={`w-14 h-14 ${option.color} rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-transform`}
                  >
                    {option.icon}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    {option.name}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200 flex items-center justify-between">
              <p className="text-[10px] text-gray-400 truncate mr-4">
                {shareUrl}
              </p>
              <button
                onClick={copyToClipboard}
                className="text-[10px] font-bold text-[#A65D2E] cursor-pointer"
              >
                COPY
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;
