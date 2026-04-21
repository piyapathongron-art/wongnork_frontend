import React, { Suspense, lazy, useEffect, useState, useRef } from "react";
import RestaurantDetailSheet from "../components/restaurant/RestaurantDetailSheet";
import RestaurantDetail from "./RestaurantDetail";
import { apiGetAllReview } from "../api/reviewApi";
import { apiGetMenuByRestaurantId } from "../api/menuApi";
import { useThemeStore } from "../stores/themeStore";
import useRestaurantStore from "../stores/restaurantStore";
import useUserStore from "../stores/userStore";
import { Store, Plus } from "lucide-react";

const SearchBar = lazy(() => import("../components/SearchBar"));
const MapBox = lazy(() => import("../components/MapBox"));
const ThemeToggleButton = lazy(() => import("../components/ThemeToggleButton"));
const CreateRestaurantModal = lazy(() => import("../components/Modals/CreateRestaurant"));

const HomeMap = () => {
  const mapBoxRef = useRef(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showFullDetail, setShowFullDetail] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const isDark = useThemeStore((state) => state.isDark);
  const user = useUserStore((state) => state.user);
  const { filteredRestaurants, fetchRestaurants } = useRestaurantStore();

  // Role Debugging
  useEffect(() => {
    if (mapBoxRef.current && filteredRestaurants.length > 0) {
      mapBoxRef.current.fitBoundsToCategory(filteredRestaurants);
      console.log("Current Auth Role:", user?.role); // Will now show 'OWNER' after your store fix
    }
  }, [filteredRestaurants, user]); // Added user dependency

  const handleMarkerClick = async (res) => {
    setSelectedRestaurant(res);
    setIsSheetOpen(true);
    try {
      const [rev, menu] = await Promise.all([apiGetAllReview(res.id), apiGetMenuByRestaurantId(res.id)]);
      setSelectedRestaurant(prev => ({ ...prev, reviews: rev.data.data, menu: menu.data.data }));
    } catch (e) { console.error(e); }
  };

  return (
    <div className="w-full h-screen relative overflow-hidden bg-white dark:bg-black touch-none">
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<div className="h-full w-full bg-zinc-900 animate-pulse" />}>
          <MapBox ref={mapBoxRef} onMarkerClick={handleMarkerClick} isDark={isDark} />
        </Suspense>
      </div>

      <div className="fixed top-0 inset-x-0 z-40 flex justify-center px-4 pt-8 pointer-events-none">
        <div className="w-full max-w-[402px] pointer-events-auto flex flex-col items-end gap-3">
          <Suspense fallback={<div className="h-12 w-full bg-white/20 rounded-full" />}>
            <SearchBar 
              onSearchResultClick={(res) => { mapBoxRef.current?.flyToRestaurant(res); handleMarkerClick(res); }}
              onCategoryFilter={(data) => mapBoxRef.current?.fitBoundsToCategory(data)} 
            />
            <ThemeToggleButton />
          </Suspense>
        </div>
      </div>

      {/* FLOATING OWNER BUTTON */}
      {user?.role === "OWNER" && (
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="fixed bottom-24 right-6 z-40 w-16 h-16 bg-[#BC6C25] text-[#F7EAD7] rounded-full shadow-2xl flex flex-col items-center justify-center border-4 border-white dark:border-zinc-900 active:scale-95 transition-transform"
        >
          <Store className="w-6 h-6" />
          <span className="text-[8px] font-black uppercase mt-0.5 tracking-tighter">Add Shop</span>
          <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white dark:border-zinc-900">
            <Plus className="w-3 h-3 text-white" />
          </div>
        </button>
      )}

      <RestaurantDetailSheet isOpen={isSheetOpen} restaurant={selectedRestaurant} onClose={() => setIsSheetOpen(false)} onExpand={() => setShowFullDetail(true)} />

      {showFullDetail && (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-zinc-950">
          <RestaurantDetail restaurant={selectedRestaurant} onBack={() => { setShowFullDetail(false); setIsSheetOpen(true); }} />
        </div>
      )}

      <Suspense fallback={null}>
        {isCreateModalOpen && (
          <CreateRestaurantModal 
            isOpen={isCreateModalOpen} 
            onClose={() => setIsCreateModalOpen(false)} 
            onSuccess={() => fetchRestaurants()} 
          />
        )}
      </Suspense>
    </div>
  );
};

export default HomeMap;