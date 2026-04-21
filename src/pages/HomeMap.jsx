import React, { Suspense, lazy, useEffect, useRef } from "react";
import RestaurantDetailSheet from "../components/restaurant/RestaurantDetailSheet";
import { apiGetAllReview } from "../api/reviewApi";
import { apiGetMenuByRestaurantId } from "../api/menuApi";
import { useThemeStore } from "../stores/themeStore";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useSheetStore } from "../stores/sheetStore";
import useRestaurantStore from "../stores/restaurantStore";

const SearchBar = lazy(() => import("../components/SearchBar"));
const MapBox = lazy(() => import("../components/MapBox"));
const ThemeToggleButton = lazy(() => import("../components/ThemeToggleButton"));

const HomeMap = () => {
  const {
    selectedRestaurant,
    isSheetOpen,
    openSheet,
    closeSheet,
    clearRestaurant,
    updateRestaurantDetails,
  } = useSheetStore();

  const navigate = useNavigate();
  const location = useLocation();
  const mapBoxRef = useRef(null);

  const isDark = useThemeStore((state) => state.isDark);
  // console.log("isDark", isDark);
  const initTheme = useThemeStore((state) => state.initTheme);

  const filteredRestaurants = useRestaurantStore(
    (state) => state.filteredRestaurants,
  );

  useEffect(() => {
    if (mapBoxRef.current && filteredRestaurants.length > 0) {
      mapBoxRef.current.fitBoundsToCategory(filteredRestaurants);
    }
  }, [filteredRestaurants]);

  useEffect(() => {
    if (location.pathname === "/" && selectedRestaurant && !isSheetOpen) {
      openSheet(selectedRestaurant);
    }
  }, [location.pathname, selectedRestaurant, isSheetOpen, openSheet]);

  const handleMarkerClick = async (restaurantData) => {
    openSheet(restaurantData);
    try {
      const [reviewsRes, menusRes] = await Promise.all([
        apiGetAllReview(restaurantData.id),
        apiGetMenuByRestaurantId(restaurantData.id),
      ]);
      const fullReviews = reviewsRes.data?.data || [];
      const fullMenus = menusRes.data?.data || [];

      updateRestaurantDetails(restaurantData.id, fullReviews, fullMenus);
    } catch (error) {
      console.error("ดึงข้อมูลไม่สำเร็จ:", error);
    }
  };

  const handleSearchResultClick = (restaurantData) => {
    if (mapBoxRef.current) {
      mapBoxRef.current.flyToRestaurant(restaurantData);
    }
    handleMarkerClick(restaurantData);
  };

  const handleCategoryChange = (filteredData) => {
    if (mapBoxRef.current && filteredData && filteredData.length > 0) {
      mapBoxRef.current.fitBoundsToCategory(filteredData);
    }
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
  };

  return (
    <div className="w-full h-screen relative overflow-hidden bg-white dark:bg-black touch-none">
      {/* Change dark color later */}
      {/* Map Component */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <Suspense
          fallback={
            <div className="absolute inset-0 bg-gray-100 dark:bg-zinc-900 animate-pulse" /> //Change dark color later//
          }
        >
          <MapBox
            ref={mapBoxRef}
            onMarkerClick={handleMarkerClick}
            isDark={isDark}
          />
        </Suspense>
      </div>
      {/* UI Overlay (Search Bar) */}
      <div className="fixed top-0 left-0 right-0 z-40 flex justify-center px-4 pt-8 pb-10 bg-gradient-to-b from-[#FFF8F5] via-[#FFF8F5]/80 to-transparent dark:from-black dark:via-black/80 pointer-events-none">
        {/* Change dark color later */}
        <div className="w-screen max-w-[402px] pointer-events-auto flex flex-col items-end gap-3">
          <Suspense
            fallback={
              <div className="h-12 w-full bg-white/50 rounded-full animate-pulse" />
            }
          >
            <SearchBar
              onSearchResultClick={handleSearchResultClick}
              onCategoryFilter={handleCategoryChange}
            />
            <ThemeToggleButton />
          </Suspense>
        </div>
      </div>
      {/* Slide-up Detail Sheet */}
      <RestaurantDetailSheet
        isOpen={isSheetOpen}
        restaurant={selectedRestaurant}
        onClose={() => {
          closeSheet();
          setTimeout(() => clearRestaurant(), 300);
        }}
        onExpand={() => {
          navigate(`/restaurant/${selectedRestaurant.id}`);
        }}
      />
      <Outlet context={{ restaurant: selectedRestaurant }} />
    </div>
  );
};

export default HomeMap;
