import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Phone,
  Globe,
  Bookmark,
  Share2,
  MoreHorizontal,
} from "lucide-react";

const RestaurantDetailSheet = ({ isOpen, restaurant, onClose }) => {
  const COLLAPSED_HEIGHT = 300;
  console.log("restaurant", restaurant);

  // คำนวณเรตติ้งเฉลี่ยจากรีวิว (ถ้ามี)
  const averageRating = restaurant?.reviews?.length
    ? (
        restaurant.reviews.reduce((sum, rev) => sum + rev.rating, 0) /
        restaurant.reviews.length
      ).toFixed(1)
    : "N/A";

  return (
    <AnimatePresence>
      {isOpen && restaurant && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-40"
          />

          {/* Slide-up Panel */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: COLLAPSED_HEIGHT }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: COLLAPSED_HEIGHT }}
            dragElastic={0.1}
            onDragEnd={(e, info) => {
              if (info.offset.y > 100) onClose();
            }}
            className="fixed inset-x-0 bottom-0 z-50 bg-[#FFF8F4] rounded-t-[2.5rem] shadow-2xl flex flex-col h-[90vh] max-w-[500px] mx-auto overflow-hidden"
          >
            {/* Handle สำหรับลาก */}
            <div className="w-full flex justify-center py-4 shrink-0 bg-[#FFF8F4] z-10">
              <div className="w-12 h-1.5 bg-[#EAD9CF] rounded-full" />
            </div>

            {/* ส่วนที่ Scroll ได้ */}
            <div className="flex-1 overflow-y-auto px-6 pb-10 no-scrollbar">
              {/* 1. Header & Info */}
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-[#2D3E25] tracking-tighter">
                  {restaurant.name || "ไม่ระบุชื่อร้าน"}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[#A65D2E] font-bold">
                    {averageRating} ★
                  </span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-500 text-sm italic">
                    {restaurant.category || "ร้านอาหาร"}
                  </span>
                </div>
                {restaurant.description && (
                  <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                    {restaurant.description}
                  </p>
                )}
              </div>

              {/* 2. Action Buttons */}
              <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar py-2 -mx-2 px-2">
                <button className="flex items-center gap-2 bg-[#A65D2E] text-white px-5 py-2.5 rounded-2xl shrink-0 text-sm font-bold shadow-sm active:scale-95 transition-all">
                  <MapPin size={18} />
                  <span>เส้นทาง</span>
                </button>
                <button className="flex items-center gap-2 bg-white border border-[#EAD9CF] text-[#A65D2E] px-5 py-2.5 rounded-2xl shrink-0 text-sm font-bold active:scale-95 transition-all">
                  <Phone size={18} />
                  <span>โทร</span>
                </button>
                <button className="flex items-center gap-2 bg-white border border-[#EAD9CF] text-[#A65D2E] px-5 py-2.5 rounded-2xl shrink-0 text-sm font-bold active:scale-95 transition-all">
                  <Globe size={18} />
                  <span>เว็บไซต์</span>
                </button>
                <button className="flex items-center gap-2 bg-white border border-[#EAD9CF] text-[#A65D2E] px-5 py-2.5 rounded-2xl shrink-0 text-sm font-bold active:scale-95 transition-all">
                  <Bookmark size={18} />
                  <span>บันทึก</span>
                </button>
                <button className="flex items-center gap-2 bg-white border border-[#EAD9CF] text-[#A65D2E] px-5 py-2.5 rounded-2xl shrink-0 text-sm font-bold active:scale-95 transition-all">
                  <Share2 size={18} />
                  <span>แชร์</span>
                </button>
                <button className="flex items-center gap-2 bg-white border border-[#EAD9CF] text-[#A65D2E] px-5 py-2.5 rounded-2xl shrink-0 text-sm font-bold active:scale-95 transition-all">
                  <MoreHorizontal size={18} />
                  <span>เพิ่มเติม</span>
                </button>
              </div>

              {/* 3. รูปภาพร้าน */}
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
                  รูปภาพ
                </h3>
                <div className="flex gap-3 overflow-x-auto no-scrollbar">
                  {restaurant.images && restaurant.images.length > 0 ? (
                    restaurant.images.map((img, index) => (
                      <img
                        key={index}
                        src={img.url}
                        alt={`${restaurant.name} - ${index}`}
                        className="w-40 h-28 object-cover bg-[#EAD9CF] rounded-2xl shrink-0 shadow-sm"
                      />
                    ))
                  ) : (
                    <div className="w-40 h-28 bg-[#EAD9CF] rounded-2xl shrink-0 flex items-center justify-center text-gray-400 italic text-xs">
                      ไม่มีรูปภาพ
                    </div>
                  )}
                </div>
              </div>

              {/* 4. เมนูแนะนำ */}
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
                  เมนูยอดนิยม
                </h3>
                <div className="space-y-3">
                  {restaurant.menu && restaurant.menu.length > 0 ? (
                    restaurant.menu.map((menu, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center bg-white p-4 rounded-xl border border-orange-50/50 shadow-sm"
                      >
                        <div>
                          <span className="text-[#2D3E25] font-medium block">
                            {menu.name}
                          </span>
                          <span className="text-xs text-gray-400">
                            {menu.category}
                          </span>
                        </div>
                        <span className="text-[#A65D2E] font-bold">
                          ฿{menu.price}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      ยังไม่มีข้อมูลเมนู
                    </p>
                  )}
                </div>
              </div>

              {/* 5. รีวิว */}
              <div className="mb-8">
                <div className="flex justify-between items-end mb-3">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                    รีวิวจากลูกค้า
                  </h3>
                  {restaurant.reviews && restaurant.reviews.length > 0 && (
                    <button className="text-[10px] font-bold text-[#A65D2E] uppercase underline">
                      ดูทั้งหมด ({restaurant.reviews.length})
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  {restaurant.reviews && restaurant.reviews.length > 0 ? (
                    restaurant.reviews.map((rev, index) => (
                      <div
                        key={index}
                        className="border-b border-gray-100 pb-3"
                      >
                        <div className="flex justify-between mb-1">
                          <span className="font-bold text-sm text-[#2D3E25]">
                            {rev.user?.name || "ไม่ระบุชื่อ"}
                          </span>
                          <span className="text-[#A65D2E] text-xs">
                            {"★".repeat(rev.rating)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {rev.comment}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      ยังไม่มีรีวิวสำหรับร้านนี้
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RestaurantDetailSheet;
