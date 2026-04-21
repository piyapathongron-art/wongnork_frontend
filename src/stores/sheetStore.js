import { create } from "zustand";

export const useSheetStore = create((set) => ({
  selectedRestaurant: null,
  isSheetOpen: false,

  openSheet: (restaurant) =>
    set({
      selectedRestaurant: restaurant,
      isSheetOpen: true,
    }),

  closeSheet: () =>
    set({
      isSheetOpen: false,
    }),

  clearRestaurant: () =>
    set({
      selectedRestaurant: null,
    }),

  updateRestaurantDetails: (restaurantId, newReviews, newMenu) =>
    set((state) => {
      if (
        !state.selectedRestaurant ||
        state.selectedRestaurant.id !== restaurantId
      ) {
        return state;
      }
      return {
        selectedRestaurant: {
          ...state.selectedRestaurant,
          reviews: newReviews,
          menu: newMenu,
        },
      };
    }),
}));
