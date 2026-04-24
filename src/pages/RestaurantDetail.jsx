import React, { useState, useEffect } from "react";
import { apiGetAllReview } from "../api/reviewApi";
import { apiGetRestaurantById } from "../api/restaurant";

import { apiToggleSaveRestaurant, apiGetme } from "../api/mainApi";

import { toast } from "sonner";

import {
  ArrowLeft,
  Share2,
  Star,
  Phone,
  Navigation,
  Bookmark,
  Users,
} from "lucide-react";

import MenuSection from "../components/restaurant/MenuSection";
import ReviewSection from "../components/restaurant/ReviewSection";
import {
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router";
import ShareModal from "../components/restaurant/ShareModal";
import AllReviews from "../components/restaurant/AllReviews";
import AllMenus from "../components/restaurant/AllMenus";
import { apiGetMenuByRestaurantId } from "../api/menuApi";

const RestaurantDetail = ({ restaurant: propRestaurant, onBack } = {}) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const context = useOutletContext();
  const location = useLocation();

  // ถ้าได้ restaurant มาจาก prop โดยตรง (render inline จาก HomeMap) ให้ใช้เลย
  // ถ้าไม่ได้ ค่อยไปเช็คจาก context (render ผ่าน router)
  const initialRestaurant = propRestaurant || context?.restaurant || null;
  const [restaurant, setRestaurant] = useState(initialRestaurant);
  const [isLoadingRest, setIsLoadingRest] = useState(!initialRestaurant);
  const [reviewItems, setReviewItems] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const showAllMenus = location.hash === "#menus";
  const showAllReviews = location.hash === "#reviews";

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const handleBack = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onBack) {
      onBack(); // ใช้ callback จาก HomeMap ถ้ามี
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    const fetchSelfData = async () => {
      // ถ้ามี propRestaurant มาแล้ว (inline render) ไม่ต้องโหลด API
      if (propRestaurant) {
        setRestaurant(propRestaurant);
        setIsLoadingRest(false);
        return;
      }

      // ถ้ามีข้อมูลครบจาก context แล้ว ใช้เลย
      if (context?.restaurant?.menus) {
        setRestaurant(context.restaurant);
        setIsLoadingRest(false);
        return;
      }

      // ถ้ามี id จาก route params ค่อยยิง API
      if (id) {
        try {
          setIsLoadingRest(true);
          const res = await apiGetRestaurantById(id);
          const data = res.data?.restaurant || res.data;
          setRestaurant(data);
        } catch (error) {
          console.error("ดึงข้อมูลร้านไม่สำเร็จ:", error);
        } finally {
          setIsLoadingRest(false);
        }
        return;
      }

      // ไม่มีทั้ง prop, context และ id → ไม่ต้องโหลด
      setIsLoadingRest(false);
    };
    fetchSelfData();
  }, [id, context?.restaurant, propRestaurant]);

  // 🌟 จุดที่ต้องแก้: เช็คสถานะจากข้อมูลโปรไฟล์จริง เพื่อให้สีกดแล้วไม่หายตอนกดย้อนกลับ
  useEffect(() => {
    const checkSavedStatus = async () => {
      try {
        const res = await apiGetme();
        // ดึงรายการที่เซฟไว้ทั้งหมดมาเช็ค
        const savedList = res.data?.data?.savedRestaurants || [];

        // ตรวจสอบว่า ID ร้านในหน้านี้ (id) มีอยู่ในรายการที่เซฟไว้ไหม
        const isAlreadySaved = savedList.some(
          (item) => item.restaurantId === id,
        );

        setIsSaved(isAlreadySaved);
      } catch (error) {
        console.error("Error checking saved status:", error);
      }
    };

    if (id) {
      checkSavedStatus();
    }
  }, [id]);

  // 3. ดึงรีวิว
  useEffect(() => {
    if (restaurant?.id) {
      fetchReviews(restaurant.id);
    }
  }, [restaurant?.id]);

  const fetchReviews = async (restaurantId) => {
    try {
      setIsLoadingReviews(true);
      const res = await apiGetAllReview(restaurantId);
      const reviewsData = res.data?.data || res.data || [];
      setReviewItems(reviewsData);

      // console.log("ข้อมูลร้านที่ Backend ส่งมา:", data)
    } catch (error) {
      setReviewItems([]);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  // 🌟 4. ฟังก์ชันจัดการปุ่ม Save (Optimistic UI)
  const handleToggleSave = async () => {
    if (!restaurant?.id) return;

    // สลับสีไอคอนบนหน้าจอทันที (ไม่ต้องรอ API) เพื่อความลื่นไหล
    setIsSaved(!isSaved);

    try {
      // ยิง API ไปจัดการหลังบ้าน
      await apiToggleSaveRestaurant(restaurant.id);

      if (!isSaved) {
        toast.success("บันทึกร้านอาหารลงโปรไฟล์แล้ว");
      }
    } catch (error) {
      // ถ้า API พัง (เช่น เน็ตหลุด) ให้สลับสีไอคอนกลับมาเป็นค่าเดิม
      setIsSaved(isSaved);
      toast.error("เกิดข้อผิดพลาด ไม่สามารถบันทึกได้");
      console.error(error);
    }
  };

  const handleRefreshMenu = async () => {
    const targetId = id || restaurant?.id;
    if (!targetId) return;
    try {
      const res = await apiGetMenuByRestaurantId(restaurant.id);
      const updatedMenu = res.data?.data || [];

      setRestaurant((prev) => ({
        ...prev,
        menu: updatedMenu,
      }));
    } catch (err) {
      console.error("Handle Ref4resh err", err);
    }
  };

  if (isLoadingRest) {
    return (
      <div className="fixed inset-0 bg-base-100 z-[110] flex items-center justify-center">
        <span className="text-accent font-bold animate-pulse">
          กำลังโหลดข้อมูลร้าน...
        </span>
      </div>
    );
  }

  if (!restaurant) return null;

  const menuItems = restaurant?.menus || restaurant?.menu || [];

  const avgRating =
    reviewItems.length > 0
      ? (
          reviewItems.reduce((sum, r) => sum + r.rating, 0) / reviewItems.length
        ).toFixed(1)
      : "New";

  const coverImage =
    restaurant?.images?.find((img) => img.isCover)?.url ||
    restaurant?.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop";

  return (
    <div className="fixed inset-0 bg-base-100 overflow-y-auto z-[200] pb-32">
      <header className="fixed top-0 inset-x-0 z-[210] flex justify-between items-center px-6 py-5 bg-base-100/90 backdrop-blur-md border-b border-base-content/10">
        <button onClick={handleBack} className="p-2 active:scale-90 transition">
          <ArrowLeft size={22} className="text-[#594A3D] cursor-pointer" />
        </button>
        <h1 className="text-sm font-bold text-base-content tracking-wide truncate px-4">
          {restaurant?.name}
        </h1>

        <div className="flex gap-2">
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="p-2 cursor-pointer"
          >
            <Share2 size={20} className="text-[#594A3D]" />
          </button>

          {/* 🌟 5. วางทับปุ่ม Bookmark เดิมตรงนี้เลยครับ! */}
          <button
            onClick={handleToggleSave}
            className="p-2 active:scale-75 transition-transform duration-200 cursor-pointer"
          >
            <Bookmark
              size={22}
              className={isSaved ? "text-[#A67045]" : "text-[#594A3D]"}
              fill={isSaved ? "currentColor" : "none"}
            />
          </button>
        </div>
      </header>

      <section className="pt-24 px-5">
        <div className="w-full h-80 rounded-3xl overflow-hidden shadow-sm bg-[#EAD9CF]">
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
          <h2 className="text-4xl font-extrabold mb-3 text-[#2C241E] leading-tight">
            {restaurant?.name}
          </h2>
          <div className="flex items-center gap-3 text-sm text-[#736356] mb-6 font-medium">
            <Star size={16} fill="#A67045" className="text-[#A67045]" />
            <span className="text-[#2C241E] font-bold">{avgRating}</span>
            <span>({reviewItems.length} reviews)</span>
          </div>

          <div className="flex gap-4">
            <a
              href="https://www.google.com/maps"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-[#F4E8DB] py-3.5 rounded-2xl font-bold text-[#A67045] active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              <Navigation size={18} /> เส้นทาง
            </a>
            {/* <button className="flex-1 flex items-center justify-center gap-2 bg-[#F4E8DB] py-3.5 rounded-2xl font-bold text-[#A67045] active:scale-95 transition-all shadow-sm cursor-pointer">
              <Phone size={18} /> โทร
            </button> */}
          </div>
        </div>
      </section>

      {/* 🌟 แสดงคำอธิบาย (Description) */}
      <section className="px-6 mt-10">
        <h3 className="text-xl font-bold text-[#2C241E] mb-3">เกี่ยวกับ</h3>
        <p className="text-[#7A6A5E] leading-relaxed font-medium text-[15px]">
          {restaurant?.description || "ยังไม่มีคำอธิบายสำหรับร้านอาหารนี้"}
        </p>
      </section>

      {/* 🌟 ส่งเมนูไปแสดงผล */}
      <div className="mt-12">
        <MenuSection
          menuItems={menuItems}
          restaurant={restaurant}
          onViewAllClick={() => navigate("#menus")}
          onMenuUpdate={handleRefreshMenu}
        />
      </div>

      <div className="mt-8">
        <ReviewSection
          reviewItems={reviewItems}
          isLoading={isLoadingReviews}
          onViewAllClick={() => navigate("#reviews")}
        />
      </div>

      <div className="fixed bottom-0 inset-x-0 px-6 py-5 bg-[#FFF8F2]/95 backdrop-blur-md border-t border-[#EEDCcc] z-50">
        <div className="flex">
          <button
            onClick={() => {
              navigate("/party", {
                state: {
                  openCreateModal: true, // 🌟 ตัวนี้จะไปสั่งให้ useEffect ในหน้า Party ของเพื่อนเปลี่ยน isModalOpen เป็น true ทันที
                  restaurantData: restaurant, // 🌟 แถมข้อมูลร้านไปให้ด้วย เผื่อเพื่อนจะเอาไปใช้ใน Modal
                },
              });
            }}
            className="flex-[1.2] bg-[#A67045] text-white py-4 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-[#A67045]/30 active:scale-95 transition-all cursor-pointer"
          >
            <Users size={18} /> Create Group
          </button>
        </div>
      </div>
      <AllReviews
        isOpen={showAllReviews}
        onClose={() => navigate(-1)}
        reviews={reviewItems}
      />
      <AllMenus
        isOpen={showAllMenus}
        onClose={() => navigate(-1)}
        menus={menuItems}
      />
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        restaurant={restaurant}
      />
    </div>
  );
};

export default RestaurantDetail;
