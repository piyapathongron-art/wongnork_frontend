import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import useUserStore from "./userStore";



const useAiStore = create(
  persist(
    (set, get) => ({
      messages: [
        {
          id: 'welcome',
          type: 'ai',
          aiMessage: `สวัสดีครับ! คุณ ${useUserStore.getState().user?.name?.split(' ')[0] || 'Guest'} ผมคือผู้ช่วย AI ของ Wongnork วันนี้อยากทานอะไรเป็นพิเศษไหมครับ? หรือให้ผมช่วยหาร้านอาหารใกล้คุณดี?`,
          recommendations: []
        }
      ],
      addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
      })),
      clearMessages: () => set({
        messages: [
          {
            id: 'welcome',
            type: 'ai',
            aiMessage: `สวัสดีครับ! คุณ ${useUserStore.getState().user?.name?.split(' ')[0] || 'Guest'} ผมคือผู้ช่วย AI ของ Wongnork วันนี้อยากทานอะไรเป็นพิเศษไหมครับ? หรือให้ผมช่วยหาร้านอาหารใกล้คุณดี?`,
            recommendations: []
          }
        ]
      }),
    }),
    {
      name: "ai-messages",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useAiStore;
