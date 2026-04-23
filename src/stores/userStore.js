import { createJSONStorage, persist } from "zustand/middleware";
import { apiGetme, apiGoogle, apiLogin, apiRegister } from "../api/mainApi";
import { create } from "zustand";

const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLogin: false,
      login: async (body) => {
        const resp = await apiLogin(body);
        // console.log(resp);
        set({ token: resp.data.token, isLogin: true });
        const getInfo = await apiGetme()
        const userData = getInfo.data.user || getInfo.data.data || getInfo.data
        // console.log(userData)
        set({ user: userData })
        // console.log("user =", user)
        return resp;
      },
      googleLogin: async (body) => {
        const { user, token } = body
        set({ user: user, token: token, isLogin: true });

      },
      register: async (body) => {
        const resp = await apiRegister(body);
        return resp;
      },
      fetchMe: async () => {
        try {
          const getInfo = await apiGetme();
          const userData = getInfo.data.user || getInfo.data.data || getInfo.data;
          set({ user: userData });
          return userData;
        } catch (error) {
          console.error("Fetch me failed", error);
        }
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
