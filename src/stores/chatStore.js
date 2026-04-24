import { create } from "zustand";

const useChatStore = create((set, get) => ({
  unreadCounts: {}, // { partyId: count }
  isChatOpen: false, // current active chat partyId or false

  setChatOpen: (partyId) => {
    set({ isChatOpen: partyId });
    if (partyId) {
      get().clearUnread(partyId);
    }
  },

  incrementUnread: (partyId) => set((state) => {
    if (state.isChatOpen && String(state.isChatOpen) === String(partyId)) return state;

    return {
      unreadCounts: {
        ...state.unreadCounts,
        [partyId]: (state.unreadCounts[partyId] || 0) + 1
      }
    };
  }),

  clearUnread: (partyId) => set((state) => ({
    unreadCounts: {
      ...state.unreadCounts,
      [partyId]: 0
    }
  })),

  getTotalUnread: () => {
    const counts = get().unreadCounts;
    return Object.values(counts).reduce((sum, count) => sum + count, 0);
  }
}));

export default useChatStore;
