import { create } from 'zustand';
import { apiGetRestaurants } from '../api/restaurant';

const useRestaurantStore = create((set, get) => ({
  restaurants: [],
  filteredRestaurants: [],
  selectedCategory: 'ทั้งหมด',
  isLoading: false,

  setRestaurants: (data) => {
    set({ restaurants: data });
    get().applyFilter();
  },

  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
    get().applyFilter();
  },

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
    const { restaurants, selectedCategory } = get();
    if (selectedCategory === 'ทั้งหมด') {
      set({ filteredRestaurants: restaurants });
    } else {
      const filtered = restaurants.filter(r => r.category === selectedCategory);
      set({ filteredRestaurants: filtered });
    }
  }
}));

export default useRestaurantStore;
