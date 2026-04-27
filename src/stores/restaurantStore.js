import { create } from "zustand";
import { apiGetRestaurants } from "../api/restaurant";
import calculateDistance from "../utils/distance.ustils";

const useRestaurantStore = create((set, get) => ({
  restaurants: [],
  restaurant: null,
  filteredRestaurants: [],
  categories: [],
  selectedCategory: "ทั้งหมด",
  searchQuery: "",
  isLoading: false,
  userLocation: null,


  setRestaurant: (data) => set({ restaurant: data }),
  setRestaurants: (data) => {
    set({ restaurants: data });
    get().applyFilter();
  },

  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
    get().applyFilter();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().applyFilter();
  },

  selectedRestaurant: null,
  isSheetOpen: false,
  showFullDetail: false,

  setSelectedRestaurant: (rest) => set({ selectedRestaurant: rest }),
  setIsSheetOpen: (isOpen) => set({ isSheetOpen: isOpen }),
  setShowFullDetail: (isShow) => set({ showFullDetail: isShow }),

  clearSelection: () =>
    set({
      selectedRestaurant: null,
      isSheetOpen: false,
      showFullDetail: false,
      mapViewState: null,
    }),

  fetchRestaurants: async () => {
    set({ isLoading: true });
    try {
      const res = await apiGetRestaurants();
      const data = res.data.restaurants || [];
      set({ restaurants: data });
      get().applyFilter();
    } catch (error) {
      console.error("Fetch restaurants error:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  setSortBy: (sort) => {
    if (get().sortBy === sort) return

    set({ sortBy: sort })
    get().applyFilter()
  },

  setUserLocation: (loc) => {
    const currentLoc = get().userLocation
    if (currentLoc?.lat === loc.lat && currentLoc.lng === loc.lng) return

    set({ userLocation: loc })
    get().applyFilter()
  },

  applyFilter: () => {
    const { restaurants, selectedCategory, searchQuery, sortBy, userLocation } = get();

    const filtered = restaurants.filter((rest) => {
      // 1. เช็คคำค้นหา
      const matchesSearch = rest.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      // 2. เช็คหมวดหมู่
      const matchesCategory =
        selectedCategory === "ทั้งหมด" || rest.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    // Sort
    if (sortBy === "distance" && userLocation) {
      filtered.sort((a, b) => {
        const distA = calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng)
        const distB = calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng)

        return distA - distB
      })
    } else if (sortBy === "reviews") {
      filtered.sort((a, b) => {
        const getAvg = (revs) => revs?.length > 0
          ? revs.reduce((sum, r) => sum + r.rating, 0) / revs.length : 0
        return getAvg(b.reviews) - getAvg(a.reviews)
      })
    }

    set({ filteredRestaurants: filtered });
  },
}));

export default useRestaurantStore;
