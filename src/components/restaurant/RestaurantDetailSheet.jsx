import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Share2, Star, Navigation } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { apiToggleSaveRestaurant, apiGetme } from "../../api/mainApi";
import { toast } from "react-toastify";

// Components
import MenuSection from "./MenuSection";
import ReviewSection from "./ReviewSection";
import ShareModal from "./ShareModal";
import AllReviews from "./AllReviews";
import AllMenus from "./AllMenus";

// Stores
import useRestaurantStore from "../../stores/restaurantStore";

const RestaurantDetailSheet = ({ isOpen, restaurant, onClose, onExpand }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState("half");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const showAllMenus = location.hash === "#menus";
  const showAllReviews = location.hash === "#reviews";

  // 🌟 1. Get the setter action from the store at the TOP LEVEL
  const setStoreRestaurant = useRestaurantStore((state) => state.setRestaurant);

  // 🌟 2. Sync the incoming prop to the Global Store correctly
  useEffect(() => {
    if (restaurant) {
      setStoreRestaurant(restaurant);
    }
  }, [restaurant, setStoreRestaurant]);

  // Handle route changes
  useEffect(() => {
    if (location.pathname === "/") {
      setStep("half");
    }
  }, [location.pathname]);

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!restaurant?.id) return;
      try {
        const res = await apiGetme();
        const savedList = res.data?.data?.savedRestaurants || [];
        const isAlreadySaved = savedList.some(
          (item) => item.restaurantId === restaurant.id,
        );
        setIsSaved(isAlreadySaved);
      } catch (error) {
        console.error("Error checking saved status:", error);
      }
    };

    if (isOpen && restaurant?.id) {
      checkSavedStatus();
    }
  }, [restaurant?.id, isOpen]);

  const handleToggleSave = async () => {
    if (!restaurant?.id) return;

    setIsSaved(!isSaved);

    try {
      await apiToggleSaveRestaurant(restaurant.id);
      if (!isSaved) {
        toast.success("บันทึกร้านอาหารลงโปรไฟล์แล้ว");
      }
    } catch (error) {
      setIsSaved(isSaved);
      toast.error("เกิดข้อผิดพลาด ไม่สามารถบันทึกได้");
      console.error(error);
    }
  };

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!restaurant?.id) return;
      try {
        const res = await apiGetme();
        const savedList = res.data?.data?.savedRestaurants || [];
        const isAlreadySaved = savedList.some(
          (item) => item.restaurantId === restaurant.id,
        );
        setIsSaved(isAlreadySaved);
      } catch (error) {
        console.error("Error checking saved status:", error);
      }
    };

    if (isOpen && restaurant?.id) {
      checkSavedStatus();
    }
  }, [restaurant?.id, isOpen]);

  // Data helpers
  const menuItems = restaurant?.menus || restaurant?.menu || [];
  const reviewItems = restaurant?.reviews || [];
  const isLoadingReviews = !restaurant?.reviews;

  const averageRating =
    reviewItems.length > 0
      ? (
          reviewItems.reduce((sum, rev) => sum + rev.rating, 0) /
          reviewItems.length
        ).toFixed(1)
      : "New";

  const handleSafeClose = () => {
    if (location.pathname === "/") {
      onClose();
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

  return (
    <>
      <AnimatePresence>
        {isOpen && restaurant && (
          <motion.div
            key="sheet-container"
            className="fixed inset-0 z-50 pointer-events-none"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  handleSafeClose();
                }
              }}
              className="absolute inset-0 bg-black/20 pointer-events-auto"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: step === "half" ? "50%" : "0%" }} // Set to 0% for full height
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.1}
              onDragEnd={(e, info) => {
                const { y } = info.offset;
                if (step === "half") {
                  if (y < -50) setStep("high");
                  else if (y > 100) handleSafeClose();
                } else if (step === "high") {
                  if (y < -20) {
                    if (onExpand) onExpand();
                  } else if (y > 50) setStep("half");
                }
              }}
              className="absolute inset-x-0 bottom-0 bg-[#FFF8F4] rounded-t-[2.5rem] shadow-2xl flex flex-col h-[95vh] max-w-[500px] mx-auto overflow-hidden pointer-events-auto"
            >
              {/* Drag Handle */}
              <div className="w-full flex justify-center py-4 shrink-0 bg-[#FFF8F4] z-10 cursor-grab">
                <div className="w-12 h-1.5 bg-[#EAD9CF] rounded-full" />
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 pb-20 no-scrollbar">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-[#2D3E25] tracking-tighter">
                    {restaurant.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 text-[#A65D2E] font-bold">
                      {averageRating} <Star size={14} fill="currentColor" />
                    </span>
                    <span className="text-gray-400">|</span>
                    <span className="text-[#A65D2E] text-sm font-bold uppercase tracking-wider">
                      {restaurant.category || "ร้านอาหาร"}
                    </span>
                  </div>
                  {restaurant.description && (
                    <p className="text-sm text-[#7A6A5E] mt-3 leading-relaxed line-clamp-3 font-medium">
                      {restaurant.description}
                    </p>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar py-2">
                  <a
                    href="https://www.google.com/maps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[#A65D2E] text-white px-5 py-2.5 rounded-2xl shrink-0 text-sm font-bold active:scale-95 transition-all cursor-pointer"
                  >
                    <Navigation size={18} />
                    <span>เส้นทาง</span>
                  </a>
                  <button
                    onClick={handleToggleSave}
                    className={`flex items-center gap-2 border px-5 py-2.5 rounded-2xl shrink-0 text-sm font-bold active:scale-95 transition-all cursor-pointer ${
                      isSaved
                        ? "bg-[#F4E8DB] border-[#F4E8DB] text-[#A67045]"
                        : "bg-white border-[#EAD9CF] text-[#A65D2E]"
                    }`}
                  >
                    <Bookmark
                      size={18}
                      fill={isSaved ? "currentColor" : "none"}
                    />
                    <span>{isSaved ? "บันทึกแล้ว" : "บันทึก"}</span>
                  </button>
                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="flex items-center gap-2 bg-white border border-[#EAD9CF] text-[#A65D2E] px-5 py-2.5 rounded-2xl shrink-0 text-sm font-bold active:scale-95 transition-all shadow-sm cursor-pointer"
                  >
                    <Share2 size={18} />
                    <span>แชร์</span>
                  </button>
                </div>

                {/* Gallery */}
                <div className="mb-8">
                  <h3 className="text-[11px] font-bold text-[#A8A29F] uppercase tracking-widest mb-3">
                    รูปภาพและวิดีโอ
                  </h3>
                  <div className="flex gap-3 overflow-x-auto no-scrollbar">
                    {restaurant.images?.map((img, index) => (
                      <img
                        key={index}
                        src={img.url}
                        alt={`img-${index}`}
                        className="w-44 h-32 object-cover bg-[#EAD9CF] rounded-2xl shrink-0 shadow-sm border border-[#EEE2D1]/50"
                      />
                    ))}
                  </div>
                </div>

                {/* Sections */}
                <div className="space-y-10">
                  <MenuSection
                    menuItems={menuItems}
                    restaurant={restaurant}
                    onViewAllClick={() => navigate("#menus")}
                    onMenuUpdate={handleRefreshMenu}
                  />
                  <ReviewSection
                    reviewItems={reviewItems}
                    isLoading={isLoadingReviews}
                    onViewAllClick={() => navigate("#reviews")}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
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
    </>
  );
};

export default RestaurantDetailSheet;
