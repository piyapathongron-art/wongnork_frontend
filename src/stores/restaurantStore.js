import { create } from "zustand";
import { apiGetRestaurants } from "../api/restaurant";

const useRestaurantStore = create((set, get) => ({
  restaurants: [],
  restaurant: null,
  filteredRestaurants: [],
  categories: [],
  selectedCategory: "ทั้งหมด",
  searchQuery: "",
  isLoading: false,

  setRestaurant: (data) => set({restaurant : data}),
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

  applyFilter: () => {
    const { restaurants, selectedCategory, searchQuery } = get();

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

    set({ filteredRestaurants: filtered });
  },
}));

export default useRestaurantStore;
