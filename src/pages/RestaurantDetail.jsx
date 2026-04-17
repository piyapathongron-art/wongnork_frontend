import React, { useState, useEffect } from "react";
import { apiGetAllReview } from "../api/reviewApi";

import {
  ArrowLeft,
  Share2,
  Heart,
  Star,
  MapPin,
  Phone,
  Navigation,
  Calendar,
  Bike,
} from "lucide-react";

import MenuSection from "../components/restaurant/MenuSection";
import ReviewSection from "../components/restaurant/ReviewSection";

const RestaurantDetail = ({ restaurant, onBack }) => {
  // State สำหรับเก็บข้อมูลรีวิวแยกต่างหากจาก Props
  const [reviewItems, setReviewItems] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  // ดึงรีวิวทันทีที่เปิดหน้า
  useEffect(() => {
    if (restaurant?.id) {
      fetchReviews(restaurant.id);
    }
  }, [restaurant?.id]);

  const fetchReviews = async (restaurantId) => {
    try {
      setIsLoadingReviews(true);
      const res = await apiGetAllReview(restaurantId);
      const reviewsData = res.data.data || [];
      setReviewItems(reviewsData);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      setReviewItems([]);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  // ดึงเมนูจาก Props
  const menuItems = restaurant?.menu || restaurant?.menus || [];

  // คำนวณคะแนนเฉลี่ยจาก State รีวิว
  const reviewCount = reviewItems.length;
  const avgRating =
    reviewCount > 0
      ? (
          reviewItems.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        ).toFixed(1)
      : "New";

  const coverImage =
    restaurant?.images?.find((img) => img.isCover)?.url ||
    restaurant?.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop";

  return (
    <div className="min-h-screen bg-[#FFF8F2] text-[#332B25] pb-32 font-sans selection:bg-[#E8DCC8]">
      <header className="fixed top-0 inset-x-0 z-50 flex justify-between items-center px-6 py-5 bg-[#FFF8F2]/90 backdrop-blur-md">
        <button onClick={onBack} className="p-2 active:scale-90 transition">
          <ArrowLeft size={22} className="text-[#594A3D]" />
        </button>
        <h1 className="text-sm font-bold text-[#332B25] tracking-wide truncate px-4">
          {restaurant?.name}
        </h1>
        <div className="flex gap-2">
          <button className="p-2 active:scale-90 transition">
            <Share2 size={20} className="text-[#594A3D]" />
          </button>
          <button className="p-2 active:scale-90 transition">
            <Heart size={20} className="text-[#594A3D]" />
          </button>
        </div>
      </header>

      <section className="pt-20 px-5">
        <div className="w-full h-[320px] rounded-[2rem] overflow-hidden shadow-sm bg-[#EAD9CF]">
          <img
            src={coverImage}
            alt={restaurant?.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="mt-6 px-1">
          <span className="inline-block px-3 py-1.5 bg-[#EAF0D8] rounded-full text-[11px] font-bold text-[#556B2F] mb-3">
            {restaurant?.category || "ทั่วไป"}
          </span>
          <h2 className="text-4xl font-extrabold mb-3 text-[#2C241E] tracking-tight leading-tight">
            {restaurant?.name}
          </h2>
          <div className="flex items-center gap-3 text-sm text-[#736356] mb-6 font-medium">
            <div className="flex items-center gap-1.5">
              <Star size={16} fill="#A67045" className="text-[#A67045]" />
              <span className="text-[#2C241E] font-bold">{avgRating}</span>
              <span>({reviewCount} reviews)</span>
            </div>
            <span className="text-[#D4C5B9]">•</span>
            <div className="flex items-center gap-1.5">
              <MapPin size={16} className="text-[#A67045]" />
              <span className="truncate max-w-[120px]">ดูบนแผนที่</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="flex-1 flex items-center justify-center gap-2 bg-[#F4E8DB] py-3.5 rounded-2xl font-bold text-[#A67045] active:scale-95 transition-all shadow-sm">
              <Phone size={18} /> โทร
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 bg-[#F4E8DB] py-3.5 rounded-2xl font-bold text-[#A67045] active:scale-95 transition-all shadow-sm">
              <Navigation size={18} /> เส้นทาง
            </button>
          </div>
        </div>
      </section>

      <section className="px-6 mt-10">
        <h3 className="text-xl font-bold text-[#2C241E] mb-3">
          เรื่องราวของเรา
        </h3>
        <p className="text-[#7A6A5E] leading-relaxed font-medium text-[15px]">
          {restaurant?.description || "ยังไม่มีคำอธิบายสำหรับร้านอาหารนี้"}
        </p>
      </section>

      {/* 🌟 4. โยนข้อมูลเมนูไปให้ MenuSection จัดการ */}
      <div className="mt-12">
        <MenuSection menuItems={menuItems} />
      </div>

      {/* 🌟 5. โยน State รีวิวที่ดึงจาก API ไปให้ ReviewSection จัดการ */}
      <div className="mt-8">
        <ReviewSection reviewItems={reviewItems} isLoading={isLoadingReviews} />
      </div>

      <div className="fixed bottom-0 inset-x-0 px-6 py-5 bg-[#FFF8F2]/95 backdrop-blur-md border-t border-[#EEDCcc] z-50">
        <div className="flex gap-3">
          <button className="flex-[0.8] bg-[#F4E8DB] py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-[#A67045] active:scale-95 transition-all">
            <Bike size={18} /> เดลิเวอรี่
          </button>
          <button className="flex-[1.2] bg-[#A67045] text-white py-4 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-[#A67045]/30 active:scale-95 transition-all">
            <Calendar size={18} /> จองโต๊ะ
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetail;
