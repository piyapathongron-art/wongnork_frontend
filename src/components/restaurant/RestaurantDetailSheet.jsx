import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, Globe, Bookmark, Share2, Star } from "lucide-react";
import { useNavigate } from "react-router";
import { apiGetAllReview } from "../../api/reviewApi";

import MenuSection from "./MenuSection";
import ReviewSection from "./ReviewSection";

const RestaurantDetailSheet = ({ isOpen, restaurant, onClose, onExpand }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState("half");
  const [reviewItems, setReviewItems] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  useEffect(() => {
    if (isOpen && restaurant?.id) {
      setStep("half");
      fetchReviews(restaurant.id);
    }
  }, [isOpen, restaurant?.id]);

  const fetchReviews = async (restaurantId) => {
    try {
      setIsLoadingReviews(true);
      const res = await apiGetAllReview(restaurantId);
      setReviewItems(res.data.data || res.data || []);
    } catch (error) {
      setReviewItems([]);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const yPosition = step === "half" ? 400 : 100;
  const menuItems = restaurant?.menu || restaurant?.menus || [];

  const averageRating =
    reviewItems.length > 0
      ? (
          reviewItems.reduce((sum, rev) => sum + rev.rating, 0) /
          reviewItems.length
        ).toFixed(1)
      : "New";

  return (
    <AnimatePresence>
      {isOpen && restaurant && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-40"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: yPosition }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.1}
            onDragEnd={(e, info) => {
              const { y } = info.offset;
              if (step === "half") {
                if (y < -50) setStep("high");
                else if (y > 100) onClose();
              } else if (step === "high") {
                if (y < -50) {
                  onClose();
                  onExpand();
                } else if (y > 50) setStep("half");
              }
            }}
            className="fixed inset-x-0 bottom-0 z-50 bg-[#FFF8F4] rounded-t-[2.5rem] shadow-2xl flex flex-col h-[90vh] max-w-[500px] mx-auto overflow-hidden"
          >
            <div className="w-full flex justify-center py-4 shrink-0 bg-[#FFF8F4] z-10 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 bg-[#EAD9CF] rounded-full" />
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-10 no-scrollbar">
              {/* 1. Header & Info */}
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-[#2D3E25] tracking-tighter">
                  {restaurant.name || "ไม่ระบุชื่อร้าน"}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="flex items-center gap-1 text-[#A65D2E] font-bold">
                    {averageRating} <Star size={14} fill="currentColor" />
                  </span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-500 text-sm italic">
                    {restaurant.category || "ร้านอาหาร"}
                  </span>
                </div>
                {restaurant.description && (
                  <p className="text-sm text-gray-600 mt-3 leading-relaxed line-clamp-3">
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
                {/* ปุ่มอื่นๆ ย่อบรรทัดให้สั้นลงได้ครับ */}
                <button className="flex items-center gap-2 bg-white border border-[#EAD9CF] text-[#A65D2E] px-5 py-2.5 rounded-2xl shrink-0 text-sm font-bold">
                  <Phone size={18} />
                  <span>โทร</span>
                </button>
                <button className="flex items-center gap-2 bg-white border border-[#EAD9CF] text-[#A65D2E] px-5 py-2.5 rounded-2xl shrink-0 text-sm font-bold">
                  <Globe size={18} />
                  <span>เว็บไซต์</span>
                </button>
              </div>

              {/* 3. รูปภาพ */}
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
                  รูปภาพ
                </h3>
                <div className="flex gap-3 overflow-x-auto no-scrollbar">
                  {restaurant.images?.map((img, index) => (
                    <img
                      key={index}
                      src={img.url}
                      alt={`img-${index}`}
                      className="w-40 h-28 object-cover bg-[#EAD9CF] rounded-2xl shrink-0 shadow-sm"
                    />
                  ))}
                </div>
              </div>

              <MenuSection menuItems={menuItems} />

              {/* 🌟 เรียกใช้ Component รีวิวที่หั่นมา พร้อมโยน State ลงไป */}
              <ReviewSection
                reviewItems={reviewItems}
                isLoading={isLoadingReviews}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RestaurantDetailSheet;
