import React, { useState, useEffect } from "react";
import { Search, Loader2, X } from "lucide-react";
import { apiGetRestaurants } from "../api/restaurant";
import RestaurantCard from "../components/restaurant/RestaurantCard";

const Restaurants = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("ทั้งหมด");
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const categories = [
    "ทั้งหมด",
    "Shabu",
    "Cafe",
    "Japanese",
    "BBQ",
    "Thai",
    "Western",
    "Izakaya",
    "Street Food",
  ];

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setIsLoading(true);
      const res = await apiGetRestaurants();
      setRestaurants(res.data?.restaurants || []);
    } catch (error) {
      console.error("Failed to fetch:", error);
      setRestaurants([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ลอจิกกรองข้อมูล
  const filteredRestaurants = Array.isArray(restaurants)
    ? restaurants.filter((rest) => {
        const matchesSearch = rest.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesCategory =
          activeCategory === "ทั้งหมด" || rest.category === activeCategory;
        return matchesSearch && matchesCategory;
      })
    : [];

  // ลอจิก Dropdown Hint
  const searchHints = searchQuery
    ? restaurants
        .filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 5)
    : restaurants.slice(0, 5);

  return (
    <div className="w-full h-[100dvh] bg-[#FFF8F5] text-[#2B361B] pb-32 font-sans overflow-y-auto">
      {/* --- Sticky Header & Search Section --- */}
      <div className="sticky top-0 z-40 bg-[#FFF8F5]/90 backdrop-blur-md px-6 pt-6 pb-4 shadow-sm">
        <h1 className="text-2xl font-extrabold text-[#A65D2E] mb-4">
          Restaurants
        </h1>

        {/* Search Bar with Dropdown */}
        <div className="relative z-[100]">
          <div
            className={`flex items-center bg-white rounded-full px-4 py-3 shadow-sm border transition-colors relative z-20 ${isSearchFocused ? "border-[#A65D2E]" : "border-[#EEE2D1]"}`}
          >
            <Search
              size={18}
              className={isSearchFocused ? "text-[#A65D2E]" : "text-[#A8A29F]"}
            />
            <input
              type="text"
              placeholder="ค้นหาร้านอาหาร..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className="flex-1 bg-transparent border-none outline-none px-3 text-sm text-[#2B361B] placeholder:text-[#A8A29F]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="p-1 rounded-full text-[#A8A29F] hover:text-[#A65D2E] active:scale-95 transition-all"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Search Hints Dropdown */}
          {isSearchFocused && searchHints.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-[#EEE2D1] overflow-hidden z-[100] py-2">
              {!searchQuery && (
                <div className="px-5 py-2 text-[10px] font-bold text-[#A8A29F] uppercase tracking-wider">
                  ร้านอาหารแนะนำ
                </div>
              )}
              {searchHints.map((hint) => (
                <div
                  key={hint.id}
                  onClick={() => {
                    setSearchQuery(hint.name);
                    setIsSearchFocused(false);
                  }}
                  className="px-5 py-3 hover:bg-[#FFF8F5] cursor-pointer flex items-center gap-3 transition-colors"
                >
                  <Search size={14} className="text-[#A8A29F]" />
                  <span className="text-sm font-medium text-[#2B361B] line-clamp-1">
                    {searchQuery
                      ? hint.name
                          .split(new RegExp(`(${searchQuery})`, "gi"))
                          .map((part, i) =>
                            part.toLowerCase() === searchQuery.toLowerCase() ? (
                              <b key={i} className="text-[#A65D2E]">
                                {part}
                              </b>
                            ) : (
                              part
                            ),
                          )
                      : hint.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-4 pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${activeCategory === cat ? "bg-[#A65D2E] text-white" : "bg-white text-[#8B837E] border border-[#EEE2D1]"} cursor-pointer`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* --- Main Content: Restaurant List --- */}
      <div className="px-6 mt-6 flex flex-col gap-5">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#A65D2E]">
            <Loader2 className="animate-spin mb-2" size={32} />
            <span className="text-sm font-bold">
              กำลังโหลดข้อมูลร้านอาหาร...
            </span>
          </div>
        ) : filteredRestaurants.length > 0 ? (
          filteredRestaurants.map((rest) => (
            <RestaurantCard key={rest.id} restaurant={rest} />
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#EEE2D1]/50">
            <p className="text-[#8B837E] font-medium">
              ไม่พบร้านอาหารที่คุณค้นหา
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Restaurants;
