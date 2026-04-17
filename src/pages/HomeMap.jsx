import React, { Suspense, lazy, useEffect, useState } from "react";
import RestaurantDetailSheet from "../components/restaurant/RestaurantDetailSheet";
import { apiGetAllReview } from "../api/reviewApi";
import { apiGetMenuByRestaurantId } from "../api/menuApi";
import RestaurantDetail from "./RestaurantDetail";

const SearchBar = lazy(() => import("../components/SearchBar"));
const MapBox = lazy(() => import("../components/MapBox"));

const HomeMap = () => {
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [showFullDetail, setShowFullDetail] = useState(false);

  const handleMarkerClick = async (restaurantData) => {
    setSelectedRestaurant(restaurantData);
    setIsSheetOpen(true);

    try {
      const [reviewsRes, menusRes] = await Promise.all([
        apiGetAllReview(restaurantData.id),
        apiGetMenuByRestaurantId(restaurantData.id),
      ]);
      const fullReviews = reviewsRes.data.data;
      const fullMenus = menusRes.data.data;

      setSelectedRestaurant((prevData) => {
        if (!prevData || prevData.id !== restaurantData.id) return prevData;
        return {
          ...prevData,
          reviews: fullReviews,
          menu: fullMenus,
        };
      });
    } catch (error) {
      console.error("ดึงข้อมูลรีวิวไม่สำเร็จ:", error);
    }
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
  };

  return (
    <div className="w-full h-screen relative overflow-hidden bg-white touch-none">
      {/* Map Component */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <Suspense
          fallback={
            <div className="absolute inset-0 bg-gray-100 animate-pulse" />
          }
        >
          <MapBox onMarkerClick={handleMarkerClick} />
        </Suspense>
      </div>

      {/* UI Overlay (Search Bar) */}
      <div className="fixed top-0 left-0 right-0 z-40 flex justify-center px-4 pt-8 pb-10 bg-gradient-to-b from-[#FFF8F5] via-[#FFF8F5]/80 to-transparent pointer-events-none">
        <div className="w-full max-w-[402px] pointer-events-auto">
          <Suspense
            fallback={
              <div className="h-12 w-full bg-white/50 rounded-full animate-pulse" />
            }
          >
            <SearchBar />
          </Suspense>
        </div>
      </div>

      {/* Slide-up Detail Sheet */}
      <RestaurantDetailSheet
        isOpen={isSheetOpen}
        restaurant={selectedRestaurant}
        onClose={() => setIsSheetOpen(false)}
        onExpand={() => setShowFullDetail(true)} // 🌟 3. ส่งฟังก์ชันไปให้ Slide-up
      />

      {/* 🌟 4. ถ้าสั่งเปิดหน้าเต็ม ให้โชว์ RestaurantDetail ทับแผนที่ไปเลย */}
      {showFullDetail && selectedRestaurant && (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
          <RestaurantDetail
            restaurant={selectedRestaurant}
            onBack={() => {
              setShowFullDetail(false); // ปิดหน้าเต็ม
              setIsSheetOpen(true); // เด้ง Slide-up กลับมาให้ด้วย
            }}
          />
        </div>
      )}
    </div>
  );
};

export default HomeMap;
