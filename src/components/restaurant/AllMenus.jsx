import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const AllMenus = ({ isOpen, onClose, menus = [] }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end pointer-events-none">
          {/* 🛡️ แผ่นกระจกใสกันผี */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 pointer-events-auto"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          />

          {/* 🌟 แผ่นเมนู (เด้งขึ้นมาจากข้างล่าง) */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full h-full bg-[#FFF8F4] flex flex-col pointer-events-auto shadow-2xl"
          >
            {/* --- Header --- */}
            <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-[#EEE2D1] shrink-0">
              <h2 className="text-xl font-bold text-[#2D3E25]">
                เมนูทั้งหมด ({menus.length})
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

            {/* --- Content --- */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 no-scrollbar">
              {menus.length > 0 ? (
                menus.map((menu, index) => (
                  <div
                    key={index}
                    className="flex gap-4 bg-white p-4 rounded-3xl shadow-sm border border-[#EEE2D1]/50"
                  >
                    {/* รูปเมนู */}
                    <img
                      src={
                        menu.imageUrl ||
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop"
                      }
                      alt={menu.name}
                      className="w-24 h-24 object-cover rounded-2xl bg-[#EAD9CF] shrink-0"
                    />

                    {/* รายละเอียดเมนู */}
                    <div className="flex flex-col justify-between flex-1 py-1">
                      <div>
                        <h4 className="text-[15px] font-bold text-[#2C241E] leading-tight">
                          {menu.name || "ชื่อเมนู"}
                        </h4>
                        <p className="text-[12px] text-[#A68F7E] mt-1 line-clamp-2 leading-relaxed">
                          {menu.description || "ไม่มีคำอธิบายสำหรับเมนูนี้"}
                        </p>
                      </div>
                      <div className="text-[15px] font-bold text-[#A67045] mt-2">
                        ฿{menu.price || "0"}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-[#A8A29F] font-medium">
                  ยังไม่มีเมนู
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AllMenus;
