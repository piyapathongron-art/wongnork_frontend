import { createJSONStorage, persist } from "zustand/middleware";
import { apiLogin } from "../api/mainApi";
import { create } from "zustand";

const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLogin: false,
      login: async (body) => {
        const resp = await apiLogin(body);
        console.log(resp);
        if (resp.data.status === "success") {
          set({ user: resp.data.user, token: resp.data.token, isLogin: true });
        }
        return resp;
      },
      logout: async () => {
        set({ user: null, token: null, isLogin: false });
      },
    }),
    {
      name: "user",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default useUserStore;
